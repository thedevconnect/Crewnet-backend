import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config();

// Database configuration with environment variable support
// Railway will automatically inject these, local uses .env or defaults
const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
  password: process.env.DB_PASS || process.env.MYSQL_PASSWORD || 'root@123',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'crewnet',
  port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10),
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
    console.log(`Database: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}`);
  } catch (error) {
    dbConnected = false;
    console.error('❌ MySQL Connection Error:', error.message);
    console.error('Connection config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user
    });
    // Don't crash server - allow retry later
  }
};

// Test connection on startup
testConnection();

// Export both pool and promisePool
export { pool, promisePool, dbConnected };
export default promisePool;

