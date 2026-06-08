// filepath: c:\Users\aimra\Desktop\MusaProject\server\index.js
require('dotenv').config(); // Ensure env vars are loaded early
const express = require('express');
const cors = require('cors'); // Import cors
const db = require('./db'); // Import the db configuration
const app = express();
const authRoutes = require('./routes/auth'); // Import the auth routes
const productRoutes = require('./routes/products'); // Import product routes
const cartRoutes = require('./routes/cart'); // Import cart routes
const orderRoutes = require('./routes/orders'); // Import order routes
const categoryRoutes = require('./routes/categories'); 
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/auth', authRoutes); // Mount auth routes under /api/auth prefix
app.use('/api/products', productRoutes); // Mount product routes
app.use('/api/cart', cartRoutes); // Mount cart routes
app.use('/api/orders', orderRoutes); // Mount order routes
app.use('/api/categories', categoryRoutes); // Mount/Ensure it's mounted


// Test DB connection route (optional, good for verification)
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()'); // Simple query
    res.json({ message: 'DB Connection Successful!', time: result.rows[0].now });
  } catch (err) {
    console.error('DB Connection Error:', err);
    res.status(500).json({ message: 'DB Connection Failed', error: err.message });
  }
});

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});