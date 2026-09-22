const fs = require('fs');

// 1. Update sw.js
let sw = fs.readFileSync('H:/pahadicart/sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '[^']+';/, "const CACHE_NAME = 'pahadicart-pwa-v9-live';");

// Network First strategy in sw.js
const oldFetchRegex = /self\.addEventListener\('fetch',[\s\S]*?\n\}\);\n\n\/\//;
const newFetchCode = `self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // External APIs
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Network First for all local assets so code & data are always 100% fresh
  event.respondWith(
    fetch(event.request)
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
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/') || caches.match('/customer/') || caches.match('/customer/index.html');
          }
        });
      })
  );
});

//`;

if (oldFetchRegex.test(sw)) {
  sw = sw.replace(oldFetchRegex, newFetchCode);
  fs.writeFileSync('H:/pahadicart/sw.js', sw, 'utf8');
  console.log('sw.js updated to Network-First v9');
}

// 2. Add instant cache purger in customer/index.html <head>
let custHtml = fs.readFileSync('H:/pahadicart/customer/index.html', 'utf8');
if (!custHtml.includes('pahadi_v9_instant_purge')) {
  const purgeScript = `
  <script>
    // Immediate pre-render cache purge to ensure zero stale products
    if ('caches' in window && localStorage.getItem('pahadi_v9_instant_purge') !== 'true') {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
      localStorage.removeItem('pahadicart_cart_data');
      localStorage.removeItem('pahadicart_orders_db');
      localStorage.removeItem('pahadicart_products');
      localStorage.setItem('pahadi_v9_instant_purge', 'true');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          for (let reg of regs) reg.update();
        });
      }
    }
  </script>
`;
  custHtml = custHtml.replace('<head>', '<head>' + purgeScript);
  fs.writeFileSync('H:/pahadicart/customer/index.html', custHtml, 'utf8');
  console.log('customer/index.html injected with immediate cache purger');
}

// 3. Also inject into index.html
let rootHtml = fs.readFileSync('H:/pahadicart/index.html', 'utf8');
if (!rootHtml.includes('pahadi_v9_instant_purge')) {
  const purgeScript = `
  <script>
    if ('caches' in window && localStorage.getItem('pahadi_v9_instant_purge') !== 'true') {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
      localStorage.removeItem('pahadicart_cart_data');
      localStorage.removeItem('pahadicart_orders_db');
      localStorage.removeItem('pahadicart_products');
      localStorage.setItem('pahadi_v9_instant_purge', 'true');
    }
  </script>
`;
  rootHtml = rootHtml.replace('<head>', '<head>' + purgeScript);
  fs.writeFileSync('H:/pahadicart/index.html', rootHtml, 'utf8');
  console.log('index.html injected with immediate cache purger');
}

console.log('--- ALL UPDATES APPLIED ---');
