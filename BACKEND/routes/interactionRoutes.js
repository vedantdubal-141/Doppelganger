const express = require('express');
const router = express.Router();
const { logInteraction, getUserHistory } = require('../controllers/interactionController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/interactions
router.post('/', protect, logInteraction);

// GET /api/interactions/user/:userId
router.get('/user/:userId', protect, getUserHistory);

module.exports = router;
