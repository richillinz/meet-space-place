require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const port = process.env.PORT || 3000;

// database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// redis connection
let redisClient;
(async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });
  
  redisClient.on('error', (err) => console.error('redis client error', err));
  await redisClient.connect();
  console.log('redis connected');
})();

// middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// database connection test
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'database connected', 
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'database error', 
      error: error.message 
    });
  }
});

// placeholder routes - will be implemented next
app.use('/api/auth', (req, res) => {
  res.status(501).json({ message: 'auth routes coming soon' });
});

app.use('/api/users', (req, res) => {
  res.status(501).json({ message: 'user routes coming soon' });
});

app.use('/api/events', (req, res) => {
  res.status(501).json({ message: 'event routes coming soon' });
});

app.use('/api/interests', (req, res) => {
  res.status(501).json({ message: 'interest routes coming soon' });
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'something went wrong',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// start server
app.listen(port, () => {
  console.log(`server running on port ${port}`);
  console.log(`environment: ${process.env.NODE_ENV}`);
});

// graceful shutdown
process.on('SIGTERM', async () => {
  console.log('sigterm received, shutting down gracefully');
  await pool.end();
  await redisClient.quit();
  process.exit(0);
});

module.exports = { app, pool, redisClient };
