const db = require('../config/db');

const Community = {
    getFeed: async (limit = 20) => {
        // In a real app, this might query a 'community_feed' view or a cached table
        // For now, we query the designs that are marked as published
        // Since designs are in MongoDB, the "feed" logic will need to be hybrid
        // This model handles the MySQL side of things (e.g. author data)
        const [rows] = await db.execute(
            'SELECT design_id, author_username, published_at FROM community_feed ORDER BY published_at DESC LIMIT ?',
            [limit]
        );
        return rows;
    },

    addToFeed: async (designId, authorUsername) => {
        const [result] = await db.execute(
            'INSERT INTO community_feed (design_id, author_username, published_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [designId, authorUsername]
        );
        return result;
    }
};

module.exports = Community;
