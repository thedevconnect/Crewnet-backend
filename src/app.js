import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employee.routes.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.originalUrl} - Path: ${req.path}`);
  next();
});

// Test route
app.post('/test-route', (req, res) => {
  res.json({ success: true, message: 'Test route works' });
});

// Health check route with DB status
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
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Diagnostic route - check database tables
app.get('/api/diag/tables', async (req, res) => {
  try {
    const { promisePool } = await import('./config/db.js');
    const [tables] = await promisePool.execute(
      'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
      [process.env.DB_NAME || 'crewnet']
    );
    res.json({
      success: true,
      tables: tables.map(t => t.TABLE_NAME)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API routes - Register BEFORE 404 handler
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// Debug route registration
console.log('✅ Auth routes registered at /api/auth');
console.log('✅ Employee routes registered at /api/employees');
console.log('📋 Available routes:');
console.log('   POST /api/auth/register');
console.log('   POST /api/auth/login');
console.log('   GET  /api/auth/profile/:id');

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;

