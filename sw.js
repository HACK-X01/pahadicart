// PahadiCart Himalayan Offline Cache & Web Push Service Worker v5.0
const CACHE_NAME = 'pahadicart-pwa-v6';

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
  '/shared/tokens.css',
  '/shared/mockApi.js',
  '/shared/pwaInit.js',
  '/shared/profileSidebar.js',
  '/shared/hillAudio.js',
  '/shared/pushNotifier.js',
  '/shared/liveServices.js',
  '/shared/sharedData.js',
  '/shared/eventBus.js',
  '/shared/dispatchEngine.js',
  '/shared/simulationEngine.js',
  '/shared/offlineQueue.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching Himalayan shells & offline resources v5');
      return cache.addAll(STATIC_SHELL).catch((err) => {
        console.warn('[SW] Cache addAll notice:', err);
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

  // Do not cache external dynamic APIs
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
          if (event.request.mode === 'navigate') {
            return caches.match(event.request) || caches.match('/');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// ==========================================
// WEB PUSH NOTIFICATIONS & INTERACTION
// ==========================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'PahadiCart Alert', body: event.data.text() };
    }
  }

  const title = data.title || '🔔 PahadiCart Order Update';
  const options = {
    body: data.body || 'New live update from Himachal delivery network.',
    icon: data.icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'pahadi-order-' + Date.now(),
    vibrate: [250, 100, 250, 100, 250],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: '👀 View Order' },
      { action: 'close', title: '✕ Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and navigate
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
