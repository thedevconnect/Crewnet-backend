const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================================
// REGISTER API - POST /register
// ============================================
// Create new user
// Request body: { name: "John Doe", email: "john@example.com", password: "password123" }
// Response: { success: true, message: "User created successfully", user: {...} }
router.post('/register', async (req, res) => {
  try {
    // Extract data from request body
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
        message: 'Name, email and password cannot be empty'
      });
    }

    // Step 3: Check if email already exists
    const promisePool = db.promise;
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

    // Step 4: Store password directly (plain text - NOT RECOMMENDED for production)
    // Note: In production, password should be hashed for security
    // Step 5: Insert user into database
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

    // Step 6: Send success response
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

