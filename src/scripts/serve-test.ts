import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = new Hono();
const PORT = 3001;

// Serve static files from the fe-example directory
const feExamplePath = path.resolve(__dirname, '../../fe-example');

// Serve static files - CSS, JS, JSON, ICO, etc.
app.get('*', (c) => {
  const pathname = new URL(c.req.url).pathname;
  
  // Try to serve as a file if it has an extension
  if (pathname.includes('.')) {
    const filePath = path.join(feExamplePath, pathname);
    try {
      const fileContent = fs.readFileSync(filePath);
      const ext = path.extname(filePath);
      const mimeTypes: { [key: string]: string } = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.json': 'application/json',
        '.ico': 'image/x-icon',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.txt': 'text/plain',
        '.xml': 'application/xml',
        '.pdf': 'application/pdf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.otf': 'font/otf',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      return c.body(fileContent, 200, { 'Content-Type': contentType });
    } catch {
      // File not found, continue to fallback
    }
  }
  
  // Fallback route to serve index.html for SPA
  try {
    const indexPath = path.join(feExamplePath, 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    return c.html(indexContent);
  } catch {
    return c.text('index.html not found', 404);
  }
});

serve({ fetch: app.fetch, port: PORT }, (_info) => {
  console.log(`Frontend example is running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${feExamplePath}`);
});