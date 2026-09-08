// PahadiCart Himalayan Offline Cache Service Worker
const CACHE_NAME = 'pahadicart-v1';
const STATIC_ASSETS = [
  '/',
  '/admin/',
  '/customer/',
  '/merchant/',
  '/rider/',
  '/shared/sharedData.js',
  '/shared/eventBus.js',
  '/shared/hillAudio.js',
  '/shared/dispatchEngine.js',
  '/shared/simulationEngine.js',
  '/shared/offlineQueue.js',
  '/admin/css/tokens.css',
  '/admin/css/layout.css',
  '/admin/css/components.css',
  '/admin/css/responsive.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching mountain shells & offline scripts');
      return cache.addAll(STATIC_ASSETS).catch(err => console.warn('[SW] Caching notice:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        // Return cached root or offline fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
