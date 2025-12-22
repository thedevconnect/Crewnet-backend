import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (${NODE_ENV})`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log('Health check: /health');
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  if (NODE_ENV !== 'production') {
    server.close(() => process.exit(1));
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

export default server;

