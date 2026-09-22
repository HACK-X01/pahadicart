const http = require('http');
const fs = require('fs');
const path = require('path');

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

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '' || reqPath === '/') reqPath = '/index.html';

  const possibleRoots = [ROOT_DIR, process.cwd(), path.resolve('.'), path.join(__dirname, '..')];
  let filePath = null;

  for (const root of possibleRoots) {
    if (!root) continue;
    const cleanPath = reqPath.replace(/^\/+/, '');
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
    let rootFiles = [];
    try { rootFiles = fs.readdirSync(ROOT_DIR); } catch (e) { rootFiles = [e.message]; }
    let cwdFiles = [];
    try { cwdFiles = fs.readdirSync(process.cwd()); } catch (e) { cwdFiles = [e.message]; }
    res.end('<h1>404 - PahadiCart Route Not Found</h1><p>Requested: ' + reqPath + '</p><p>ROOT_DIR: ' + ROOT_DIR + ' [' + rootFiles.join(', ') + ']</p><p>CWD: ' + process.cwd() + ' [' + cwdFiles.join(', ') + ']</p><a href="/">Return to Super Hub</a>');
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
    console.log('PahadiCart listening on port ' + PORT);
  });
}

module.exports = server;
