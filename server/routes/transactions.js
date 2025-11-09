const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all transactions for a user
router.get('/my', protect, async (req, res) => {
    try {
        console.log('Fetching transactions for user ID:', req.user._id);

        // Get ALL transactions where user is involved to debug
        const allTransactions = await Transaction.find({
            $or: [
                { userId: req.user._id },
                { receiverId: req.user._id }
            ]
        })
            .populate('userId', 'name email')
            .populate('receiverId', 'name email')
            .sort('-timestamp');

        console.log(`Found ${allTransactions.length} total transactions involving user ${req.user._id}`);

        // Log each transaction for debugging
        allTransactions.forEach((tx, index) => {
            console.log(`Transaction ${index + 1}:`, {
                id: tx._id,
                userId: tx.userId._id,
                receiverId: tx.receiverId._id,
                type: tx.type,
                amount: tx.amount,
                description: tx.description
            });
        });

        // Only return transactions where user is the primary account holder (userId)
        const userTransactions = allTransactions.filter(tx =>
            tx.userId._id.toString() === req.user._id.toString()
        );

        console.log(`Filtered to ${userTransactions.length} user-specific transactions`);

        res.status(200).json({
            success: true,
            count: userTransactions.length,
            data: userTransactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
});

// Create a new payment transaction
router.post('/', protect, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { receiverEmail, amount, description } = req.body;

        if (!receiverEmail || !amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Please provide receiver email and amount' });
        }

        if (amount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        // Find receiver by email
        const receiver = await User.findOne({ email: receiverEmail }).session(session);
        if (!receiver) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Check if sending to self
        if (receiver._id.toString() === req.user._id.toString()) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Cannot send money to yourself' });
        }

        // Check if sender has sufficient balance
        const sender = await User.findById(req.user._id).session(session);
        if (!sender || sender.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create transactions for both sender and receiver
        const [senderTx, receiverTx] = await Promise.all([
            Transaction.create([{
                userId: req.user._id,
                receiverId: receiver._id,
                type: 'debit',
                amount: Number(amount),
                method: 'online',
                status: 'success',
                description: description || `Payment sent to ${receiver.name}`
            }], { session }),
            Transaction.create([{
                userId: receiver._id,
                receiverId: req.user._id,
                type: 'credit',
                amount: Number(amount),
                method: 'online',
                status: 'success',
                description: description || `Payment received from ${sender.name}`
            }], { session })
        ]);

        // Update balances atomically and get updated users
        const [updatedSender, updatedReceiver] = await Promise.all([
            User.findByIdAndUpdate(
                req.user._id,
                { $inc: { balance: -amount } },
                { session, new: true }
            ),
            User.findByIdAndUpdate(
                receiver._id,
                { $inc: { balance: amount } },
                { session, new: true }
            )
        ]);

        await session.commitTransaction();

        // Return updated balance and transaction details
        res.status(200).json({
            message: 'Transaction successful',
            senderTransaction: senderTx[0],
            receiverTransaction: receiverTx[0],
            newBalance: updatedSender.balance,
            transaction: senderTx[0]
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Transaction failed: ' + error.message });
    } finally {
        session.endSession();
    }
});

// Create money request
router.post('/request', protect, async (req, res) => {
    try {
        const { receiverEmail, amount, description } = req.body;

        if (!receiverEmail || !amount) {
            return res.status(400).json({ message: 'Please provide receiver email and amount' });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        // Find receiver
        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if requesting from self
        if (receiver._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot request money from yourself' });
        }

        // Create request transaction
        const transaction = await Transaction.create({
            userId: req.user._id,
            receiverId: receiver._id,
            type: 'request',
            amount: Number(amount),
            method: 'request',
            status: 'pending',
            description: description || `Money request sent to ${receiver.name}`
        });

        res.status(201).json({
            message: 'Money request created successfully',
            transaction
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create money request: ' + error.message });
    }
});

module.exports = router;