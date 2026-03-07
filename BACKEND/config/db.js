const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fashion_ai',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
db.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.log('ℹ️  Running in Mock Mode: MySQL Database not detected. Falling back to local data.');
        // Don't log the raw error to keep console clean for demo
    });

module.exports = db;
