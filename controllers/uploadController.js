const { detectStyle } = require('../services/aiService');

const uploadImage = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      res.status(400);
      throw new Error('No image file provided');
    }

    if (!userId) {
      res.status(400);
      throw new Error('Please provide a valid userId');
    }

    const imagePath = `/${req.file.path.replace(/\\/g, '/')}`; // Ensure normal slashes

    // Call AI Service (Sahil's responsibility to generate embedding)
    const embeddingResponse = await detectStyle(imagePath, userId);

    res.status(200).json({
      message: 'Image uploaded successfully',
      imagePath,
      userId,
      embeddingResponse,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };
