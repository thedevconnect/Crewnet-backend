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
        message: 'Name, email aur password empty nahi ho sakte'
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
        message: 'Ye email already registered hai'
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
        message: 'Email aur password dono required hain'
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
        message: 'Invalid email ya password'
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
        message: 'Invalid email ya password'
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

export default router;

