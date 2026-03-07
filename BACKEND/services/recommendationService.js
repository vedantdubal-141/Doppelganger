const { cosineSimilarity } = require('../utils/similarity');
const { checkBodyTypeMatch } = require('../utils/bodyType');
const Product = require('../models/productModel');
const User = require('../models/userModel');

/**
 * Recommendation Service
 * Generates ranked recommendations for a user
 */
const getRecommendations = async (userId, userEmbedding) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const products = await Product.getAll();

    const scoredProducts = products.map(product => {
      // 1. Calculate Style Similarity (Cosine Similarity)
      // product.embedding_vector is stored as JSON in the database
      const productEmbedding = typeof product.embedding_vector === 'string'
        ? JSON.parse(product.embedding_vector)
        : product.embedding_vector;

      const styleSimilarity = cosineSimilarity(userEmbedding, productEmbedding);

      // 2. Calculate Body Type Match
      const bodyTypeMatch = checkBodyTypeMatch(user.body_type, product.category);

      // 3. Final Score Formula:
      // score = 0.5 * style_similarity + 0.3 * body_type_match + 0.2 * popularity
      const score = (0.5 * styleSimilarity) + (0.3 * bodyTypeMatch) + (0.2 * (product.popularity_score / 10));

      return {
        ...product,
        score: parseFloat(score.toFixed(4))
      };
    });

    // 4. Sort by score descending and return top 10
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

  } catch (error) {
    console.error('Recommendation Error:', error.message);
    throw error;
  }
};

module.exports = { getRecommendations };
