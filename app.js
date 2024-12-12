const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Assuming db.js exports a MySQL pool (promise-based)
const carsRoutes = require('./routes/cars_data');

const app = express();
const port = 4000;

// Middleware
app.use(express.json()); // For parsing JSON bodies
app.use(cors()); // Enable CORS if required

// Routes
app.use('/cars_data', carsRoutes);

// Test Database Connection (using promise-based connection)
(async () => {
  try {
    const connection = await pool.getConnection(); // Using promise-based getConnection
    console.log('Database connected successfully!');
    connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
})();

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Global Error Handler (Optional for handling errors gracefully)
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

// Catch-all for 404 errors
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found.' });
});
