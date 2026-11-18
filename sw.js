/* GuruSmart AI — service worker. Cangkang aplikasi di-cache; panggilan API tidak pernah di-cache. */
const V = 'gurusmart-v1';
const SHELL = ['./', './index.html', './config.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;                                              // POST ke GAS: langsung ke jaringan
  if (/script\.google\.com|googleusercontent\.com|accounts\.google\.com/.test(u.host)) return;
  const sama = u.origin === location.origin;
  if (sama && r.mode === 'navigate') { e.respondWith(fetch(r).then(x => { const c = x.clone(); caches.open(V).then(ch => ch.put('./index.html', c)); return x; }).catch(() => caches.match('./index.html'))); return; }
  if (sama || /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(u.host)) {       // stale-while-revalidate
    e.respondWith(caches.open(V).then(c => c.match(r).then(hit => { const net = fetch(r).then(x => { if (x.ok) c.put(r, x.clone()); return x; }).catch(() => hit); return hit || net; })));
  }
});
