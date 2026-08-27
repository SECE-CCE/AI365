import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import authRoutes from './auth/index.js';
import studentRoutes from './students/index.js';
import facultyRoutes from './faculty/index.js';
import adminRoutes from './admin/index.js';
import eventRoutes from './events/index.js';
import visitorRoutes from './visitor/index.js';
import leaderboardRoutes from './leaderboard/index.js';
import notificationRoutes from './notifications/index.js';
import searchRoutes from './search/index.js';
import uploadRoutes from './upload/index.js';
import analyticsRoutes from './analytics/index.js';

const app = express();

// Middlewares
app.use('/api', helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

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
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'AI365 @ CCE', timestamp: new Date().toISOString() });
});

export default app;
