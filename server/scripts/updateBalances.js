const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB connection URL (same as in server.js)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ewallet';

const updateBalances = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Update all users with zero or undefined balance to 10000
        const result = await User.updateMany(
            { $or: [{ balance: { $exists: false } }, { balance: 0 }] },
            { $set: { balance: 10000 } }
        );

        console.log(`Updated ${result.modifiedCount} users with default balance of ₹10,000`);

    } catch (error) {
        console.error('Error updating balances:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the update
updateBalances();