const express = require('express');
const router = express.Router();
const { createUserProfile } = require('../controllers/userController');

// POST /api/users/create
router.post('/create', createUserProfile);

module.exports = router;
