import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';

import authRoutes from './api/auth';
import studentRoutes from './api/students';
import facultyRoutes from './api/faculty';
import adminRoutes from './api/admin';
import eventRoutes from './api/events';
import visitorRoutes from './api/visitor';
import leaderboardRoutes from './api/leaderboard';
import notificationRoutes from './api/notifications';
import searchRoutes from './api/search';
import uploadRoutes from './api/upload';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(express.static(path.join(process.cwd(), 'public')));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/faculty', facultyRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/visitor', visitorRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/upload', uploadRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'AI365 @ CCE', timestamp: new Date().toISOString() });
  });

  // Vite middleware for dev or static dist serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
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
