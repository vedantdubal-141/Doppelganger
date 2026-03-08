const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Generate JWT
const generateToken = (id, username, email) => {
    return jwt.sign({ id, username, email }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        const insertId = result[0]?.insertId;

        if (insertId) {
            res.status(201).json({
                token: generateToken(insertId, username, email),
                user: {
                    id: insertId,
                    username,
                    email
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users && users.length > 0 ? users[0] : null;

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            // fetch savedOutfits
            const [savedOutfits] = await db.query('SELECT * FROM saved_wardrobes WHERE user_id = ?', [user.id]);

            res.json({
                token: generateToken(user.id, user.username, user.email),
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    biometrics: {
                        height: user.biometrics_height || null,
                        weight: user.biometrics_weight || null,
                        shoulderWidth: user.biometrics_shoulder || null,
                        waist: user.biometrics_waist || null
                    },
                    savedOutfits: savedOutfits || []
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
