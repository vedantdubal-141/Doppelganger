/**
 * Image Generation Service - Hugging Face (FLUX.1-schnell)
 * Takes a text prompt from the Vision Service and generates
 * a novel fashion image using Hugging Face's FLUX model.
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const HF_API_URL = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';

/**
 * Generates a fashion image from a text prompt using Hugging Face's FLUX model.
 *
 * @param {string} prompt - The fashion description prompt from visionService
 * @returns {Object} { image_url, image_base64 }
 */
const generateImage = async (prompt, options = {}) => {
  const apiKey = process.env.HF_TOKEN;

  if (!apiKey) {
    console.warn('⚠️ HF_TOKEN not set in .env. Returning mock generated image.');
    return getMockImage();
  }

  // HF's FLUX.1 [schnell] needs a quality prompt
  const enhancedPrompt = `${prompt}. Professional fashion photography, studio lighting, clean background, high resolution, editorial quality, 8k detail.`;

  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: enhancedPrompt },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 90000
      }
    );

    const imageBuffer = response.data;
    const base64Image = Buffer.from(imageBuffer, 'binary').toString('base64');

    // Save the generated image to the uploads/generated/ directory
    const generatedDir = path.join(__dirname, '..', 'uploads', 'generated');
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const filename = `generated-${Date.now()}.png`;
    const filePath = path.join(generatedDir, filename);
    fs.writeFileSync(filePath, imageBuffer);

    const imageUrl = `/uploads/generated/${filename}`;

    console.log('✅ Image generated successfully by HF:', imageUrl);

    return {
      image_url: imageUrl,
      image_base64: `data:image/png;base64,${base64Image}`
    };

  } catch (error) {
    // If error.response.data exists and is an arraybuffer, it needs decoding
    const errorBody = error.response?.data instanceof Buffer 
        ? error.response.data.toString() 
        : error.message;

    console.error('❌ HF Image Generation Error:', errorBody);
    console.warn('⚠️ Falling back to mock generated image.');
    return getMockImage();
  }
};

/**
 * Returns a mock generated image for development/demo when no API key is set
 */
const getMockImage = () => ({
  image_url: '/uploads/generated/mock-generated.png',
  image_base64: null,
  mock: true
});

module.exports = { generateImage };
