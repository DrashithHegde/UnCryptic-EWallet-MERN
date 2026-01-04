const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');

router.post('/update-default-balance', protect, async (req, res) => {
    try {
        const result = await User.updateMany(
            { $or: [{ balance: { $exists: false } }, { balance: 0 }, { balance: null }] },
            { $set: { balance: 10000 } }
        );

        res.json({
            message: `Updated ${result.modifiedCount} users with default balance of ₹10,000`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating balances' });
    }
});

router.post('/fix-password-hashing', async (req, res) => {
    try {
        const users = await User.find({});
        let fixedCount = 0;
        let alreadyHashedCount = 0;

        for (const user of users) {
            if (user.password && user.password.startsWith('$2')) {
                alreadyHashedCount++;
            } else if (user.password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                await User.findByIdAndUpdate(user._id, { password: hashedPassword });
                fixedCount++;
            }
        }

        res.json({
            message: 'Password hashing fix completed',
            totalUsers: users.length,
            fixedCount,
            alreadyHashedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fixing password hashing' });
    }
});

module.exports = router;