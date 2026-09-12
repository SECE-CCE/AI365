import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './api/_middleware/auth.js';
import app from './api/index';

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html')) ? 'production' : 'development';
  }

  // Prevent indexing of internal and admin resources
  app.use((req, res, next) => {
    if (
      req.path.startsWith('/admin') ||
      req.path.startsWith('/api/admin') ||
      req.path.startsWith('/documents') ||
      req.path.startsWith('/assets/Documents')
    ) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }
    next();
  });

  // Middleware to resolve document paths (with or without extension fallback) for intranet access
  const documentsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const reqPath = decodeURIComponent(req.path);
    const fullPath = path.join(process.cwd(), 'assets', 'Documents', reqPath);

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return next();
    }

    // Extension fallback if extension was omitted in certificate_url
    const extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    for (const ext of extensions) {
      const fileWithExt = fullPath + ext;
      if (fs.existsSync(fileWithExt) && fs.statSync(fileWithExt).isFile()) {
        return res.sendFile(path.basename(fileWithExt), { root: path.dirname(fileWithExt) });
      }
    }

    next();
  };

  // Vite middleware for dev or static dist serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, host: '0.0.0.0' },
      appType: 'spa',
    });
    // Document static routes MUST come before Vite so that direct file links
    // (e.g. /documents/User/certificates/file.pdf) are served as raw files.
    // Otherwise Vite's SPA fallback serves index.html → React redirects to home.
    app.use('/documents', cookieParser(), authMiddleware, documentsMiddleware, express.static(path.join(process.cwd(), 'assets', 'Documents')));
    app.use('/assets/Documents', cookieParser(), authMiddleware, documentsMiddleware, express.static(path.join(process.cwd(), 'assets', 'Documents')));

    // Vite middleware handles module imports (transforms image imports into JS modules).
    // It MUST come before the generic /assets static route, otherwise Express serves
    // raw image files with image/* MIME types causing "Failed to load module script" errors.
    app.use(vite.middlewares);

    // Generic /assets and public static come after Vite so Vite can handle module imports first
    app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
    app.use(express.static(path.join(process.cwd(), 'public')));

    app.use('/*splat', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use('/documents', cookieParser(), authMiddleware, documentsMiddleware, express.static(path.join(process.cwd(), 'assets', 'Documents')));
    app.use('/assets/Documents', cookieParser(), authMiddleware, documentsMiddleware, express.static(path.join(process.cwd(), 'assets', 'Documents')));
    // Serve dist/assets first for compiled bundles, then fallback to root assets
    app.use('/assets', express.static(path.join(distPath, 'assets')));
    app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
    app.use(express.static(path.join(process.cwd(), 'public')));
    app.use(express.static(distPath));

    app.get('/*splat', (req, res) => {
      res.sendFile('index.html', { root: distPath });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  🚀 AI365 @ CCE Server is running! [${(process.env.NODE_ENV || 'development').toUpperCase()} MODE]`);
    console.log(`  - Local:   http://localhost:${PORT}`);
    
    // Print all LAN / WiFi IP addresses
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`  - Network: http://${net.address}:${PORT}  (Mobiles / Other devices)`);
        }
      }
    }
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AI365 @ CCE server:', err);
});
