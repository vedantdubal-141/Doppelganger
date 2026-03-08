const db = require('../config/db');

// @desc    Publish a design to the community feed
// @route   POST /api/designs/:designId/publish
const publishDesign = async (req, res) => {
    try {
        const { designId } = req.params;

        // Check if design belongs to user
        const [designs] = await db.query('SELECT * FROM designs WHERE id = ? AND author_id = ?', [designId, req.user.id]);

        if (!designs || designs.length === 0) {
            return res.status(404).json({ message: 'Design not found or unauthorized' });
        }

        // Update to published
        await db.query('UPDATE designs SET is_published = 1 WHERE id = ?', [designId]);

        res.status(200).json({ success: true, message: 'Design published successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error publishing design' });
    }
};

module.exports = {
    publishDesign
};
