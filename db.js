require('dotenv').config();
const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
  // Railway/local: use environment variables (no hardcoded remote host)
  host: process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
  password: process.env.DB_PASS || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || 'root@123',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'crewnet',
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306', 10),
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
