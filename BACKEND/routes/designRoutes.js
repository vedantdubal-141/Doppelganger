const express = require('express');
const router = express.Router();
const { publishDesign } = require('../controllers/designController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:designId/publish', protect, publishDesign);

module.exports = router;
