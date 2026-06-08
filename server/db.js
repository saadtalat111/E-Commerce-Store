// filepath: c:\Users\aimra\Desktop\MusaProject\server\db.js
require('dotenv').config(); // Load environment variables from .env file
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE, // Make sure this matches your .env (DB_DATABASE or DB_NAME)
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export the pool instance directly
module.exports = pool;