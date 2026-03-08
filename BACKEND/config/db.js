const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fashion_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

try {
  pool = mysql.createPool(dbConfig);

  // Test connection
  pool.getConnection()
    .then(connection => {
      console.log('✅ MySQL Database connected successfully');
      connection.release();
    })
    .catch(err => {
      console.error('❌ MySQL Connection Error:', err.message);
      console.log('ℹ️ Running in Mock Mode: MySQL Database not detected. Falling back to local data.');
    });
} catch (err) {
  console.error('❌ Failed to initialize MySQL Pool:', err.message);
}

// Mocking the query interface if DB is down
const db = {
  execute: async (sql, params) => {
    if (!pool) throw new Error('DB Pool not initialized');
    try {
      return await pool.execute(sql, params);
    } catch (err) {
      console.warn(`⚠️ DB Query Failed: ${err.message}. Returning mock response.`);
      if (sql.trim().toUpperCase().startsWith('INSERT')) {
        return [{ insertId: Date.now() }];
      }
      return [[]]; // Return empty rows
    }
  },
  query: async (sql, params) => {
    if (!pool) throw new Error('DB Pool not initialized');
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.warn(`⚠️ DB Query Failed: ${err.message}. Returning mock response.`);
      return [[]];
    }
  },
  getConnection: async () => {
    if (!pool) throw new Error('DB Pool not initialized');
    return await pool.getConnection();
  }
};

module.exports = db;
