/**
 * Basic scoring algorithm:
 * 0.6 style match
 * 0.3 popularity
 * 0.1 randomness
 */
const rankProducts = (products, tags) => {
  return products.map(product => {
    // Exact style match
    const isStyleMatch = tags.includes(product.style) ? 1 : 0;
    
    // Normalize popularity (assuming max popularity is 10)
    const normalizedPopularity = product.popularity / 10;
    
    const randomness = Math.random();

    const score = (0.6 * isStyleMatch) + (0.3 * normalizedPopularity) + (0.1 * randomness);
    
    return { ...product, score };
  })
  .sort((a, b) => b.score - a.score);
};

module.exports = { rankProducts };
