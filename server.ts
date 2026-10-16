import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './api/_middleware/auth.js';
import { db } from './api/_db/client.js';
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
  const documentsMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

    // Database fallback from uploaded_files table
    try {
      const cleanPath = reqPath.startsWith('/') ? reqPath : `/${reqPath}`;
      const fileUrl1 = `/assets/Documents${cleanPath}`;
      const fileUrl2 = `/documents${cleanPath}`;
      const dbFile = (await db.getUploadedFileByUrl(fileUrl1, reqPath)) || (await db.getUploadedFileByUrl(fileUrl2, reqPath));

      if (dbFile && dbFile.file_data) {
        const buffer = Buffer.from(dbFile.file_data, 'base64');
        res.setHeader('Content-Type', dbFile.mime_type || 'application/octet-stream');
        res.setHeader('Content-Length', buffer.length);
        const fileName = dbFile.file_name || path.basename(reqPath);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);

        // Cache file to disk for faster future access
        try {
          const dir = path.dirname(fullPath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(fullPath, buffer);
        } catch (_) {}

        return res.end(buffer);
      }
    } catch (dbErr) {
      console.error('[Document Middleware DB Lookup Error]:', dbErr);
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
    app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));
    app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
    app.use(express.static(path.join(process.cwd(), 'public')));

    // Database fallback for /assets/* requests before SPA routing
    app.use('/assets', async (req, res, next) => {
      try {
        const assetUrl = `/assets${req.path}`;
        const dbFile = await db.getUploadedFileByUrl(assetUrl, req.path);
        if (dbFile && dbFile.file_data) {
          const buffer = Buffer.from(dbFile.file_data, 'base64');
          res.setHeader('Content-Type', dbFile.mime_type || 'application/octet-stream');
          res.setHeader('Content-Length', buffer.length);
          return res.end(buffer);
        }
      } catch (_) {}
      next();
    });

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
    app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));
    app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
    app.use(express.static(path.join(process.cwd(), 'public')));
    app.use(express.static(distPath));

    // Database fallback for /assets/* requests in production before SPA routing
    app.use('/assets', async (req, res, next) => {
      try {
        const assetUrl = `/assets${req.path}`;
        const dbFile = await db.getUploadedFileByUrl(assetUrl, req.path);
        if (dbFile && dbFile.file_data) {
          const buffer = Buffer.from(dbFile.file_data, 'base64');
          res.setHeader('Content-Type', dbFile.mime_type || 'application/octet-stream');
          res.setHeader('Content-Length', buffer.length);
          return res.end(buffer);
        }
      } catch (_) {}
      next();
    });

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
