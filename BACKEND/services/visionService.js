/**
 * Vision Service - Qwen2.5-VL-7B-Instruct (via Hugging Face Hyperbolic provider)
 * Open/ungated model — no license approval required.
 * Analyzes uploaded fashion images and extracts style metadata
 * into a structured JSON prompt for image generation.
 *
 * Provider: router.huggingface.co/hyperbolic (OpenAI-compatible API)
 * Model: Qwen/Qwen2.5-VL-7B-Instruct
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const HF_VISION_URL = 'https://router.huggingface.co/hyperbolic/v1/chat/completions';
const VISION_MODEL = 'Qwen/Qwen2.5-VL-7B-Instruct';

/**
 * Converts a local image file to a base64 data URI.
 */
const imageToDataUrl = (filePath) => {
  const absolutePath = path.resolve(filePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const b64 = imageBuffer.toString('base64');
  // Detect mime type from extension
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  return `data:${mime};base64,${b64}`;
};

/**
 * Analyzes uploaded fashion images using Qwen2.5-VL (vision-language model).
 * Returns structured JSON with detected styles, colors, materials, and a generation prompt.
 *
 * @param {Array} inspirationFiles - Array of multer file objects for style inspirations
 * @param {Array} purchaseFiles    - Array of multer file objects for past purchases
 * @returns {Object} { detected_styles, color_palette, materials, garment_type, generation_prompt }
 */
const analyzeImages = async (inspirationFiles = [], purchaseFiles = []) => {
  const apiKey = process.env.HF_TOKEN;

  if (!apiKey) {
    console.warn('⚠️ HF_TOKEN not set in .env. Returning mock analysis.');
    return getMockAnalysis();
  }

  const combinedFiles = [...inspirationFiles, ...purchaseFiles];
  if (combinedFiles.length === 0) return getMockAnalysis();

  try {
    // Build vision content array — use up to 3 images for context
    const imageFiles = combinedFiles.slice(0, 3);
    const imageContents = imageFiles.map(file => ({
      type: 'image_url',
      image_url: { url: imageToDataUrl(file.path) }
    }));

    const promptText = `You are a fashion AI. Analyze the clothing in these images.
Combine their style DNA into one cohesive fashion concept.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "detected_styles": ["style1", "style2"],
  "color_palette": ["#hex1", "#hex2", "#hex3"],
  "materials": ["material1", "material2"],
  "garment_type": "main clothing type",
  "generation_prompt": "A highly detailed 2-sentence description of a stunning fashion piece blending all detected styles. Include palette, texture, and silhouette."
}`;

    const response = await axios.post(
      HF_VISION_URL,
      {
        model: VISION_MODEL,
        messages: [{
          role: 'user',
          content: [
            ...imageContents,
            { type: 'text', text: promptText }
          ]
        }],
        max_tokens: 512,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const rawText = response.data?.choices?.[0]?.message?.content || '';
    console.log('✅ Qwen Vision analysis complete');

    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('⚠️ Could not parse JSON from Qwen response. Falling back to mock.');
      }
    }

    return getMockAnalysis();

  } catch (error) {
    const errBody = error.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error('❌ Qwen Vision Service Error:', errBody?.slice(0, 200));
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
