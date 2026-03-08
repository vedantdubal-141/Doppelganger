const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image_url: {
        type: String,
        required: true
    },
    author_id: {
        type: Number, // Reference to MySQL user ID
        default: null
    },
    category: {
        type: String,
        required: true
    },
    style: {
        type: String,
        required: true
    },
    tags: [String],
    aesthetic_vector: [Number],
    is_published: {
        type: Boolean,
        default: false
    },
    likes_count: {
        type: Number,
        default: 0
    },
    popularity_score: { // Keeping for recommendation logic
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Design', designSchema);
