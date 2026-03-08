const db = require('../config/db');

// @desc    Get published community feed
// @route   GET /api/community/feed
const getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Using the view created earlier
        const [feedData] = await db.query(`
            SELECT * FROM community_feed
            ORDER BY published_at DESC 
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        res.status(200).json({
            page,
            limit,
            data: feedData || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching community feed' });
    }
};

module.exports = {
    getFeed
};
