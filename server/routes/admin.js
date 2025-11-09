const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');

// Update all users with default balance
router.post('/update-default-balance', protect, async (req, res) => {
    try {
        // Only allow if the user is an admin (you can add more checks here)
        const result = await User.updateMany(
            { $or: [{ balance: { $exists: false } }, { balance: 0 }, { balance: null }] },
            { $set: { balance: 10000 } }
        );

        res.json({
            message: `Updated ${result.modifiedCount} users with default balance of ₹10,000`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error updating balances:', error);
        res.status(500).json({ message: 'Error updating balances' });
    }
});

// Fix password hashing for all users
router.post('/fix-password-hashing', async (req, res) => {
    try {
        console.log('=== FIXING PASSWORD HASHING ===');
        const users = await User.find({});
        let fixedCount = 0;
        let alreadyHashedCount = 0;
        const results = [];

        for (const user of users) {
            const userResult = {
                email: user.email,
                status: '',
                action: ''
            };

            console.log(`Checking user: ${user.email}`);

            // Check if password is already hashed (bcrypt hashes start with $2)
            if (user.password && user.password.startsWith('$2')) {
                console.log(`- ✅ Password already hashed`);
                userResult.status = 'already_hashed';
                userResult.action = 'no_change';
                alreadyHashedCount++;
            } else if (user.password) {
                console.log(`- ⚠️  Plain text password detected: "${user.password}"`);

                // Hash the existing password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);

                // Update the user directly in database to bypass the pre-save hook
                await User.findByIdAndUpdate(user._id, { password: hashedPassword });

                console.log(`- 🔧 Password hashed and updated`);
                userResult.status = 'plain_text_fixed';
                userResult.action = 'password_hashed';
                fixedCount++;
            } else {
                console.log(`- ❌ No password found`);
                userResult.status = 'no_password';
                userResult.action = 'skipped';
            }

            results.push(userResult);
        }

        console.log('=== PASSWORD FIX COMPLETE ===');
        console.log(`Fixed: ${fixedCount}, Already Hashed: ${alreadyHashedCount}`);

        res.json({
            message: 'Password hashing fix completed',
            totalUsers: users.length,
            fixedCount,
            alreadyHashedCount,
            results
        });
    } catch (error) {
        console.error('Error fixing password hashing:', error);
        res.status(500).json({
            message: 'Error fixing password hashing',
            error: error.message
        });
    }
});

module.exports = router;