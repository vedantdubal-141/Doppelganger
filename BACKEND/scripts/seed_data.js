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
                name: 'Casual Hoodie',
                category: 'outerwear',
                style: 'casual',
                image_url: '/images/hoodie.jpg',
                tags: ['casual', 'comfortable', 'hoodie'],
                aesthetic_vector: [0.3, 0.4, 0.2, 0.1],
                is_published: true,
                likes_count: 45,
                popularity_score: 6
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
                name: 'Sportswear Track Pants',
                category: 'pants',
                style: 'sportswear',
                image_url: '/images/track_pants.jpg',
                tags: ['sport', 'active', 'pants'],
                aesthetic_vector: [0.2, 0.1, 0.7, 0.6],
                is_published: true,
                likes_count: 50,
                popularity_score: 7
            },
            {
                name: 'Vintage Denim',
                category: 'pants',
                style: 'vintage',
                image_url: '/images/denim.jpg',
                tags: ['vintage', 'denim', 'classic'],
                aesthetic_vector: [0.4, 0.5, 0.3, 0.8],
                is_published: true,
                likes_count: 95,
                popularity_score: 8
            },
            {
                name: 'Summer Shorts',
                category: 'pants',
                style: 'summer',
                image_url: '/images/shorts.jpg',
                tags: ['summer', 'beach', 'casual'],
                aesthetic_vector: [0.1, 0.2, 0.5, 0.4],
                is_published: true,
                likes_count: 30,
                popularity_score: 5
            },
            {
                name: 'Elegant Evening Gown',
                category: 'dress',
                style: 'formal',
                image_url: '/images/gown.jpg',
                tags: ['elegant', 'formal', 'night'],
                aesthetic_vector: [0.05, 0.95, 0.1, 0.2],
                is_published: true,
                likes_count: 200,
                popularity_score: 10
            },
            {
                name: 'Retro Sunglasses',
                category: 'accessory',
                style: 'vintage',
                image_url: '/images/sunglasses.jpg',
                tags: ['retro', 'vintage', 'summer'],
                aesthetic_vector: [0.5, 0.3, 0.2, 0.7],
                is_published: true,
                likes_count: 150,
                popularity_score: 7
            },
            {
                name: 'Active Sneakers',
                category: 'footwear',
                style: 'sportswear',
                image_url: '/images/sneakers.jpg',
                tags: ['sport', 'active', 'footwear'],
                aesthetic_vector: [0.2, 0.1, 0.9, 0.5],
                is_published: true,
                likes_count: 180,
                popularity_score: 9
            },
            {
                name: 'Denim Jacket',
                category: 'outerwear',
                style: 'casual',
                image_url: '/images/denim_jacket.jpg',
                tags: ['denim', 'casual', 'classic'],
                aesthetic_vector: [0.4, 0.4, 0.3, 0.5],
                is_published: true,
                likes_count: 110,
                popularity_score: 8
            },
            {
                name: 'Graphic Tee',
                category: 'shirt',
                style: 'streetwear',
                image_url: '/images/graphic_tee.jpg',
                tags: ['graphic', 'streetwear', 'urban'],
                aesthetic_vector: [0.7, 0.2, 0.2, 0.6],
                is_published: true,
                likes_count: 160,
                popularity_score: 9
            },
            {
                name: 'Beach Shirt',
                category: 'shirt',
                style: 'summer',
                image_url: '/images/beach_shirt.jpg',
                tags: ['summer', 'beach', 'casual'],
                aesthetic_vector: [0.2, 0.3, 0.6, 0.4],
                is_published: true,
                likes_count: 75,
                popularity_score: 6
            }
        ];

        const designIds = [];
        for (const designData of designs) {
            const design = new Design(designData);
            await design.save();
            const dId = design._id.toString();
            designIds.push(dId);
            console.log(`    Design ${design.name} added to MongoDB (ID: ${dId})`);

            // Also add to MySQL metadata table
            try {
                await db.execute(
                    'INSERT IGNORE INTO designs (id, name, image_url, is_published, likes_count) VALUES (?, ?, ?, ?, ?)',
                    [dId, designData.name, designData.image_url, designData.is_published, designData.likes_count]
                );

                // Add tags to MySQL junction table
                for (const tag of designData.tags) {
                    await db.execute(
                        'INSERT IGNORE INTO design_tags (design_id, tag_name) VALUES (?, ?)',
                        [dId, tag]
                    );
                }
            } catch (mysqlErr) {
                console.warn(`    MySQL metadata sync failed for ${designData.name}: ${mysqlErr.message}`);
            }
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
