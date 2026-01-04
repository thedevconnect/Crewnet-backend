import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employee.routes.js';
import employeeOnboardingRoutes from './routes/employee-onboarding.routes.js';
import authRoutes from './routes/auth.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leavesRoutes from './routes/leaves.routes.js';
import { verifyToken } from './middlewares/auth.middleware.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['*'];
    
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    
    // Allow all origins if '*' is set
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees-onboarding', employeeOnboardingRoutes);
app.use('/api/attendance', verifyToken, attendanceRoutes);
app.use('/api/leaves', leavesRoutes);

console.log('✅ Routes registered:');
console.log('  - /api/attendance/swipe-in (POST)');
console.log('  - /api/attendance/swipe-out (POST)');
console.log('  - /api/attendance/today/:employeeId (GET)');

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

