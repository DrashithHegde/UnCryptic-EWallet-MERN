const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Calculate credit score based on user activity
router.get('/:userId', protect, async (req, res) => {
    try {
        const userId = req.params.userId;

        console.log('=== CREDIT SCORE CALCULATION ===');
        console.log('User ID:', userId);

        // Fetch user data
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User found:', { name: user.name, email: user.email, balance: user.balance });

        // Fetch user transactions
        const transactions = await Transaction.find({
            $or: [{ userId: userId }, { receiverId: userId }]
        });

        console.log('Total transactions found:', transactions.length);

        // Calculate transaction metrics
        const totalTransactions = transactions.length;

        const sentTransactions = transactions.filter(t =>
            t.userId && t.userId.toString() === userId && t.type === 'debit'
        );

        const receivedTransactions = transactions.filter(t =>
            t.receiverId && t.receiverId.toString() === userId && t.type === 'credit'
        );

        const totalSentAmount = sentTransactions
            .filter(t => t.status === 'success')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalReceivedAmount = receivedTransactions
            .filter(t => t.status === 'success')
            .reduce((sum, t) => sum + t.amount, 0);

        const failedTransactions = transactions.filter(t => t.status === 'failed').length;
        const pendingRequests = transactions.filter(t => t.status === 'pending').length;

        console.log('Transaction metrics:', {
            totalTransactions,
            sentCount: sentTransactions.length,
            receivedCount: receivedTransactions.length,
            totalSentAmount,
            totalReceivedAmount,
            failedTransactions,
            pendingRequests
        });

        // Base score
        let creditScore = 700;
        console.log('Starting score:', creditScore);

        // Apply scoring rules

        // POSITIVE FACTORS (First 3 only)

        // 1. Transaction count bonus (encourages activity)
        if (totalTransactions > 3) {
            creditScore += 20;
            console.log('+20: totalTransactions > 3 ✓');
        }

        // 2. Balance-based scoring
        if (user.balance > 10000) {
            creditScore += 30;
            console.log('+30: balance > 10000 (excellent financial health) ✓');
        } else if (user.balance > 5000) {
            creditScore += 20;
            console.log('+20: balance > 5000 (good financial health) ✓');
        } else if (user.balance > 3000) {
            creditScore += 10;
            console.log('+10: balance > 3000 (fair financial health) ✓');
        }

        // 3. Receiving money is good (shows trust/income)
        if (totalReceivedAmount > 10000) {
            creditScore += 25;
            console.log('+25: received > 10000 (high trust/income) ✓');
        } else if (totalReceivedAmount > 5000) {
            creditScore += 15;
            console.log('+15: received > 5000 (good income flow) ✓');
        } else if (totalReceivedAmount > 2000) {
            creditScore += 10;
            console.log('+10: received > 2000 (decent income) ✓');
        }

        // NEGATIVE FACTORS (Low balance and negative cash flow only)

        // 1. Low balance penalty
        if (user.balance < 1000) {
            creditScore -= 25;
            console.log('-25: balance < 1000 (poor financial health) ✗');
        } else if (user.balance < 2000) {
            creditScore -= 10;
            console.log('-10: balance < 2000 (low financial reserves) ✗');
        }

        // 2. Negative cash flow penalty (sending more than receiving)
        if (totalSentAmount > totalReceivedAmount && totalSentAmount > 5000) {
            creditScore -= 15;
            console.log('-15: sending more than receiving (negative cash flow) ✗');
        }

        // Clamp between 300-900
        creditScore = Math.max(300, Math.min(900, creditScore));

        console.log('Final credit score:', creditScore);
        console.log('=== END CREDIT SCORE CALCULATION ===\n');

        res.json({
            creditScore,
            metrics: {
                totalTransactions,
                balance: user.balance,
                totalSentAmount,
                totalReceivedAmount,
                failedTransactions,
                pendingRequests
            }
        });
    } catch (error) {
        console.error('Credit score calculation error:', error);
        res.status(500).json({ message: 'Error calculating credit score', error: error.message });
    }
});

module.exports = router;
