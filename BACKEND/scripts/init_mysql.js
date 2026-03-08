const db = require('../config/db');

const initMySQL = async () => {
    try {
        console.log('⏳ Initializing MySQL Tables...');

        // 1. Users Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                level INT DEFAULT 1,
                joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                biometrics_height FLOAT NULL,
                biometrics_weight FLOAT NULL,
                biometrics_shoulder FLOAT NULL,
                biometrics_waist FLOAT NULL,
                body_type VARCHAR(50) NULL
            )
        `);
        console.log('✅ Users table ready');

        // 2. Designs Table (MySQL Metadata)
        await db.execute(`
            CREATE TABLE IF NOT EXISTS designs (
                id VARCHAR(50) PRIMARY KEY, -- Using VARCHAR to accommodate MongoDB IDs or UUIDs
                name VARCHAR(255) NOT NULL,
                image_url VARCHAR(500),
                author_id INT NULL,
                is_published BOOLEAN DEFAULT FALSE,
                likes_count INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Designs table ready');

        // 3. Design Tags Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS design_tags (
                design_id VARCHAR(50) NOT NULL,
                tag_name VARCHAR(50) NOT NULL,
                PRIMARY KEY (design_id, tag_name),
                FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Design Tags table ready');

        // 4. Saved Wardrobes Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS saved_wardrobes (
                user_id INT NOT NULL,
                design_id VARCHAR(50) NOT NULL,
                saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, design_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Saved Wardrobes table ready');

        // 5. Community Feed Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS community_feed (
                design_id VARCHAR(50) PRIMARY KEY,
                author_username VARCHAR(50) NOT NULL,
                published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Community Feed table ready');

        console.log('✨ MySQL Initialization Complete');
    } catch (err) {
        console.error('❌ MySQL Initialization Error:', err.message);
    }
};

if (require.main === module) {
    initMySQL().then(() => process.exit());
}

module.exports = initMySQL;
