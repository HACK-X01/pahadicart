const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3333;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');

if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

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

// Database Helpers
function readJson(fileName, defaultVal = []) {
  try {
    const fPath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(fPath)) return defaultVal;
    return JSON.parse(fs.readFileSync(fPath, 'utf8'));
  } catch (e) {
    return defaultVal;
  }
}

function writeJson(fileName, data) {
  try {
    const fPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(fPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Failed to write ' + fileName, e);
    return false;
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const reqPath = urlParts[0];

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ==========================================
  // REAL-TIME CLOUD API ROUTES
  // ==========================================
  if (reqPath.startsWith('/api/')) {
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

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    // 2. Health Check
    if (reqPath === '/api/health') {
      sendJson(res, 200, {
        status: 'ok',
        app: 'Jeevanix Local Cloud Engine',
        time: new Date().toISOString(),
        clientsCount: sseClients.size
      });
      return;
    }

    // 3. Orders API
    if (reqPath === '/api/orders') {
      if (req.method === 'GET') {
        const orders = readJson('orders.json', []);
        sendJson(res, 200, { success: true, count: orders.length, orders });
        return;
      }

      if (req.method === 'POST') {
        const newOrder = await parseBody(req);
        if (!newOrder.id) {
          newOrder.id = 'HM' + (1000 + Math.floor(Math.random() * 9000));
        }
        newOrder.createdAt = newOrder.createdAt || new Date().toISOString();
        newOrder.serverTimestamp = new Date().toISOString();

        const orders = readJson('orders.json', []);
        // Prepend new order
        orders.unshift(newOrder);
        writeJson('orders.json', orders);

        // Broadcast to all connected devices in real time!
        broadcastSse('ORDER_CREATED', newOrder);

        sendJson(res, 201, { success: true, order: newOrder });
        return;
      }
    }

    // 4. Single Order Update API (/api/orders/:id)
    if (reqPath.startsWith('/api/orders/')) {
      const orderId = reqPath.split('/')[3];
      if (req.method === 'PATCH' || req.method === 'PUT') {
        const updates = await parseBody(req);
        const orders = readJson('orders.json', []);
        const idx = orders.findIndex(o => o.id === orderId);

        if (idx !== -1) {
          Object.assign(orders[idx], updates);
          orders[idx].updatedAt = new Date().toISOString();
          writeJson('orders.json', orders);

          // Broadcast status change to all devices
          broadcastSse('ORDER_UPDATED', orders[idx]);

          sendJson(res, 200, { success: true, order: orders[idx] });
        } else {
          sendJson(res, 404, { success: false, message: 'Order not found' });
        }
        return;
      }

      if (req.method === 'GET') {
        const orders = readJson('orders.json', []);
        const found = orders.find(o => o.id === orderId);
        if (found) {
          sendJson(res, 200, { success: true, order: found });
        } else {
          sendJson(res, 404, { success: false, message: 'Order not found' });
        }
        return;
      }
    }

    // 5. Settings API (Founder UPI VPA, Platform rules)
    if (reqPath === '/api/settings') {
      if (req.method === 'GET') {
        const settings = readJson('settings.json', {
          upiVpa: 'jeevanix@okhdfcbank',
          businessName: 'Jeevanix Local'
        });
        sendJson(res, 200, { success: true, settings });
        return;
      }

      if (req.method === 'POST') {
        const newSettings = await parseBody(req);
        const current = readJson('settings.json', {});
        const updated = Object.assign({}, current, newSettings, { updatedAt: new Date().toISOString() });
        writeJson('settings.json', updated);

        // Broadcast settings update to clients
        broadcastSse('SETTINGS_UPDATED', updated);

        sendJson(res, 200, { success: true, settings: updated });
        return;
      }
    }

    // 6. Users API (Zero-OTP Cloud backup)
    if (reqPath === '/api/users') {
      if (req.method === 'GET') {
        const users = readJson('users.json', []);
        sendJson(res, 200, { success: true, count: users.length, users });
        return;
      }

      if (req.method === 'POST') {
        const newUser = await parseBody(req);
        const users = readJson('users.json', []);
        const exists = users.find(u => u.phone === newUser.phone);
        if (exists) {
          sendJson(res, 400, { success: false, message: 'Phone already registered' });
          return;
        }
        users.push(newUser);
        writeJson('users.json', users);
        sendJson(res, 201, { success: true, user: newUser });
        return;
      }
    }

    // Unknown API
    sendJson(res, 404, { success: false, message: 'API route not found' });
    return;
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
    console.log('Jeevanix Local Engine listening on port ' + PORT);
  });
}

module.exports = server;
