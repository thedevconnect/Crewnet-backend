import express from 'express';
import jwt from 'jsonwebtoken';
import { promisePool } from '../config/db.js';

const router = express.Router();

// ============================================
// REGISTER API - POST /register
// ============================================
router.post('/register', async (req, res) => {
  try {
    console.log('🔐 Register request received:', {
      body: req.body,
      hasName: !!req.body?.name,
      hasEmail: !!req.body?.email,
      hasPassword: !!req.body?.password
    });

    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields: missingFields
      });
    }

    // Check if fields are not empty strings
    if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password cannot be empty'
      });
    }

    // Check if email already exists
    const [existingUsers] = await promisePool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    // Insert user into database
    console.log('Attempting to insert user:', { name, email });
    const [result] = await promisePool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    
    console.log('✅ User registered successfully:', { id: result.insertId, email });

    res.status(201).json({
      success: true,
      message: 'User successfully created',
      user: {
        id: result.insertId,
        name: name,
        email: email
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// LOGIN API - POST /login
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email, passwordLength: password?.length });

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const [users] = await promisePool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    console.log('User found:', users.length > 0 ? 'Yes' : 'No');

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];
    console.log('User from DB:', { id: user.id, email: user.email });

    // Verify password (plain text comparison)
    console.log('Password comparison:', {
      inputPassword: password,
      dbPassword: user.password,
      match: password === user.password
    });

    if (!user.password || password !== user.password) {
      console.log('❌ Password mismatch!');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET missing in .env file');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact administrator.'
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful, token generated for user:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Debug endpoint - Check user by email
router.get('/check-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const [users] = await promisePool.execute(
      'SELECT id, name, email, LENGTH(password) as password_length FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.json({
        success: false,
        message: 'User not found',
        email: email
      });
    }
    
    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET ALL USERS - For Dashboard
// ============================================
router.get('/users', async (req, res) => {
  console.log('🔵 GET /users route hit');
  try {
    const { page = 1, limit = 100, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT id, name, email, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    // Search by name or email
    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    if (search) {
      countSql += ' AND (name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const [countResult] = await promisePool.execute(countSql, countParams);
    const total = countResult[0].total;

    // Get users with pagination
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await promisePool.execute(sql, params);

    res.json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users: users,
        pagination: {
          total: total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// DASHBOARD - Get all records (Users + Employees)
// ============================================
router.get('/dashboard', async (req, res) => {
  console.log('🔵 GET /dashboard route hit');
  try {
    // Get all users
    const [users] = await promisePool.execute(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    );

    // Get all employees
    const [employees] = await promisePool.execute(
      'SELECT id, name, email, phone, department, status, joiningDate, createdAt FROM employees ORDER BY createdAt DESC'
    );

    // Get counts
    const [userCount] = await promisePool.execute('SELECT COUNT(*) as total FROM users');
    const [employeeCount] = await promisePool.execute('SELECT COUNT(*) as total FROM employees');

    res.json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: {
        users: users,
        employees: employees,
        counts: {
          totalUsers: userCount[0].total,
          totalEmployees: employeeCount[0].total
        }
      }
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Log route registration
console.log('✅ Auth routes loaded: /register, /login, /users, /dashboard, /check-user/:email');

export default router;

