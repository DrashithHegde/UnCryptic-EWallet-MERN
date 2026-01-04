const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get credit score for current user
router.get('/my', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const transactions = await Transaction.find({
            $or: [{ userId: req.user._id }, { receiverId: req.user._id }],
            type: 'payment',
            status: 'success'
        });

        const sentAmount = transactions
            .filter(t => t.userId.toString() === req.user._id)
            .reduce((sum, t) => sum + t.amount, 0);

        const receivedAmount = transactions
            .filter(t => t.receiverId.toString() === req.user._id)
            .reduce((sum, t) => sum + t.amount, 0);

        let score = 700;

        // Bonus for transaction activity
        if (transactions.length > 3) score += 20;
        if (transactions.length > 10) score += 15;

        // Bonus for balance
        if (user.balance > 10000) score += 30;
        else if (user.balance > 5000) score += 20;

        // Bonus for received payments
        if (receivedAmount > 10000) score += 25;
        else if (receivedAmount > 5000) score += 15;

        // Penalties
        if (user.balance < 1000) score -= 25;
        if (sentAmount > receivedAmount && sentAmount > 5000) score -= 15;

        // Bonus for consistent payment history
        if (sentAmount > 0 && receivedAmount > 0) score += 10;

        score = Math.max(300, Math.min(900, score));

        res.json({
            score,
            creditScore: score,
            balance: user.balance,
            transactionCount: transactions.length,
            sentAmount,
            receivedAmount
        });
    } catch (err) {
        res.status(500).json({ message: 'Error calculating credit score' });
    }
});

// Get credit score for specific user
router.get('/:userId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const transactions = await Transaction.find({
            $or: [{ userId: req.params.userId }, { receiverId: req.params.userId }]
        });

        const receivedAmount = transactions
            .filter(t => t.receiverId.toString() === req.params.userId && t.type === 'credit' && t.status === 'success')
            .reduce((sum, t) => sum + t.amount, 0);

        let score = 700;

        if (transactions.length > 3) score += 20;
        if (user.balance > 10000) score += 30;
        else if (user.balance > 5000) score += 20;

        if (receivedAmount > 10000) score += 25;
        else if (receivedAmount > 5000) score += 15;

        if (user.balance < 1000) score -= 25;

        score = Math.max(300, Math.min(900, score));

        res.json({ creditScore: score });
    } catch (err) {
        res.status(500).json({ message: 'Error calculating credit score' });
    }
});

module.exports = router;
