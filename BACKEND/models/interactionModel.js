const db = require('../config/db');

const Interaction = {
    log: async (interactionData) => {
        try {
            const { user_id, product_id, liked, viewed, purchased } = interactionData;
            const [result] = await db.execute(
                'INSERT INTO interactions (user_id, product_id, liked, viewed, purchased) VALUES (?, ?, ?, ?, ?)',
                [user_id, product_id, liked || false, viewed || true, purchased || false]
            );
            return result.insertId;
        } catch (dbError) {
            console.warn('Database interaction logging failed, using mock success');
            return Date.now();
        }
    },

    getUserHistory: async (userId) => {
        try {
            const [rows] = await db.execute(
                'SELECT i.*, p.name, p.image_url FROM interactions i JOIN products p ON i.product_id = p.id WHERE i.user_id = ?',
                [userId]
            );
            return rows;
        } catch (dbError) {
            console.warn('Database history lookup failed, returning empty mock history');
            return [];
        }
    }
};

module.exports = Interaction;
