const { cosineSimilarity } = require('./similarity');
const { checkBodyTypeMatch } = require('./bodyType');

/**
 * Verification Script for Recommendation Logic
 */

const testSimilarity = () => {
    console.log('--- Testing Cosine Similarity ---');
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];
    const vecD = [0.5, 0.5, 0];

    console.log('Similarity (A, A) [Expected: 1]:', cosineSimilarity(vecA, vecB));
    console.log('Similarity (A, C) [Expected: 0]:', cosineSimilarity(vecA, vecC));
    console.log('Similarity (A, D) [Expected: ~0.707]:', cosineSimilarity(vecA, vecD).toFixed(3));
};

const testBodyType = () => {
    console.log('\n--- Testing Body Type Match ---');
    console.log('Match (triangle, jacket) [Expected: 1]:', checkBodyTypeMatch('triangle', 'jacket'));
    console.log('Match (triangle, shorts) [Expected: 0.4]:', checkBodyTypeMatch('triangle', 'shorts'));
    console.log('Match (oval, shirt) [Expected: 1]:', checkBodyTypeMatch('oval', 'shirt'));
};

const runTests = () => {
    try {
        testSimilarity();
        testBodyType();
        console.log('\nVerification complete!');
    } catch (error) {
        console.error('Tests failed:', error.message);
    }
};

runTests();
