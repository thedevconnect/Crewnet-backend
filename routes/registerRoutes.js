const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================================
// REGISTER API - POST /register
// ============================================
// Naya user create karne ke liye (testing ke liye useful hai)
// Request body: { name: "John Doe", email: "john@example.com", password: "password123" }
// Response: { success: true, message: "User created successfully", user: {...} }
router.post('/register', async (req, res) => {
  try {
    // Step 1: Request body se data le rahe hain
    console.log('Register request received:', {
      body: req.body,
      hasName: !!req.body?.name,
      hasEmail: !!req.body?.email,
      hasPassword: !!req.body?.password
    });

    const { name, email, password } = req.body;

    // Step 2: Validation with detailed error messages
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

    // Additional validation - check if fields are not empty strings
    if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name, email aur password empty nahi ho sakte'
      });
    }

    // Step 3: Check karo ki email already exist karta hai ya nahi
    const promisePool = db.promise;
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

    // Step 4: Password ko directly store karo (plain text - NOT RECOMMENDED for production)
    // Note: Production me password ko hash karna chahiye security ke liye
    // Step 5: Database me user insert karo
    console.log('Attempting to insert user:', { name, email });
    const [result] = await promisePool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    
    console.log('Insert result:', result);
    console.log('Inserted user ID:', result.insertId);

    // Verify the insert by fetching the user
    const [insertedUser] = await promisePool.execute(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );
    
    console.log('Verified inserted user:', insertedUser);

    // Step 6: Success response bhejo
    res.status(201).json({
      success: true,
      message: 'User successfully created',
      user: {
        id: result.insertId,
        name: name,
        email: email
        // password intentionally excluded
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

