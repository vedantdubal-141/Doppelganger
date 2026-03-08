const express = require('express');
const router = express.Router();
const { getFeed } = require('../controllers/communityController');

// Open to public
router.get('/feed', getFeed);

module.exports = router;
