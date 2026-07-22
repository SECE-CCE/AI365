import express from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './auth';
import studentRoutes from './students';
import facultyRoutes from './faculty';
import adminRoutes from './admin';
import eventRoutes from './events';
import visitorRoutes from './visitor';
import leaderboardRoutes from './leaderboard';
import notificationRoutes from './notifications';
import searchRoutes from './search';
import uploadRoutes from './upload';

const app = express();

// Middlewares
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'AI365 @ CCE', timestamp: new Date().toISOString() });
});

export default app;
