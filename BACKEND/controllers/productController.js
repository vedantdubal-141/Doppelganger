const fs = require('fs');
const path = require('path');
const Design = require('../models/designModel');

const getProducts = async (req, res, next) => {
  try {
    let products;
    try {
      products = await Design.find();
    } catch (dbError) {
      console.warn('MongoDB design lookup failed, falling back to JSON data');
      const dataPath = path.join(__dirname, '../data/products.json');
      const productsData = fs.readFileSync(dataPath, 'utf-8');
      products = JSON.parse(productsData);
    }

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getTrendingProducts = async (req, res, next) => {
  try {
    let products;
    try {
      products = await Design.find().sort({ popularity_score: -1 }).limit(10);
    } catch (dbError) {
      console.warn('MongoDB trending lookup failed, falling back to top JSON results');
      const dataPath = path.join(__dirname, '../data/products.json');
      const productsData = fs.readFileSync(dataPath, 'utf-8');
      products = JSON.parse(productsData).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 10);
    }

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getTrendingProducts };
