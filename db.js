const mysql = require('mysql2/promise');  // Use the promise-based version
require('dotenv').config();  // Load environment variables from .env file

// Create a connection pool for efficient handling of database connections
const db = mysql.createPool({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Database name
  port: process.env.PORT || 3306, // Default MySQL port if not defined in the environment variables
});

// Test the connection to ensure it's working (async/await style)
(async () => {
  try {
    const connection = await db.getConnection();  // Using promise-based getConnection
    console.log("Connected to the database.");
    connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
})();

module.exports = db;
