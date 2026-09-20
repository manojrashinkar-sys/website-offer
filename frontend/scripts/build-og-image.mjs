// Generates public/og-image.png — the card shown when the site is shared.
//
// Written by hand because there is no image library here and no browser to
// screenshot with. A PNG is a zlib stream plus a CRC, so the whole encoder is
// about forty lines; the rest is drawing.
//
// No text. Rendering type needs a font, and every platform that shows this
// card also shows the page title and description as real text beside it, so
// the image carries the mark and the palette and lets the words be words.
//
// Run: node scripts/build-og-image.mjs

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const W = 1200, H = 630;
const px = Buffer.alloc(W * H * 3);

const set = (x, y, r, g, b) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = r; px[i + 1] = g; px[i + 2] = b;
};
const mix = (a, b, t) => Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));

// --- Ground: the site's ink, lifted diagonally so it is not a flat fill ---
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const t = (x / W) * 0.6 + (y / H) * 0.4;
    set(x, y, mix(9, 26, t), mix(13, 34, t), mix(26, 56, t));
  }
}

// --- The faint grid the hero uses, so the card belongs to the site ---
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (x % 48 !== 0 && y % 48 !== 0) continue;
    const i = (y * W + x) * 3;
    px[i] = Math.min(255, px[i] + 8);
    px[i + 1] = Math.min(255, px[i + 1] + 10);
    px[i + 2] = Math.min(255, px[i + 2] + 14);
  }
}

// --- Brand mark: white rounded square, ink layers glyph, centred ---
const S = 196, R = 46;
const mx = (W - S) / 2, my = (H - S) / 2 - 8;
const inRounded = (x, y) => {
  const lx = x - mx, ly = y - my;
  if (lx < 0 || ly < 0 || lx >= S || ly >= S) return false;
  const cx = Math.min(Math.max(lx, R), S - R);
  const cy = Math.min(Math.max(ly, R), S - R);
  return (lx - cx) ** 2 + (ly - cy) ** 2 <= R * R;
};
// A diamond, the shape the layers icon is built from.
const inDiamond = (x, y, cx, cy, hw, hh) =>
  Math.abs(x - cx) / hw + Math.abs(y - cy) / hh <= 1;

const gcx = mx + S / 2;
const gcy = my + S / 2;
for (let y = my - 2; y < my + S + 2; y++) {
  for (let x = mx - 2; x < mx + S + 2; x++) {
    if (!inRounded(x, y)) continue;
    // Three stacked plates: the top solid, the two beneath as thin edges.
    const top = inDiamond(x, y, gcx, gcy - 26, 52, 26);
    const midOuter = inDiamond(x, y, gcx, gcy + 8, 52, 26);
    const midInner = inDiamond(x, y, gcx, gcy + 8, 38, 19);
    const lowOuter = inDiamond(x, y, gcx, gcy + 40, 52, 26);
    const lowInner = inDiamond(x, y, gcx, gcy + 40, 38, 19);
    const ink = top || (midOuter && !midInner) || (lowOuter && !lowInner);
    if (ink) set(x, y, 12, 17, 31);
    else set(x, y, 255, 255, 255);
  }
}

// --- A short rule beneath the mark: something for the eye to land on ---
for (let y = my + S + 46; y < my + S + 52; y++) {
  for (let x = gcx - 90; x < gcx + 90; x++) {
    const fade = 1 - Math.abs(x - gcx) / 90;
    const i = (y * W + x) * 3;
    px[i] = mix(px[i], 255, fade * 0.55);
    px[i + 1] = mix(px[i + 1], 255, fade * 0.55);
    px[i + 2] = mix(px[i + 2], 255, fade * 0.55);
  }
}

/* ---------------- PNG encoding ---------------- */
const table = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

// Each scanline is prefixed with its filter type; 0 is "none".
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0;
  px.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

writeFileSync('public/og-image.png', png);
console.log(`og-image.png written: ${W}x${H}, ${(png.length / 1024).toFixed(1)} KB`);
