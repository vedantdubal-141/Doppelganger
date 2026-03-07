const express = require('express');
const router = express.Router();
const { logInteraction, getUserHistory } = require('../controllers/interactionController');

// POST /api/interactions
router.post('/', logInteraction);

// GET /api/interactions/user/:userId
router.get('/user/:userId', getUserHistory);

module.exports = router;
