const express = require('express');
const router = express.Router();
const { createUser, getUserProfile } = require('../controllers/userController');

// POST /api/users
router.post('/', createUser);

// GET /api/users/:id
router.get('/:id', getUserProfile);

module.exports = router;
