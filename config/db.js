const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool to MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fashion_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection
pool.getConnection()
  .then((connection) => {
    console.log(`Connected to MySQL database: ${process.env.DB_NAME || 'fashion_ai'}`);
    connection.release();
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err.message);
  });

module.exports = pool;
