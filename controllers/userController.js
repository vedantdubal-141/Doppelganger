const db = require('../config/db');

const createUserProfile = async (req, res, next) => {
    try {
        const { name, height, weight, body_type } = req.body;

        if (!name || !height || !weight || !body_type) {
            res.status(400);
            throw new Error('Please provide name, height, weight, and body_type');
        }

        const query = `
      INSERT INTO users (name, height, weight, body_type)
      VALUES (?, ?, ?, ?)
    `;
        const values = [name, height, weight, body_type];

        const [result] = await db.query(query, values);

        // Returning the newly created user ID
        res.status(201).json({
            userId: result.insertId,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUserProfile,
};
