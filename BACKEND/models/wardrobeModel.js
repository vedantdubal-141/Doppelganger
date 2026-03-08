const db = require('../config/db');

const Wardrobe = {
    saveDesign: async (userId, designId) => {
        const [result] = await db.execute(
            'INSERT INTO saved_wardrobes (user_id, design_id) VALUES (?, ?)',
            [userId, designId]
        );
        return result;
    },

    getSavedDesigns: async (userId) => {
        const [rows] = await db.execute(
            'SELECT design_id FROM saved_wardrobes WHERE user_id = ?',
            [userId]
        );
        return rows.map(row => row.design_id);
    },

    removeDesign: async (userId, designId) => {
        const [result] = await db.execute(
            'DELETE FROM saved_wardrobes WHERE user_id = ? AND design_id = ?',
            [userId, designId]
        );
        return result;
    }
};

module.exports = Wardrobe;
