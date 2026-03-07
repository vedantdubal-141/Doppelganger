const express = require('express');
const router = express.Router();
const { getProducts, getTrendingProducts } = require('../controllers/productController');

// GET /api/products
router.get('/', getProducts);

// GET /api/products/trending
router.get('/trending', getTrendingProducts);

module.exports = router;
