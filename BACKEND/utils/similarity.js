/**
 * Calculate Cosine Similarity between two vectors
 * Formula: dot(A,B) / (||A|| * ||B||)
 */
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    let mA = 0;
    let mB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        mA += vecA[i] * vecA[i];
        mB += vecB[i] * vecB[i];
    }

    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);

    const magnitude = mA * mB;
    if (magnitude === 0) {
        return 0;
    }

    return dotProduct / magnitude;
}

module.exports = { cosineSimilarity };
