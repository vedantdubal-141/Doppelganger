/**
 * Mock AI Service to detect style
 * In a real app, this would call an external API like Google Cloud Vision or Clarifai.
 */
const detectStyle = async (imagePath) => {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock tags based on the image path or just random
      const styles = [
        ['streetwear', 'casual', 'denim'],
        ['formal', 'elegant', 'black-tie'],
        ['sportswear', 'active', 'comfortable'],
        ['vintage', 'retro', 'chic'],
        ['summer', 'beach', 'casual'],
      ];
      // Pick a random style subset to simulate detection
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      resolve(randomStyle);
    }, 1000);
  });
};

module.exports = { detectStyle };
