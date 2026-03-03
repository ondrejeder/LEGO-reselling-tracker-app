const CACHE_NAME = 'brick-invest-cache-v3';

// We intercept all requests but always attempt to hit the network first.
// If the network fails (offline), we fall back to the cache.
// This prevents stale HTML/JS caching errors on deployment updates.

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Automatically cache the latest version of the files as we browse
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            })
            .catch(() => {
                // If network fails, serve from cache
                return caches.match(event.request);
            })
    );
});
