// Downscales the project screenshots into public/images/work/.
//
// The originals are around 1900px wide and between 450KB and 1.6MB each —
// roughly 6MB for the set. They are displayed in a frame no wider than about
// 700px, so most of those bytes are pixels nobody will ever see, on a site
// whose argument includes knowing better than that.
//
// There is no image library available here and no browser to render with, so
// this decodes the PNG, averages it down and re-encodes it. Area averaging
// rather than nearest-neighbour: screenshots are full of one-pixel text
// strokes, and dropping pixels turns those into noise while averaging them
// turns them into a softer stroke, which is what a smaller screenshot should
// look like.
//
// Run: node scripts/optimise-shots.mjs

import { deflateSync, inflateSync } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const SOURCE = '../backend/recentwork_showcases';
const OUT_DIR = 'public/images/work';
const MAX_WIDTH = 1000;

/* ---------------- PNG decode ---------------- */

function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');

  let offset = 8;
  let width = 0; let height = 0; let depth = 0; let colorType = 0; let interlace = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') break;

    offset += 12 + length;
  }

  if (depth !== 8) throw new Error(`bit depth ${depth} unsupported`);
  if (interlace !== 0) throw new Error('interlaced PNG unsupported');
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`colour type ${colorType} unsupported`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);

  // Undo the per-scanline filters. Each line picks its own, and each refers
  // to the reconstructed line above, so this has to run in order.
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos]; pos += 1;
    const line = raw.subarray(pos, pos + stride); pos += stride;
    const out = pixels.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;

    for (let x = 0; x < stride; x++) {
      const rawByte = line[x];
      const a = x >= channels ? out[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let value;
      switch (filter) {
        case 0: value = rawByte; break;
        case 1: value = rawByte + a; break;
        case 2: value = rawByte + b; break;
        case 3: value = rawByte + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
          value = rawByte + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error(`filter ${filter} unknown`);
      }
      out[x] = value & 0xff;
    }
  }

  return { width, height, channels, pixels };
}

/* ---------------- Downscale ---------------- */

function resize(src, targetWidth) {
  const { width, height, channels, pixels } = src;
  if (width <= targetWidth) return { width, height, out: pixels, channels };

  const scale = width / targetWidth;
  const outWidth = targetWidth;
  const outHeight = Math.max(1, Math.round(height / scale));
  const out = Buffer.alloc(outWidth * outHeight * 3);

  for (let y = 0; y < outHeight; y++) {
    const y0 = Math.floor(y * scale);
    const y1 = Math.min(height, Math.max(y0 + 1, Math.floor((y + 1) * scale)));
    for (let x = 0; x < outWidth; x++) {
      const x0 = Math.floor(x * scale);
      const x1 = Math.min(width, Math.max(x0 + 1, Math.floor((x + 1) * scale)));

      let r = 0; let g = 0; let b = 0; let n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * width + sx) * channels;
          // Grayscale sources repeat their single channel.
          r += pixels[i];
          g += channels >= 3 ? pixels[i + 1] : pixels[i];
          b += channels >= 3 ? pixels[i + 2] : pixels[i];
          n += 1;
        }
      }
      const o = (y * outWidth + x) * 3;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
    }
  }
  return { width: outWidth, height: outHeight, out, channels: 3 };
}

/* ---------------- PNG encode ---------------- */

const table = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = table[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

function encodePng(width, height, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2;

  // Filter 1 (Sub) predicts each pixel from its left neighbour, which suits
  // screenshots — long runs of identical background compress to almost
  // nothing once they are expressed as differences.
  const stride = width * 3;
  const raw = Buffer.alloc(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    const base = y * (1 + stride);
    raw[base] = 1;
    for (let x = 0; x < stride; x++) {
      const left = x >= 3 ? rgb[y * stride + x - 3] : 0;
      raw[base + 1 + x] = (rgb[y * stride + x] - left) & 0xff;
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------------- Run ---------------- */

const SLUGS = { omkale: 'omkale', rbads: 'rbads', 'yojit enterprices': 'yojit' };

mkdirSync(OUT_DIR, { recursive: true });
let totalIn = 0; let totalOut = 0;

for (const folder of readdirSync(SOURCE)) {
  const dir = join(SOURCE, folder);
  if (!statSync(dir).isDirectory()) continue;
  const slug = SLUGS[folder.toLowerCase()] ?? folder.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // The home page shot leads, whatever it is called. Alphabetical order put
  // "exploring its work" ahead of "rbadshome", which would have made an inner
  // page the face of the project.
  const files = readdirSync(dir)
    .filter((f) => /\.png$/i.test(f))
    .sort((a, b) => {
      const rank = (n) => (/home/i.test(n) ? 0 : 1);
      return rank(a) - rank(b) || a.localeCompare(b);
    });
  files.forEach((file, index) => {
    const source = readFileSync(join(dir, file));
    const decoded = decodePng(source);
    const { width, height, out } = resize(decoded, MAX_WIDTH);
    const png = encodePng(width, height, out);

    const name = index === 0 ? `${slug}.png` : `${slug}-${index + 1}.png`;
    writeFileSync(join(OUT_DIR, name), png);

    totalIn += source.length; totalOut += png.length;
    console.log(
      `  ${basename(file).padEnd(26)} ${String(decoded.width).padStart(4)}px -> ${String(width).padStart(4)}px   `
      + `${(source.length / 1024).toFixed(0).padStart(5)} KB -> ${(png.length / 1024).toFixed(0).padStart(5)} KB   ${name}`,
    );
  });
}

console.log(
  `\n  total ${(totalIn / 1024 / 1024).toFixed(2)} MB -> ${(totalOut / 1024 / 1024).toFixed(2)} MB`
  + `  (${Math.round((1 - totalOut / totalIn) * 100)}% smaller)`,
);
