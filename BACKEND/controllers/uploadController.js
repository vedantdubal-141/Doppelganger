const { detectStyle } = require('../services/aiService');
const db = require('../config/db');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.files || (!req.files.inspirations && !req.files.purchases)) {
      res.status(400);
      throw new Error('No image files provided for inspirations or purchases');
    }

    const inspirationPaths = req.files.inspirations ? req.files.inspirations.map(file => `/${file.path.replace(/\\/g, '/')}`) : [];
    const purchasePaths = req.files.purchases ? req.files.purchases.map(file => `/${file.path.replace(/\\/g, '/')}`) : [];

    // Call AI Service Mock (omitted for new spec format)
    // const tags = await detectStyle(inspirationPaths, purchasePaths);

    const analysis_result = {
      detected_styles: ["cyberpunk"],
      color_palette: ["#FF00FF"]
    };

    const [recommendations] = await db.query('SELECT * FROM products LIMIT 5');

    res.status(200).json({
      analysis_result,
      recommendations: recommendations || []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };
