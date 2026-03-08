const db = require('../config/db');
const connectDB = require('../config/mongo');
const User = require('../models/userModel');
const Design = require('../models/designModel');
const Wardrobe = require('../models/wardrobeModel');
const Community = require('../models/communityModel');
const mongoose = require('mongoose');

const seedData = async () => {
    try {
        console.log('🌱 Seeding Data...');

        // 1. Connect MongoDB
        await connectDB();

        // 2. Clear Existing Data (Optional/Careful)
        // await Design.deleteMany({});
        // await db.execute('DELETE FROM saved_wardrobes');
        // await db.execute('DELETE FROM community_feed');
        // await db.execute('DELETE FROM users');

        // 3. Seed Users (MySQL)
        console.log('  Adding Users...');
        const users = [
            {
                username: 'sahil_cyber',
                email: 'sahil@example.com',
                password_hash: 'hashed_pass_123',
                level: 5,
                height: 182,
                weight: 78,
                shoulder: 45,
                waist: 32,
                body_type: 'inverted_triangle'
            },
            {
                username: 'ankit_style',
                email: 'ankit@example.com',
                password_hash: 'hashed_pass_456',
                level: 3,
                height: 175,
                weight: 70,
                shoulder: 42,
                waist: 30,
                body_type: 'rectangle'
            }
        ];

        const userIds = [];
        for (const user of users) {
            try {
                const id = await User.create(user);
                userIds.push(id);
                console.log(`    User ${user.username} added (ID: ${id})`);
            } catch (err) {
                console.log(`    User ${user.username} might already exist: ${err.message}`);
                // Try to find existing
                const existing = await User.findByEmail(user.email);
                if (existing) userIds.push(existing.id);
            }
        }

        // 4. Seed Designs (MongoDB)
        console.log('  Adding Designs...');
        const designs = [
            {
                name: 'Streetwear Jacket',
                category: 'outerwear',
                style: 'streetwear',
                image_url: '/images/jacket.jpg',
                tags: ['streetwear', 'urban', 'outerwear'],
                aesthetic_vector: [0.8, 0.2, 0.1, 0.5],
                is_published: true,
                likes_count: 120,
                popularity_score: 8
            },
            {
                name: 'Formal Blazer',
                category: 'outerwear',
                style: 'formal',
                image_url: '/images/blazer.jpg',
                tags: ['formal', 'classic', 'office'],
                aesthetic_vector: [0.1, 0.9, 0.2, 0.3],
                is_published: true,
                likes_count: 85,
                popularity_score: 9
            },
            {
                name: 'Cyber Chrome Boots',
                category: 'footwear',
                style: 'cyberpunk',
                image_url: '/images/boots.jpg',
                tags: ['cyberpunk', 'chrome', 'futuristic'],
                aesthetic_vector: [0.9, 0.1, 0.8, 0.4],
                is_published: false,
                likes_count: 450,
                popularity_score: 10
            }
        ];

        const designIds = [];
        for (const designData of designs) {
            const design = new Design(designData);
            await design.save();
            designIds.push(design._id.toString());
            console.log(`    Design ${design.name} added (ID: ${design._id})`);
        }

        // 5. Seed Saved Wardrobes (MySQL)
        console.log('  Adding Wardrobes...');
        if (userIds.length > 0 && designIds.length > 0) {
            await Wardrobe.saveDesign(userIds[0], designIds[0]);
            await Wardrobe.saveDesign(userIds[0], designIds[1]);
            await Wardrobe.saveDesign(userIds[1], designIds[1]);
            console.log('    Wardrobe entries added');
        }

        // 6. Seed Community Feed (MySQL)
        console.log('  Adding Community Feed...');
        for (let i = 0; i < designIds.length; i++) {
            if (designs[i].is_published) {
                await Community.addToFeed(designIds[i], users[i % users.length].username);
                console.log(`    Design ${designIds[i]} added to feed by ${users[i % users.length].username}`);
            }
        }

        console.log('✨ Seeding Complete');
    } catch (err) {
        console.error('❌ Seeding Error:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

seedData();
