const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Global Promise for the SQLite DB connection
let dbPromise;

async function getDb() {
    if (!dbPromise) {
        dbPromise = open({
            filename: path.join(__dirname, 'test.db'),
            driver: sqlite3.Database
        }).then(async (db) => {
            // Run migrations
            await db.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE,
            email VARCHAR(255) UNIQUE,
            password_hash VARCHAR(255),
            level INTEGER DEFAULT 1,
            biometrics_height FLOAT,
            biometrics_weight FLOAT,
            biometrics_shoulder FLOAT,
            biometrics_waist FLOAT,
            joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

<<<<<<< HEAD
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
=======
          CREATE TABLE IF NOT EXISTS designs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255),
            image_url VARCHAR(500),
            author_id INTEGER,
            is_published BOOLEAN DEFAULT 0,
            likes_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(author_id) REFERENCES users(id)
          );
>>>>>>> 6887f95 (feat(backend): Implement StyleForge API requirements (Part 1))

          CREATE TABLE IF NOT EXISTS design_tags (
            design_id INTEGER,
            tag_name VARCHAR(50),
            PRIMARY KEY (design_id, tag_name),
            FOREIGN KEY(design_id) REFERENCES designs(id)
          );

          CREATE TABLE IF NOT EXISTS saved_wardrobes (
            user_id INTEGER,
            design_id INTEGER,
            saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, design_id),
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(design_id) REFERENCES designs(id)
          );

          CREATE VIEW IF NOT EXISTS community_feed AS
            SELECT d.id AS design_id, d.name AS design_name, d.image_url, u.username AS author_username, d.created_at AS published_at, d.likes_count
            FROM designs d
            JOIN users u ON d.author_id = u.id
            WHERE d.is_published = 1;
          
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(150),
            category VARCHAR(50),
            style VARCHAR(50),
            color VARCHAR(50),
            image_url TEXT,
            embedding_vector TEXT,
            popularity_score FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

            // Seed some dummy product data for testing Ankit's filters
            const { count } = await db.get('SELECT COUNT(*) as count FROM products');
            if (count === 0) {
                await db.run(`INSERT INTO products (name, category, style, color, popularity_score) VALUES 
                ('Black Jacket', 'jacket', 'streetwear', 'black', 0.8),
                ('Blue Jeans', 'pants', 'casual', 'blue', 0.9),
                ('Red Dress', 'dress', 'party', 'red', 0.6)
            `);
            }

            console.log('Connected to local SQLite database for testing.');
            return db;
        });
    }
    return dbPromise;
}

// Mocking the mysql2 pool interface that Ankit wrote in controllers
const poolMock = {
    getConnection: async () => {
        const db = await getDb();
        return { release: () => { } };
    },
    query: async (queryStr, params) => {
        const db = await getDb();
        // Translate MySQL '?' to SQLite param array
        const result = await db.all(queryStr, params);

        // In mysql2, insert queries return an object with insertId in the first element of an array
        if (queryStr.trim().toUpperCase().startsWith('INSERT')) {
            const { lastID } = await db.run(queryStr, params);
            return [{ insertId: lastID }];
        }

        return [result]; // mysql2 returns [rows, fields]
    }
};

// Initialize DB when this file is required
getDb().catch(console.error);

module.exports = poolMock;
