// Local smoke server only. Cloudflare continues to serve dist/ with public/_redirects.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/') { res.writeHead(302, { location: '/docs' }); res.end(); return; }
  const target = path.resolve(root, '.' + pathname);
  if (!target.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  for (const candidate of [target, target + '.html', path.join(target, 'index.html')]) {
    try {
      const body = await readFile(candidate);
      res.writeHead(200, { 'Content-Type': mime[path.extname(candidate)] || 'application/octet-stream' });
      res.end(body); return;
    } catch (error) { if (!['ENOENT', 'EISDIR', 'ENOTDIR'].includes(error.code)) throw error; }
  }
  res.writeHead(404); res.end('Not found');
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1');
