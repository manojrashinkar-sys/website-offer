import { build } from 'esbuild';
import { readFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = 'node_modules/.cache/audit-site.mjs';
const ENTRY = readFileSync('scripts/verify-community.mjs','utf8').split('const ENTRY = `')[1].split('`;')[0];
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

const { pages } = await import(pathToFileURL('node_modules/.cache/audit-content.mjs').href).catch(()=>({pages:null}));

const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const ROUTES = [['/','Home'],['/services','Services'],['/work','Work'],['/process','Process'],['/contact','Contact'],['/about','About']];

console.log('\n  page      words  h1  h2  links  CTAs  images');
console.log('  ' + '-'.repeat(48));
let totalWords = 0, totalImgs = 0;
for (const [path,name] of ROUTES) {
  const html = render(path);
  const body = text(html);
  // strip the shared shell (header+footer) roughly by removing nav/footer text
  const words = body.split(' ').length;
  totalWords += words;
  const h1 = (html.match(/<h1/g)||[]).length;
  const h2 = (html.match(/<h2/g)||[]).length;
  const links = (html.match(/<a /g)||[]).length;
  const ctas = (html.match(/class="[^"]*btn[^"]*"/g)||[]).length;
  const imgs = (html.match(/<img/g)||[]).length;
  totalImgs += imgs;
  console.log(`  ${name.padEnd(9)} ${String(words).padStart(5)} ${String(h1).padStart(3)} ${String(h2).padStart(3)} ${String(links).padStart(6)} ${String(ctas).padStart(5)} ${String(imgs).padStart(7)}`);
}
console.log(`\n  total words across the site: ${totalWords}`);
console.log(`  total images across the site: ${totalImgs}`);
rmSync(OUT,{force:true});
