const express = require('express');
const router = express.Router();
const { generateTryOn } = require('../controllers/tryonController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateTryOn);

module.exports = router;
