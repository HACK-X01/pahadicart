/**
 * Himora / Jeevanix Local — Master Production Server & REST API
 * Single Source of Truth: SQLite Database (data/himora.db)
 * Real-Time Broadcast: Native Server-Sent Events (SSE)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  ProductsRepo,
  CategoriesRepo,
  MerchantsRepo,
  RidersRepo,
  OrdersRepo,
  CmsRepo,
  BusinessRulesRepo,
  CouponsRepo,
  AuditLogsRepo,
  exportFullDatabase
} = require('./server/db');

const PORT = process.env.PORT || 3333;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.apk': 'application/vnd.android.package-archive',
  '.aab': 'application/octet-stream'
};

// In-Memory SSE Clients for Real-Time Cross-Device Sync
const sseClients = new Set();

function broadcastSse(eventType, payload) {
  const message = 'event: ' + eventType + '\ndata: ' + JSON.stringify(payload) + '\n\n';
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Role, X-Founder-PIN',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

// Server-side authorization guard
function checkAdminAuth(req) {
  const role = req.headers['x-admin-role'] || '';
  const pin = req.headers['x-founder-pin'] || '';
  // Allowed if valid admin role or Founder PIN passed
  if (role === 'SUPER_ADMIN' || role === 'OPERATIONS_ADMIN' || role === 'FINANCE_ADMIN' || pin === '7890') {
    return { authorized: true, role: role || 'SUPER_ADMIN' };
  }
  // For local development / same-origin convenience, check referer
  const referer = req.headers['referer'] || '';
  if (referer.includes('/admin/')) {
    return { authorized: true, role: 'SUPER_ADMIN' };
  }
  return { authorized: false };
}

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const reqPath = urlParts[0];
  const queryString = urlParts[1] || '';
  const queryParams = new URLSearchParams(queryString);

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Role, X-Founder-PIN'
    });
    res.end();
    return;
  }

  // ==========================================
  // REAL-TIME CLOUD API ROUTES (SQLITE BACKED)
  // ==========================================
  if (reqPath.startsWith('/api/')) {
    try {
      // 1. SSE Stream for Real-Time Cross-Device Events
      if (reqPath === '/api/sync/stream') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });
        res.write('event: connected\ndata: {"status":"connected","timestamp":"' + new Date().toISOString() + '"}\n\n');
        sseClients.add(res);
        req.on('close', () => { sseClients.delete(res); });
        return;
      }

      // 2. Health & DB Status
      if (reqPath === '/api/health') {
        sendJson(res, 200, {
          status: 'ok',
          app: 'Himora Master SQLite Engine',
          time: new Date().toISOString(),
          clientsCount: sseClients.size
        });
        return;
      }

      // 3. PRODUCTS CRUD
      if (reqPath === '/api/products') {
        if (req.method === 'GET') {
          const includeAll = queryParams.get('all') === 'true';
          const products = ProductsRepo.getAll(includeAll);
          sendJson(res, 200, { success: true, count: products.length, products });
          return;
        }

        if (req.method === 'POST') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized: Admin privileges required to create product' });
            return;
          }
          const body = await parseBody(req);
          if (!body.name || body.price === undefined) {
            sendJson(res, 400, { success: false, message: 'Product name and price are required' });
            return;
          }
          const product = ProductsRepo.create(body, auth.role);
          broadcastSse('PRODUCT_CHANGED', { action: 'CREATED', product });
          sendJson(res, 201, { success: true, product });
          return;
        }
      }

      // Single Product (/api/products/:id)
      if (reqPath.startsWith('/api/products/')) {
        const id = decodeURIComponent(reqPath.split('/')[3]);

        if (req.method === 'GET') {
          const product = ProductsRepo.getById(id);
          if (product) {
            sendJson(res, 200, { success: true, product });
          } else {
            sendJson(res, 404, { success: false, message: 'Product not found: ' + id });
          }
          return;
        }

        if (req.method === 'PATCH' || req.method === 'PUT') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized: Admin privileges required to update product' });
            return;
          }
          const updates = await parseBody(req);
          const reason = req.headers['x-audit-reason'] || updates._reason || 'Admin modification';
          const product = ProductsRepo.update(id, updates, auth.role, reason);
          broadcastSse('PRODUCT_CHANGED', { action: 'UPDATED', product });
          sendJson(res, 200, { success: true, product });
          return;
        }

        if (req.method === 'DELETE') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized: Admin privileges required to delete product' });
            return;
          }
          const reason = req.headers['x-audit-reason'] || 'Admin deleted';
          const result = ProductsRepo.delete(id, auth.role, reason);
          broadcastSse('PRODUCT_CHANGED', { action: 'DELETED', id });
          sendJson(res, 200, result);
          return;
        }
      }

      // 4. CATEGORIES CRUD
      if (reqPath === '/api/categories') {
        if (req.method === 'GET') {
          const categories = CategoriesRepo.getAll();
          sendJson(res, 200, { success: true, count: categories.length, categories });
          return;
        }

        if (req.method === 'POST') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized' });
            return;
          }
          const body = await parseBody(req);
          const cat = CategoriesRepo.create(body, auth.role);
          broadcastSse('CATEGORY_CHANGED', { action: 'CREATED', category: cat });
          sendJson(res, 201, { success: true, category: cat });
          return;
        }
      }

      if (reqPath.startsWith('/api/categories/')) {
        const id = decodeURIComponent(reqPath.split('/')[3]);
        if (req.method === 'PATCH' || req.method === 'PUT') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized' });
            return;
          }
          const updates = await parseBody(req);
          const cat = CategoriesRepo.update(id, updates, auth.role);
          broadcastSse('CATEGORY_CHANGED', { action: 'UPDATED', category: cat });
          sendJson(res, 200, { success: true, category: cat });
          return;
        }

        if (req.method === 'DELETE') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized' });
            return;
          }
          const result = CategoriesRepo.delete(id, auth.role);
          broadcastSse('CATEGORY_CHANGED', { action: 'DELETED', id });
          sendJson(res, 200, result);
          return;
        }
      }

      // 5. MERCHANTS / SHOPS CRUD
      if (reqPath === '/api/merchants') {
        if (req.method === 'GET') {
          const merchants = MerchantsRepo.getAll();
          sendJson(res, 200, { success: true, count: merchants.length, merchants });
          return;
        }
      }

      if (reqPath.startsWith('/api/merchants/')) {
        const id = decodeURIComponent(reqPath.split('/')[3]);
        if (req.method === 'GET') {
          const m = MerchantsRepo.getById(id);
          sendJson(res, m ? 200 : 404, m ? { success: true, merchant: m } : { success: false, message: 'Merchant not found' });
          return;
        }

        if (req.method === 'PATCH' || req.method === 'PUT') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized' });
            return;
          }
          const updates = await parseBody(req);
          const reason = req.headers['x-audit-reason'] || updates._reason || 'Merchant status/commission update';
          const updated = MerchantsRepo.update(id, updates, auth.role, reason);
          broadcastSse('MERCHANT_CHANGED', { action: 'UPDATED', merchant: updated });
          sendJson(res, 200, { success: true, merchant: updated });
          return;
        }
      }

      // 6. RIDERS CRUD
      if (reqPath === '/api/riders') {
        if (req.method === 'GET') {
          const riders = RidersRepo.getAll();
          sendJson(res, 200, { success: true, count: riders.length, riders });
          return;
        }
      }

      if (reqPath.startsWith('/api/riders/')) {
        const id = decodeURIComponent(reqPath.split('/')[3]);
        if (req.method === 'GET') {
          const r = RidersRepo.getById(id);
          sendJson(res, r ? 200 : 404, r ? { success: true, rider: r } : { success: false, message: 'Rider not found' });
          return;
        }

        if (req.method === 'PATCH' || req.method === 'PUT') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized' });
            return;
          }
          const updates = await parseBody(req);
          const updated = RidersRepo.update(id, updates, auth.role);
          broadcastSse('RIDER_CHANGED', { action: 'UPDATED', rider: updated });
          sendJson(res, 200, { success: true, rider: updated });
          return;
        }
      }

      // 7. ORDERS CRUD
      if (reqPath === '/api/orders') {
        if (req.method === 'GET') {
          const orders = OrdersRepo.getAll();
          sendJson(res, 200, { success: true, count: orders.length, orders });
          return;
        }

        if (req.method === 'POST') {
          const body = await parseBody(req);
          const newOrder = OrdersRepo.create(body);
          broadcastSse('ORDER_CREATED', newOrder);
          sendJson(res, 201, { success: true, order: newOrder });
          return;
        }
      }

      if (reqPath.startsWith('/api/orders/')) {
        const id = decodeURIComponent(reqPath.split('/')[3]);
        if (req.method === 'GET') {
          const o = OrdersRepo.getById(id);
          sendJson(res, o ? 200 : 404, o ? { success: true, order: o } : { success: false, message: 'Order not found' });
          return;
        }

        if (req.method === 'PATCH' || req.method === 'PUT') {
          const auth = checkAdminAuth(req);
          const updates = await parseBody(req);
          const updated = OrdersRepo.update(id, updates, auth.role || 'RIDER/OPS');
          broadcastSse('ORDER_UPDATED', updated);
          sendJson(res, 200, { success: true, order: updated });
          return;
        }
      }

      // 8. HOMEPAGE CMS
      if (reqPath === '/api/cms') {
        if (req.method === 'GET') {
          const cms = CmsRepo.getAll();
          sendJson(res, 200, { success: true, cms });
          return;
        }

        if (req.method === 'POST') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized' });
            return;
          }
          const body = await parseBody(req);
          for (const [k, v] of Object.entries(body)) {
            CmsRepo.save(k, v, auth.role);
          }
          const freshCms = CmsRepo.getAll();
          broadcastSse('CMS_UPDATED', freshCms);
          sendJson(res, 200, { success: true, cms: freshCms });
          return;
        }
      }

      // 9. BUSINESS RULES & SETTINGS
      if (reqPath === '/api/business-rules' || reqPath === '/api/settings') {
        if (req.method === 'GET') {
          const rules = BusinessRulesRepo.get();
          sendJson(res, 200, { success: true, rules, settings: rules });
          return;
        }

        if (req.method === 'POST') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized' });
            return;
          }
          const body = await parseBody(req);
          const updated = BusinessRulesRepo.save(body, auth.role);
          broadcastSse('RULES_UPDATED', updated);
          sendJson(res, 200, { success: true, rules: updated, settings: updated });
          return;
        }
      }

      // 10. COUPONS
      if (reqPath === '/api/coupons') {
        if (req.method === 'GET') {
          const coupons = CouponsRepo.getAll();
          sendJson(res, 200, { success: true, count: coupons.length, coupons });
          return;
        }

        if (req.method === 'POST') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized' });
            return;
          }
          const body = await parseBody(req);
          const c = CouponsRepo.create(body, auth.role);
          sendJson(res, 201, { success: true, coupon: c });
          return;
        }
      }

      if (reqPath.startsWith('/api/coupons/')) {
        const code = decodeURIComponent(reqPath.split('/')[3]);
        if (req.method === 'DELETE') {
          const auth = checkAdminAuth(req);
          if (!auth.authorized) {
            sendJson(res, 403, { success: false, message: 'Unauthorized' });
            return;
          }
          const result = CouponsRepo.delete(code, auth.role);
          sendJson(res, 200, result);
          return;
        }
      }

      // 11. AUDIT LOGS
      if (reqPath === '/api/audit-logs') {
        const auth = checkAdminAuth(req);
        if (!auth.authorized) {
          sendJson(res, 403, { success: false, message: 'Unauthorized' });
          return;
        }
        const logs = AuditLogsRepo.getAll(100);
        sendJson(res, 200, { success: true, count: logs.length, logs });
        return;
      }

      // 12. FULL DATABASE EXPORT
      if (reqPath === '/api/db/export') {
        const auth = checkAdminAuth(req);
        if (!auth.authorized) {
          sendJson(res, 403, { success: false, message: 'Unauthorized' });
          return;
        }
        const snapshot = exportFullDatabase();
        sendJson(res, 200, { success: true, snapshot });
        return;
      }

      sendJson(res, 404, { success: false, message: 'API route not found' });
      return;

    } catch (err) {
      console.error('[API Error]:', err);
      sendJson(res, 500, { success: false, error: err.message });
      return;
    }
  }

  // ==========================================
  // STATIC ASSETS & PWA SERVING
  // ==========================================
  let staticPath = reqPath;
  if (staticPath === '' || staticPath === '/') staticPath = '/index.html';

  const possibleRoots = [ROOT_DIR, process.cwd(), path.resolve('.'), path.join(__dirname, '..')];
  let filePath = null;

  for (const root of possibleRoots) {
    if (!root) continue;
    const cleanPath = staticPath.replace(/^\/+/, '');
    let candidate = path.join(root, cleanPath);
    if (fs.existsSync(candidate)) {
      try {
        if (fs.statSync(candidate).isDirectory()) {
          candidate = path.join(candidate, 'index.html');
        }
      } catch (e) {}
    } else {
      const withIdx = path.join(candidate, 'index.html');
      if (fs.existsSync(withIdx)) candidate = withIdx;
    }
    if (fs.existsSync(candidate)) {
      try {
        if (!fs.statSync(candidate).isDirectory()) {
          filePath = candidate;
          break;
        }
      } catch (e) {}
    }
  }

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end('<h1>404 - Not Found</h1><p>Requested: ' + reqPath + '</p><a href="/">Return to Super Hub</a>');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error: ' + err.code);
    } else {
      const resHeaders = {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*'
      };
      resHeaders['Content-Length'] = content.length;
      if (ext === '.apk') {
        resHeaders['Content-Disposition'] = 'attachment; filename="PahadiCart.apk"';
      }
      res.writeHead(200, resHeaders);
      res.end(content);
    }
  });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log('Himora Master Engine (SQLite) listening on port ' + PORT);
  });
}

module.exports = server;
