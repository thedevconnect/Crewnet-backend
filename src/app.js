import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import employeeRoutes from './routes/employee.routes.js';
import employeeOnboardingRoutes from './routes/employee-onboarding.routes.js';
import authRoutes from './routes/auth.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import { verifyToken } from './middlewares/auth.middleware.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration (production-ready for Vercel)
const isProd = process.env.NODE_ENV === 'production';
const allowCredentials =
  (process.env.CORS_CREDENTIALS ?? 'true').toLowerCase() === 'true';

const rawOrigins =
  process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
const allowedOrigins = rawOrigins
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const hasWildcardOrigin = allowedOrigins.includes('*');
const explicitOrigins = allowedOrigins.filter((o) => o !== '*');

const originRegexRaw = process.env.CORS_ORIGIN_REGEX;
const originRegex = originRegexRaw ? new RegExp(originRegexRaw) : null;

const corsOptions = {
  origin(origin, callback) {
    // Non-browser or same-origin requests may have no Origin header
    if (!origin) return callback(null, true);

    // Back-compat / opt-in: allow any origin (reflects origin when credentials=true)
    if (hasWildcardOrigin) return callback(null, true);

    // Explicit allow-list
    if (explicitOrigins.includes(origin)) return callback(null, true);

    // Optional regex allow (useful for Vercel preview URLs)
    if (originRegex && originRegex.test(origin)) return callback(null, true);

    // Dev convenience: allow localhost/127.0.0.1 by default
    if (!isProd) {
      try {
        const u = new URL(origin);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
          return callback(null, true);
        }
      } catch {
        // ignore URL parse errors
      }
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: allowCredentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// If no origins are configured and credentials are off, you can opt into allow-all
if (
  (process.env.CORS_ALLOW_ALL ?? 'false').toLowerCase() === 'true' &&
  !allowCredentials
) {
  app.use(cors({ origin: '*', credentials: false }));
} else {
  app.use(cors(corsOptions));
}

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  let dbStatus = 'error';
  try {
    const { promisePool } = await import('./config/db.js');
    await promisePool.execute('SELECT 1');
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'error';
  }
  res.json({
    status: 'ok',
    db: dbStatus,
    env: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees-onboarding', employeeOnboardingRoutes);
app.use('/api/attendance', verifyToken, attendanceRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;

