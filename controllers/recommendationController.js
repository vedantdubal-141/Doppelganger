const { getRecommendations } = require('../services/recommendationService');

const recommendProducts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400);
      throw new Error('Please provide a valid userId');
    }

    // Call AI Service (mocked for now, Sahil's responsibility)
    // We pass userId to the recommendation service which will handle DB lookups
    const recommended = await getRecommendations(userId);

    res.status(200).json(recommended);
  } catch (error) {
    next(error);
  }
};

module.exports = { recommendProducts };
