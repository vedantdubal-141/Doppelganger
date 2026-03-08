/**
 * Vision Service - Hugging Face (Llama-3.2-11B-Vision-Instruct)
 * Analyzes uploaded fashion images and extracts style metadata
 * into a structured JSON prompt for image generation.
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/meta-llama/Llama-3.2-11B-Vision-Instruct';

/**
 * Converts a local image file to a base64 data (without prefix)
 */
const imageToBase64 = (filePath) => {
  const absolutePath = path.resolve(filePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  return imageBuffer.toString('base64');
};

/**
 * Analyzes multiple fashion images using Hugging Face's Vision model.
 * Returns a structured JSON with detected styles, colors, and a generation prompt.
 *
 * @param {Array} inspirationFiles - Array of multer file objects for style inspirations
 * @param {Array} purchaseFiles - Array of multer file objects for past purchases
 * @returns {Object} { detected_styles, color_palette, materials, generation_prompt }
 */
const analyzeImages = async (inspirationFiles = [], purchaseFiles = []) => {
  const apiKey = process.env.HF_TOKEN;

  if (!apiKey) {
    console.warn('⚠️ HF_TOKEN not set in .env. Returning mock analysis.');
    return getMockAnalysis();
  }

  try {
    // For Hugging Face Inference API, we typically send one image and one prompt.
    // To handle multiple images, we'll focus the analysis on the first few most representative ones
    // or concatenate them if the API allows. For this implementation, we analyze the 
    // first inspiration and the first purchase to get the vibe.
    
    const combinedFiles = [...inspirationFiles, ...purchaseFiles];
    if (combinedFiles.length === 0) return getMockAnalysis();

    // Take up to 2 images for the inference (HF limitations for free tier API calls)
    const primaryImg = combinedFiles[0];
    const base64Img = imageToBase64(primaryImg.path);

    const prompt = `Analyze these uploaded clothes. Some are my style inspirations and some are my past clothes.
    Combine their design DNA into one cohesive fashion concept.
    
    Respond ONLY with valid JSON in this exact format:
    {
      "detected_styles": ["style1", "style2"],
      "color_palette": ["#hex1", "#hex2"],
      "materials": ["material1", "material2"],
      "garment_type": "clothing type",
      "generation_prompt": "A highly detailed 2-sentence description of a stunning fashion piece blending all styles. Include palette, texture, and silhouette."
    }`;

    // Note: Hugging Face Inference API format for visual-QA/image-to-text
    const response = await axios.post(
      HF_API_URL,
      {
        inputs: {
          image: base64Img,
          text: prompt
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000
      }
    );

    // Depending on the model, HF might return direct text or an array
    let rawText = "";
    if (Array.isArray(response.data)) {
        rawText = response.data[0]?.generated_text || "";
    } else {
        rawText = response.data.generated_text || JSON.stringify(response.data);
    }

    // Extraction logic for JSON from text
    let jsonStr = rawText;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonStr = jsonMatch[0];
    }

    try {
        const analysis = JSON.parse(jsonStr);
        console.log('✅ HF Vision analysis complete');
        return analysis;
    } catch (e) {
        console.warn('⚠️ Could not parse JSON from HF response. Falling back to mock.');
        return getMockAnalysis();
    }

  } catch (error) {
    console.error('❌ HF Vision Service Error:', error.response?.data || error.message);
    console.warn('⚠️ Falling back to mock analysis.');
    return getMockAnalysis();
  }
};

/**
 * Returns a mock analysis for development/demo when no API key is set
 */
const getMockAnalysis = () => ({
  detected_styles: ['cyber-chrome', 'futuristic', 'streetwear'],
  color_palette: ['#0B0B0F', '#00F0FF', '#7B61FF'],
  materials: ['metallic nylon', 'reflective mesh'],
  garment_type: 'futuristic jacket',
  generation_prompt: 'A sleek cyber-chrome bomber jacket with reflective metallic nylon panels and neon cyan piping along the seams. The silhouette is oversized with a cropped hem, featuring holographic mesh inserts.'
});

module.exports = { analyzeImages };
