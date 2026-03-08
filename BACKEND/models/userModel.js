const db = require('../config/db');

const User = {
    create: async (userData) => {
        const { username, email, password_hash, height, weight, shoulder, waist, body_type, level } = userData;
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password_hash, biometrics_height, biometrics_weight, biometrics_shoulder, biometrics_waist, body_type, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [username, email, password_hash, height, weight, shoulder, waist, body_type, level || 1]
        );
        return result.insertId;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }
};

module.exports = User;
