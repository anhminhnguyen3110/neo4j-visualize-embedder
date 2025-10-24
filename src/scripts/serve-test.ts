#!/usr/bin/env node

/**
 * Simple HTTP server for test-fe
 * Run: npm run serve:test
 */
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8080;
const TEST_FE_DIR = join(__dirname, '..', '..', 'test-fe');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    // Default to index.html for root path
    let filePath = req.url === '/' ? '/index.html' : req.url || '/index.html';
    
    // Remove query string
    filePath = filePath.split('?')[0];
    
    const fullPath = join(TEST_FE_DIR, filePath);
    const ext = extname(fullPath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    const content = await readFile(fullPath);
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(content);
    
    console.log(`✅ [${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - 200`);
  } catch (error) {
    res.writeHead(404);
    res.end('404 Not Found');
    console.log(`❌ [${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - 404`);
  }
});

server.listen(PORT, () => {
  console.log(`
🚀 Test UI Server running!
   
   📂 Serving: test-fe/
   🌐 URL: http://localhost:${PORT}
   
   Press Ctrl+C to stop
  `);
});
