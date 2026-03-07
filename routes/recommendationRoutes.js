const express = require('express');
const router = express.Router();
const { recommendProducts } = require('../controllers/recommendationController');
const { uploadImage } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');

// POST /api/recommend/upload
router.post('/upload', upload.single('image'), uploadImage);

// GET /api/recommend/:userId
router.get('/:userId', recommendProducts);

module.exports = router;
