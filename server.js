require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('database connection error:', err);
  } else {
    console.log('database connected successfully:', res.rows[0].now);
  }
});

let redisClient;
(async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL
    });
    
    redisClient.on('error', (err) => console.error('redis client error:', err));
    await redisClient.connect();
    console.log('redis connected successfully');
  } catch (error) {
    console.error('redis connection failed:', error);
  }
})();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'database connected', 
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    console.error('database test error:', error);
    res.status(500).json({ 
      status: 'database error', 
      error: error.message 
    });
  }
});

app.use('/api/auth', (req, res) => {
  res.status(501).json({ message: 'authentication routes coming soon' });
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

app.use((err, req, res, next) => {
  console.error('server error:', err.stack);
  res.status(500).json({ 
    error: 'something went wrong',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
  console.log(`environment: ${process.env.NODE_ENV}`);
});

process.on('SIGTERM', async () => {
  console.log('sigterm received, shutting down gracefully');
  await pool.end();
  if (redisClient) {
    await redisClient.quit();
  }
  process.exit(0);
});

module.exports = { app, pool, redisClient };
