const CACHE_NAME = 'vrinda-map-tiles-v1';
const STATIC_CACHE = 'vrinda-static-v1';

// Install event - activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== STATIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Cache-first strategy for map tiles (Google Maps / OSM / Carto)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Check if request is a map tile
  const isMapTile = 
    url.hostname.includes('google.com') && url.pathname.includes('/vt') ||
    url.hostname.includes('openstreetmap') ||
    url.hostname.includes('cartocdn.com') ||
    url.pathname.endsWith('.png') && (url.pathname.includes('/tile') || url.pathname.includes('/hot/'));

  if (isMapTile) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // Try local offline cache first
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          // Revalidate in background if online
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
          }).catch(() => {});
          return cachedResponse;
        }

        // Fetch from network and save to offline cache
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // Offline fallback
          if (cachedResponse) return cachedResponse;
          throw error;
        }
      })
    );
  }
});
