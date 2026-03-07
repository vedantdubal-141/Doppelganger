/**
 * Calculate Body Type based on measurements
 * PRD Section 10 Logic:
 * Triangle -> broader shoulders
 * Oval -> wider waist
 * Rectangle -> similar shoulder & waist
 */
const calculateBodyType = (shoulder, waist) => {
    if (shoulder > waist * 1.05) return 'triangle';
    if (waist > shoulder * 1.05) return 'oval';
    return 'rectangle';
};

/**
 * Check if the clothing item suits the user's body type
 * @returns 1 if compatible, 0.4 otherwise
 */
const checkBodyTypeMatch = (userBodyType, productCategory) => {
    // Logic based on fashion recommendations for different body types
    const rules = {
        triangle: ['jacket', 'blazer', 'hoodie', 'shirt'], // Broaden shoulders
        rectangle: ['jacket', 'blazer', 't-shirt'], // Add structure
        oval: ['shirt', 't-shirt', 'v-neck'], // Streamline silhouette
    };

    const compatibleCategories = rules[userBodyType.toLowerCase()] || [];
    return compatibleCategories.includes(productCategory.toLowerCase()) ? 1 : 0.4;
};

module.exports = { checkBodyTypeMatch, calculateBodyType };
