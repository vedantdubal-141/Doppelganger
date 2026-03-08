const express = require('express');
const router = express.Router();
const { createUser, getUserProfile } = require('../controllers/userController');
const { getMe, updateBiometrics, saveDesign, removeSavedDesign } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Legacy routes
// POST /api/users
router.post('/', createUser);
// GET /api/users/:id
router.get('/:id', getUserProfile);

// New Auth-protected API routes
router.get('/me', protect, getMe);
router.put('/me/biometrics', protect, updateBiometrics);
router.post('/me/saved', protect, saveDesign);
router.delete('/me/saved/:designId', protect, removeSavedDesign);

module.exports = router;
