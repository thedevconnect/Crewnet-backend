import express from 'express';
import jwt from 'jsonwebtoken';
import { promisePool } from '../config/db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    const [existingUsers] = await promisePool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    const [result] = await promisePool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), password]
    );

    res.status(201).json({
      success: true,
      message: 'User successfully created',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim()
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Employee Code and password are required'
      });
    }

    const loginIdentifier = email.trim();

    let users;
    try {
      // Try to login with email or employee_code
      // Check if employee_code column exists first
      try {
        [users] = await promisePool.execute(
          'SELECT id, name, email, password, employee_code FROM users WHERE email = ? OR employee_code = ?',
          [loginIdentifier, loginIdentifier]
        );
      } catch (columnError) {
        // If employee_code column doesn't exist, fallback to email only
        if (columnError.message.includes('Unknown column')) {
          [users] = await promisePool.execute(
          'SELECT id, name, email, password FROM users WHERE email = ?',
          [loginIdentifier]
        );
        } else {
          throw columnError;
        }
      }
    } catch (dbError) {
      console.error('[LOGIN] Database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/employee code or password'
      });
    }

    const storedPassword = users[0].password;
    if (password !== storedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/employee code or password'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const user = users[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT id, name, email, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const [countResult] = await promisePool.execute(
      search ? 'SELECT COUNT(*) as total FROM users WHERE name LIKE ? OR email LIKE ?' : 'SELECT COUNT(*) as total FROM users',
      search ? [`%${search}%`, `%${search}%`] : []
    );
    const total = countResult[0].total;

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await promisePool.execute(sql, params);

    res.json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const [users] = await promisePool.execute(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    );
    const [employees] = await promisePool.execute(
      'SELECT id, name, email, phone, department, status, joiningDate, createdAt FROM employees ORDER BY createdAt DESC'
    );
    const [userCount] = await promisePool.execute('SELECT COUNT(*) as total FROM users');
    const [employeeCount] = await promisePool.execute('SELECT COUNT(*) as total FROM employees');

    res.json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: {
        users,
        employees,
        counts: {
          totalUsers: userCount[0].total,
          totalEmployees: employeeCount[0].total
        }
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

