const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/analyze/upload
router.post('/upload', protect, upload.fields([
    { name: 'inspirations', maxCount: 10 },
    { name: 'purchases', maxCount: 10 }
]), uploadImage);

module.exports = router;
