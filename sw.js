/* English File Тренажёр — service worker (network-first для свежих обновлений) */
const CACHE='ef-site-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const isHTML=e.request.mode==='navigate'||(e.request.headers.get('accept')||'').includes('text/html');
  if(isHTML){
    /* HTML: сначала сеть (свежая версия), офлайн — из кэша */
    e.respondWith(fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('./index.html',c)).catch(()=>{});return res;})
      .catch(()=>caches.match(e.request).then(h=>h||caches.match('./index.html'))));
  }else{
    /* прочее: сначала кэш */
    e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});return res;})));
  }
});
