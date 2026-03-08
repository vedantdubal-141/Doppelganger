const { cosineSimilarity } = require('../utils/similarity');
const { checkBodyTypeMatch } = require('../utils/bodyType');
const Design = require('../models/designModel');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');

const getRecommendations = async (userId, tags) => {
  try {
    let user;
    try {
      user = await User.findById(userId);
    } catch (dbError) {
      console.warn('Database user lookup failed, using default user profile');
      user = { body_type: 'rectangle' }; // Fallback
    }

    if (!user) {
      user = { body_type: 'rectangle' };
    }

    let products;
    try {
      products = await Design.find();
    } catch (dbError) {
      console.warn('MongoDB design lookup failed, falling back to JSON data');
      const dataPath = path.join(__dirname, '../data/products.json');
      const productsData = fs.readFileSync(dataPath, 'utf-8');
      products = JSON.parse(productsData);
    }

    const scoredProducts = products.map(product => {
      // 1. Calculate Style Match
      // If product has embedding_vector, use cosine similarity (mocking tags -> vector)
      // If not, use simple tag inclusion
      let styleSimilarity = 0;
      if (product.aesthetic_vector && product.aesthetic_vector.length > 0) {
        const productEmbedding = product.aesthetic_vector;

        // Mocking a vector from tags for comparison if tags are provided
        // In a real app, an AI service would convert tags/query to a vector
        const mockUserEmbedding = [0.1, 0.2, 0.3, 0.4]; // Simplified
        styleSimilarity = cosineSimilarity(mockUserEmbedding, productEmbedding);
      } else {
        styleSimilarity = tags.includes(product.style) ? 1.0 : 0.2;
      }

      // 2. Calculate Body Type Match
      const bodyTypeMatch = checkBodyTypeMatch(user.body_type, product.category || 'shirt');

      // 3. Final Score
      const popularity = product.popularity_score || product.popularity || 5;
      const score = (0.5 * styleSimilarity) + (0.3 * bodyTypeMatch) + (0.2 * (popularity / 10));

      return {
        ...product,
        score: parseFloat(score.toFixed(4))
      };
    });

    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

  } catch (error) {
    console.error('Recommendation Error:', error.message);
    throw error;
  }
};

module.exports = { getRecommendations };
