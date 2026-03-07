const { getRecommendations } = require('../services/recommendationService');
const User = require('../models/userModel');

const recommendProducts = async (req, res, next) => {
  try {
    const { tags, userId } = req.body;

    if (!tags || !Array.isArray(tags)) {
      res.status(400);
      throw new Error('Please provide an array of style tags');
    }

    // For now, if no userId is provided, we use a default or handle it in the service
    // In a real app, this would come from the auth middleware
    const recommended = await getRecommendations(userId || 1, tags);

    res.status(200).json(recommended);
  } catch (error) {
    next(error);
  }
};

module.exports = { recommendProducts };
