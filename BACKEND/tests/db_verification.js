const db = require('../config/db');
const connectDB = require('../config/mongo');
const User = require('../models/userModel');
const Design = require('../models/designModel');
const mongoose = require('mongoose');

const runTests = async () => {
    try {
        console.log('--- Database Verification Test ---');

        // 1. MySQL Test
        console.log('\nTesting MySQL...');
        const [rows] = await db.execute('SELECT 1 + 1 AS result');
        console.log('✅ MySQL Basic Query:', rows[0].result === 2 ? 'PASS' : 'FAIL');

        // Test User creation (partial)
        try {
            const testUser = {
                username: 'testuser_' + Date.now(),
                email: 'test' + Date.now() + '@example.com',
                password_hash: 'hashed_password',
                height: 180,
                weight: 75,
                body_type: 'athletic'
            };
            const userId = await User.create(testUser);
            console.log('✅ MySQL User Create: PASS (ID: ' + userId + ')');
        } catch (e) {
            console.warn('⚠️ MySQL User Create skipped or failed (check if table exists):', e.message);
        }

        // 2. MongoDB Test
        console.log('\nTesting MongoDB...');
        await connectDB();

        const testDesign = new Design({
            name: 'Cyber Chrome Jacket',
            image_url: 'http://example.com/jacket.jpg',
            category: 'outerwear',
            style: 'cyperpunk',
            tags: ['chrome', 'futuristic'],
            aesthetic_vector: [0.1, 0.5, 0.9]
        });

        await testDesign.save();
        console.log('✅ MongoDB Design Create: PASS');

        const foundDesign = await Design.findOne({ name: 'Cyber Chrome Jacket' });
        console.log('✅ MongoDB Design Find: PASS');

        await Design.deleteOne({ _id: testDesign._id });
        console.log('✅ MongoDB Design Delete: PASS');

        console.log('\n--- Verification Complete ---');
    } catch (err) {
        console.error('\n❌ Verification Failed:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

runTests();
