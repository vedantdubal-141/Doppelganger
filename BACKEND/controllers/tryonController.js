const db = require('../config/db');

// @desc    Generate a 3D try-on render based on biometrics
// @route   POST /api/try-on/generate
const generateTryOn = async (req, res) => {
    try {
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({ message: 'product_id is required' });
        }

        // Validate user biometrics exist
        const [users] = await db.query('SELECT biometrics_height, biometrics_weight FROM users WHERE id = ?', [req.user.id]);

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        if (!user.biometrics_height || !user.biometrics_weight) {
            return res.status(400).json({ message: 'Missing biometric data. Please update your profile first.' });
        }

        // Mock 3D render generated URL
        const mockRenderUrl = `https://mock-3d-render.space/model_${req.user.id}_${product_id}.glb`;

        res.status(200).json({
            success: true,
            render_url: mockRenderUrl,
            message: '3D model generated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error generating try-on' });
    }
};

module.exports = { generateTryOn };
