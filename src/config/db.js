import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config();

// Database configuration with environment variable support
// Railway will automatically inject these, local uses .env or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root@123',
  database: process.env.DB_NAME || 'crewnet',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Get promise-based pool
const promisePool = pool.promise();

// Test database connection (non-blocking)
let dbConnected = false;

const testConnection = async () => {
  try {
    await promisePool.execute('SELECT 1');
    dbConnected = true;
    console.log('✅ MySQL Connected');
  } catch (error) {
    dbConnected = false;
    console.error('❌ MySQL Connection Error:', error.message);
    // Don't crash server - allow retry later
  }
};

// Test connection on startup
testConnection();

// Export both pool and promisePool
export { pool, promisePool, dbConnected };
export default promisePool;

