const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// Debug endpoint - Check user by email (testing ke liye)
router.get('/check-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const promisePool = db.promise;
    const [users] = await promisePool.execute(
      'SELECT id, name, email, password, LENGTH(password) as password_length FROM users WHERE email = ?',
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
// LOGIN API - POST /login
// ============================================
// Angular se ye endpoint call hoga
// Request body: { email: "user@example.com", password: "password123" }
// Response: { success: true, token: "jwt_token", user: {...} }
router.post('/login', async (req, res) => {
  try {
    // Step 1: Request body se email aur password le rahe hain
    const { email, password } = req.body;

    console.log('Login attempt:', { email, passwordLength: password?.length });

    // Step 2: Validation - check karo ki email aur password mila hai ya nahi
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email aur password dono required hain'
      });
    }

    // Step 3: Database se user find karo email se
    const promisePool = db.promise;
    const [users] = await promisePool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    console.log('User found:', users.length > 0 ? 'Yes' : 'No');

    // Step 4: Check karo ki user exist karta hai ya nahi
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email ya password'
      });
    }

    const user = users[0];
    console.log('User from DB:', { id: user.id, email: user.email, dbPasswordLength: user.password?.length });

    // Step 5: Password verify karo (plain text comparison)
    // Note: Plain text password comparison (NOT RECOMMENDED for production)
    // Direct comparison without trim (as stored in DB)
    console.log('Password comparison:', {
      inputPassword: password,
      dbPassword: user.password,
      inputLength: password?.length,
      dbLength: user.password?.length,
      match: password === user.password
    });

    if (!user.password || password !== user.password) {
      console.log('Password mismatch!');
      return res.status(401).json({
        success: false,
        message: 'Invalid email ya password'
      });
    }

    // Step 6: Password sahi hai, ab JWT token generate karo
    // Token me user ki basic info store karte hain (password nahi!)
    
    // Check if JWT_SECRET exists
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
      { expiresIn: '7d' } // Token 7 din tak valid rahega
    );

    console.log('Login successful, token generated for user:', user.email);

    // Step 7: Success response bhejo
    // Password ko response me include mat karo (security ke liye)
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
        // password field intentionally excluded
      }
    });

  } catch (error) {
    // Step 8: Agar koi error aaye to handle karo
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

