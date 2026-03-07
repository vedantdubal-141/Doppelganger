const db = require('../config/db');

const Product = {
    getAll: async (filters = {}) => {
        let query = 'SELECT * FROM products';
        const params = [];
        const conditions = [];

        if (filters.style) {
            conditions.push('style = ?');
            params.push(filters.style);
        }
        if (filters.category) {
            conditions.push('category = ?');
            params.push(filters.category);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.execute(query, params);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (productData) => {
        const { name, category, style, color, image_url, embedding_vector, popularity_score } = productData;
        const [result] = await db.execute(
            'INSERT INTO products (name, category, style, color, image_url, embedding_vector, popularity_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, category, style, color, image_url, JSON.stringify(embedding_vector), popularity_score || 0]
        );
        return result.insertId;
    },

    getTrending: async (limit = 5) => {
        const [rows] = await db.execute(
            'SELECT * FROM products ORDER BY popularity_score DESC LIMIT ?',
            [limit]
        );
        return rows;
    }
};

module.exports = Product;
