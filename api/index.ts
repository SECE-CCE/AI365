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

const enableHsts = process.env.ENABLE_HSTS === 'true';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Security Middlewares & HTTP Headers
app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:", "wss:", "ws:", "data:", "blob:"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginOpenerPolicy: isDevelopment ? false : undefined,
  originAgentCluster: isDevelopment ? false : undefined,
  xFrameOptions: { action: 'deny' },
  xContentTypeOptions: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  strictTransportSecurity: enableHsts ? {
    maxAge: 31536000,
    includeSubDomains: true,
  } : false,
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
