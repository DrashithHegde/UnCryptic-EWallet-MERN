const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get user transactions
router.get('/my', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { userId: req.user._id },
                { receiverId: req.user._id }
            ]
        })
            .populate('userId', 'name email')
            .populate('receiverId', 'name email')
            .sort('-createdAt');

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// Create payment transaction
router.post('/', protect, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { receiverEmail, amount, description } = req.body;

        if (!receiverEmail || !amount || amount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Invalid input' });
        }

        const receiver = await User.findOne({ email: receiverEmail }).session(session);
        if (!receiver) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Receiver not found' });
        }

        if (receiver._id.toString() === req.user._id.toString()) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Cannot send to yourself' });
        }

        const sender = await User.findById(req.user._id).session(session);
        if (sender.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create single transaction record with sender and receiver
        const transaction = await Transaction.create([{
            userId: req.user._id,
            receiverId: receiver._id,
            type: 'payment',
            amount,
            method: 'online',
            status: 'success',
            description: description || `Payment to ${receiver.name}`
        }], { session });

        // Update balances
        const [updatedSender, updatedReceiver] = await Promise.all([
            User.findByIdAndUpdate(req.user._id, { $inc: { balance: -amount } }, { session, new: true }),
            User.findByIdAndUpdate(receiver._id, { $inc: { balance: amount } }, { session, new: true })
        ]);

        await session.commitTransaction();

        res.json({
            message: 'Transaction successful',
            transaction: transaction[0],
            newBalance: updatedSender.balance
        });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Transaction failed' });
    } finally {
        session.endSession();
    }
});

module.exports = router;