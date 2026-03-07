const fs = require('fs');
const path = require('path');
const { rankProducts } = require('../utils/rankingAlgorithm');

const getRecommendations = (tags) => {
  // Read dataset
  const dataPath = path.join(__dirname, '../data/products.json');
  const productsData = fs.readFileSync(dataPath, 'utf-8');
  const products = JSON.parse(productsData);

  // Filter products by matching styles
  let matchingProducts = products.filter(p => tags.includes(p.style));

  // If no exact match, fallback to returning all products, ranked by general factors
  if (matchingProducts.length === 0) {
    matchingProducts = products; 
  }

  // Calculate scores and sort
  const ranked = rankProducts(matchingProducts, tags);

  // Return top results
  return ranked.slice(0, 5); 
};

module.exports = { getRecommendations };
