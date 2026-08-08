import { build } from 'esbuild';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = 'node_modules/.cache/audit.mjs';
const ENTRY = readFileSync('scripts/verify-community.mjs','utf8')
  .split('const ENTRY = `')[1].split('`;')[0];

await build({
  stdin:{contents:ENTRY,resolveDir:'scripts',sourcefile:'e.tsx',loader:'tsx'},
  bundle:true,format:'esm',platform:'node',outfile:OUT,jsx:'automatic',
  loader:{'.css':'empty','.svg':'empty','.png':'empty','.jpg':'empty','.webp':'empty'},
  define:{'import.meta.env':JSON.stringify({MODE:'production',PROD:true,DEV:false})},
  banner:{js:"import {createRequire as c} from 'node:module';const require=c(import.meta.url);"},
  logLevel:'error',
});
const noop=()=>{}; const mq=()=>({matches:false,addEventListener:noop,removeEventListener:noop,addListener:noop,removeListener:noop});
const el=()=>({setAttribute:noop,getAttribute:()=>null,removeAttribute:noop,remove:noop,appendChild:noop,style:{},dataset:{},classList:{add:noop,remove:noop,contains:()=>false},querySelectorAll:()=>[],focus:noop});
globalThis.window={location:{hostname:'webservices.manojrashinkar.com',pathname:'/',search:'',href:'/'},matchMedia:mq,localStorage:{getItem:()=>null,setItem:noop,removeItem:noop},addEventListener:noop,removeEventListener:noop,scrollTo:noop,scrollY:0,requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop};
globalThis.document={documentElement:el(),head:{...el(),querySelector:()=>null},body:{...el(),style:{}},createElement:el,getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop,removeEventListener:noop};
globalThis.localStorage=globalThis.window.localStorage; globalThis.matchMedia=mq;

const { render } = await import(pathToFileURL(OUT).href);
const classes = new Set();
for (const p of ['/','/about','/services','/work','/process','/contact']) {
  for (const m of render(p).matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).forEach(c=>c&&classes.add(c));
}
// MobileStickyActions / advisor render later; include their classes explicitly.
['sticky-action','sticky-action-cta','sticky-action-wa','advisor-launcher','advisor-send','btn-glow'].forEach(c=>classes.add(c));

const cssFile = readdirSync('dist/assets').find(f=>/^index-.*\.css$/.test(f));
const css = readFileSync(`dist/assets/${cssFile}`,'utf8');
const BLUE = /gradient-brand|#2563eb|#1e3a8a|#06b6d4|#3b82f6|brand-primary|color-primary/;

// Selectors already overridden by a .community-site rule. Those blue
// declarations still exist in the file but can never win on these pages.
const covered = new Set();
for (const [,sel] of css.matchAll(/([^{}@]+)\{[^}]*\}/g)) {
  for (const one of sel.split(',')) {
    const t = one.trim();
    if (!t.includes('.community-site')) continue;
    covered.add(t.replace(/\[data-theme="?dark"?\]\s*/,'').replace('.community-site ','').trim());
  }
}

const offenders = [];
for (const [,sel,body] of css.matchAll(/([^{}@]+)\{([^}]*)\}/g)) {
  if (!BLUE.test(body)) continue;
  if (!/background|border-color|color\s*:/.test(body)) continue;
  for (const one of sel.split(',')) {
    const used = [...one.matchAll(/\.([A-Za-z0-9_-]+)/g)].map(m=>m[1]);
    const t = one.trim().replace(/\[data-theme="?dark"?\]\s*/,'').trim();
    if (covered.has(t)) continue;
    if (used.length && used.every(c=>classes.has(c))) {
      offenders.push([one.trim(), body.trim().slice(0,72)]); break;
    }
  }
}
console.log(`  classes rendered: ${classes.size}`);
if (!offenders.length) console.log('  no blue rule can apply to anything these pages render');
else offenders.forEach(([s,b])=>console.log(`  BLUE  ${s}\n        ${b}`));
rmSync(OUT,{force:true});
