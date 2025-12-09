require('dotenv').config();
const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '103.30.72.61',
  user: process.env.DB_USER || 'sam',
  password: process.env.DB_PASS || 'Ssam@123',
  database: process.env.DB_NAME || 'crewnet',
  port: process.env.DB_PORT || 8011,   // ⭐ Railway ke liye important
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based pool
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
  } else {
    console.log('✅ Database pool created successfully');
    connection.release();
  }
});

// Export both callback and promise-based pool
module.exports = pool;
module.exports.promise = promisePool;
