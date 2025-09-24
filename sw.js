// sw.js
const CACHE_NAME = 'js-calc-v2';
const ASSETS = [
'./',
'./index.html',
'./style.css',
'./app.js',
'./manifest.json',
'./icons/icon-192.png',
'./icons/icon-512.png',
'./icons/maskable-192.png',
'./icons/maskable-512.png',
'./offline.html'
];


self.addEventListener('install', (event) => {
self.skipWaiting();
event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});


self.addEventListener('activate', (event) => {
event.waitUntil(
(async () => {
const keys = await caches.keys();
await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
await self.clients.claim();
})()
);
});


self.addEventListener('fetch', (event) => {
const req = event.request;


// HTML navigations: network-first with offline fallback
if (req.mode === 'navigate') {
event.respondWith(
(async () => {
try {
const fresh = await fetch(req);
return fresh;
} catch (err) {
const cache = await caches.open(CACHE_NAME);
return (await cache.match('./offline.html')) || Response.error();
}
})()
);
return;
}


// Other requests: cache-first
event.respondWith(
caches.match(req).then((hit) => hit || fetch(req))
);
});