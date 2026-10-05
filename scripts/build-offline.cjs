const fs = require("node:fs"),
  path = require("node:path");
const build = fs.readFileSync(".next/BUILD_ID", "utf8").trim(),
  assets = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.(js|css|woff2)$/.test(file))
      assets.push("/_next/" + file.replace(/\\/g, "/").slice(".next/".length));
  }
}
scan(".next/static");
const paths = [
  "/",
  "/advisor",
  "/progress",
  "/schedule",
  "/degree-map",
  "/manifest.webmanifest",
  "/icon.svg",
  "/pdf.worker.min.mjs",
  ...assets,
];
const worker = `/* Public-only, atomic build cache. Academic profiles never pass through this worker. */
const CACHE=${JSON.stringify("schedulehaw-public-" + build)},PREVIOUS='schedulehaw-public-',ASSETS=${JSON.stringify(paths)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);try{await cache.addAll(ASSETS);}catch(error){await caches.delete(CACHE);throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{await self.clients.claim();const keys=await caches.keys();const old=keys.filter(k=>k.startsWith(PREVIOUS)&&k!==CACHE);/* One previous complete release is retained for rollback; clients keep their hashed assets. */for(const key of old.slice(0,-1))await caches.delete(key);})()));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/')||u.search||r.headers.get('RSC')==='1')return;if(r.mode==='navigate'){event.respondWith(fetch(r).catch(async()=>{const cache=await caches.open(CACHE);return await cache.match(u.pathname)||await cache.match('/');}));return;}if(ASSETS.includes(u.pathname))event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(u.pathname);return cached||fetch(r);})());});
`;
fs.writeFileSync("public/sw.js", worker);
console.log(
  "Prepared atomic public-only offline cache for build " +
    build +
    " (" +
    paths.length +
    " assets).",
);
