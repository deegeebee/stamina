// Built: 2026-05-03T00:00:00Z
const CACHE = 'tracker-2026-05-03T00:00:00Z';
const ASSETS = [
  '.', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Delete old caches on activation
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stale-while-revalidate: serve cache immediately, refresh in background
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(e.request, response.clone());
          }
          return response;
        }).catch(() => cached); // offline fallback

        return cached || networkFetch;
      })
    )
  );
});
