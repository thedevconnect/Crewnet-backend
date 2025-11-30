require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const registerRoutes = require('./routes/registerRoutes');
const loginRoutes = require('./routes/loginRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
    connection.release();
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CrewNet Backend API is running' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint - Database me users check karne ke liye
app.get('/api/test-db', async (req, res) => {
  try {
    const promisePool = db.promise;
    
    // Check if users table exists and get all users
    const [users] = await promisePool.execute('SELECT * FROM users');
    
    res.json({
      success: true,
      message: 'Database connection successful',
      totalUsers: users.length,
      users: users
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
      code: error.code
    });
  }
});

// Register and Login routes with /api prefix
app.use('/api', registerRoutes);
app.use('/api', loginRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

