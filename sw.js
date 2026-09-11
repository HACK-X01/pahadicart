// PahadiCart Himalayan Offline Cache Service Worker v3.0
const CACHE_NAME = 'pahadicart-pwa-v3';

const STATIC_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon.png',
  '/customer/',
  '/customer/index.html',
  '/customer/css/customer.css',
  '/customer/js/customerApp.js',
  '/rider/',
  '/rider/index.html',
  '/rider/css/rider.css',
  '/rider/js/riderApp.js',
  '/merchant/',
  '/merchant/index.html',
  '/merchant/css/merchant.css',
  '/merchant/js/merchantApp.js',
  '/admin/',
  '/admin/index.html',
  '/admin/css/tokens.css',
  '/admin/css/layout.css',
  '/admin/css/components.css',
  '/admin/css/responsive.css',
  '/shared/pwaInit.js',
  '/shared/liveServices.js',
  '/shared/sharedData.js',
  '/shared/eventBus.js',
  '/shared/hillAudio.js',
  '/shared/dispatchEngine.js',
  '/shared/simulationEngine.js',
  '/shared/offlineQueue.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching Himalayan shells & offline resources');
      return cache.addAll(STATIC_SHELL).catch((err) => {
        console.warn('[SW] Cache addAll notice (some assets may cache on first fetch):', err);
      });
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
  const url = new URL(event.request.url);

  // Do not cache external dynamic APIs like Open-Meteo or analytics
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-while-revalidate for local assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is navigation, return cached root or app shell
          if (event.request.mode === 'navigate') {
            return caches.match(event.request) || caches.match('/');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
