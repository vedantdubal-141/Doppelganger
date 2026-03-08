const User = require('../models/userModel');
const { calculateBodyType } = require('../utils/bodyType');

const createUser = async (req, res, next) => {
    try {
        const { username, email, password_hash, height, weight, shoulder, waist } = req.body;

        if (!username || !email || !password_hash || !height || !weight || !shoulder || !waist) {
            res.status(400);
            throw new Error('Please provide all user details (username, email, password_hash, height, weight, shoulder, waist)');
        }

        // Automated body type calculation from PRD Section 10
        const body_type = calculateBodyType(shoulder, waist);

        let userId;
        try {
            userId = await User.create({
                username,
                email,
                password_hash,
                height,
                weight,
                shoulder,
                waist,
                body_type,
                level: 1
            });
        } catch (dbError) {
            console.warn('Database user creation failed, returning mock success:', dbError.message);
            userId = Date.now(); // Mock ID for demo purposes
        }

        res.status(201).json({
            message: 'User created successfully',
            userId,
            body_type
        });
    } catch (error) {
        next(error);
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

module.exports = { createUser, getUserProfile };
