import mysql from 'mysql2';

function parseMySqlUrl(urlString) {
  try {
    const u = new URL(urlString);
    if (!/^mysql2?:$/.test(u.protocol)) return null;
    return {
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : undefined,
      user: decodeURIComponent(u.username || ''),
      password: decodeURIComponent(u.password || ''),
      database: u.pathname ? u.pathname.replace(/^\//, '') : undefined
    };
  } catch {
    return null;
  }
}

// Database configuration with env var support
// Railway MySQL plugin commonly provides: MYSQL_URL and/or MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
const urlConfig =
  parseMySqlUrl(process.env.MYSQL_URL || process.env.DATABASE_URL || '');

const host =
  process.env.DB_HOST ||
  process.env.MYSQL_HOST ||
  process.env.MYSQLHOST ||
  urlConfig?.host ||
  'localhost';

const user =
  process.env.DB_USER ||
  process.env.MYSQL_USER ||
  process.env.MYSQLUSER ||
  urlConfig?.user ||
  'root';

const password =
  process.env.DB_PASS ||
  process.env.MYSQL_PASSWORD ||
  process.env.MYSQLPASSWORD ||
  urlConfig?.password ||
  'root@123';

const database =
  process.env.DB_NAME ||
  process.env.MYSQL_DATABASE ||
  process.env.MYSQLDATABASE ||
  urlConfig?.database ||
  'crewnet';

const port = parseInt(
  process.env.DB_PORT ||
    process.env.MYSQL_PORT ||
    process.env.MYSQLPORT ||
    (urlConfig?.port ? String(urlConfig.port) : '') ||
    '3306',
  10
);

const dbConfig = {
  host,
  user,
  password,
  database,
  port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ...(process.env.DB_SSL && process.env.DB_SSL.toLowerCase() === 'true'
    ? {
        ssl: {
          rejectUnauthorized:
            (process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'true').toLowerCase() ===
            'true'
        }
      }
    : {})
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

