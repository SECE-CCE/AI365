import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import app from './api/index';

async function startServer() {
  const PORT = 3000;

  // Vite middleware for dev or static dist serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use(express.static(path.join(process.cwd(), 'public')));
    app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
    app.use('/documents', express.static(path.join(process.cwd(), 'assets', 'Documents')));

    app.use('*', async (req, res, next) => {
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
    app.use(express.static(path.join(process.cwd(), 'public')));
    app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
    app.use('/documents', express.static(path.join(process.cwd(), 'assets', 'Documents')));

    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI365 @ CCE server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AI365 @ CCE server:', err);
});
