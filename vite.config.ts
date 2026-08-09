import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

function assetUploadPlugin(): Plugin {
  return {
    name: 'asset-upload-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Upload Asset
        if (req.url === '/api/upload' && req.method === 'POST') {
          const filename = req.headers['x-filename'] as string;
          const type = req.headers['x-type'] as string; // 'bg' or 'sprite'

          if (!filename || !type) {
            res.statusCode = 400;
            res.end('Missing headers');
            return;
          }

          // Sanitizar el nombre del archivo
          const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const targetDir = path.join(process.cwd(), 'public', 'assets', 'images', type === 'bg' ? 'bg' : 'sprites');
          
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          const targetPath = path.join(targetDir, safeFilename);
          const writeStream = fs.createWriteStream(targetPath);
          
          req.pipe(writeStream);
          
          req.on('end', () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, url: `/assets/images/${type === 'bg' ? 'bg' : 'sprites'}/${safeFilename}` }));
          });
          
          req.on('error', (err) => {
            console.error("Error al subir archivo:", err);
            res.statusCode = 500;
            res.end('Internal Server Error');
          });
          return;
        }

        // List Assets
        if (req.url === '/api/assets' && req.method === 'GET') {
          const bgDir = path.join(process.cwd(), 'public', 'assets', 'images', 'bg');
          const spriteDir = path.join(process.cwd(), 'public', 'assets', 'images', 'sprites');
          
          let backgrounds: string[] = [];
          let sprites: string[] = [];

          if (fs.existsSync(bgDir)) {
             backgrounds = fs.readdirSync(bgDir).filter(f => f.match(/\\.(png|jpe?g|gif|webp)$/i)).map(f => `/assets/images/bg/${f}`);
          }
          if (fs.existsSync(spriteDir)) {
             sprites = fs.readdirSync(spriteDir).filter(f => f.match(/\\.(png|jpe?g|gif|webp)$/i)).map(f => `/assets/images/sprites/${f}`);
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ backgrounds, sprites }));
          return;
        }

        // Delete Asset
        if (req.url === '/api/assets' && req.method === 'DELETE') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', () => {
            try {
              const { url } = JSON.parse(body);
              if (!url || typeof url !== 'string' || url.includes('..')) {
                 res.statusCode = 400; res.end('Invalid URL'); return;
              }
              const targetPath = path.join(process.cwd(), 'public', url);
              if (fs.existsSync(targetPath)) {
                fs.unlinkSync(targetPath);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } else {
                res.statusCode = 404;
                res.end('Not found');
              }
            } catch (e) {
              res.statusCode = 400;
              res.end('Bad request');
            }
          });
          return;
        }

        next();
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    assetUploadPlugin()
  ],
})
