const db = require('../config/db');

const User = {
    create: async (userData) => {
        const { name, height, weight, shoulder_width, waist, body_type } = userData;
        const [result] = await db.execute(
            'INSERT INTO users (name, height, weight, shoulder_width, waist, body_type) VALUES (?, ?, ?, ?, ?, ?)',
            [name, height, weight, shoulder_width, waist, body_type]
        );
        return result.insertId;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = User;
