const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Create a new money request
router.post('/', protect, async (req, res) => {
    try {
        const { receiverEmail, amount, notes } = req.body;
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find receiver by email
            const receiver = await User.findOne({ email: receiverEmail }).session(session);
            if (!receiver) {
                throw new Error('User not found');
            }

            // Create a pending transaction for the request
            const transaction = await Transaction.create([{
                userId: req.user._id,
                requestToId: receiver._id, // Add this field to Transaction model
                type: 'credit',
                amount,
                method: 'online',
                status: 'pending',
                notes: notes || `Money request from ${req.user.email}`,
                isMoneyRequest: true // Add this field to Transaction model
            }], { session });

            // Add the transaction to both users' transaction lists
            await User.findByIdAndUpdate(req.user._id, {
                $push: { transactions: transaction[0]._id }
            }, { session });

            await User.findByIdAndUpdate(receiver._id, {
                $push: { transactions: transaction[0]._id }
            }, { session });

            await session.commitTransaction();
            res.json(transaction[0]);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Accept a money request
router.post('/:requestId/accept', protect, async (req, res) => {
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find the request transaction
            const request = await Transaction.findById(req.params.requestId).session(session);
            if (!request) {
                throw new Error('Request not found');
            }

            if (!request.isMoneyRequest || request.status !== 'pending') {
                throw new Error('Invalid request');
            }

            // Check if the logged-in user is the one being requested
            if (request.requestToId.toString() !== req.user._id.toString()) {
                throw new Error('Unauthorized');
            }

            // Check if user has sufficient balance
            const user = await User.findById(req.user._id).session(session);
            if (user.balance < request.amount) {
                throw new Error('Insufficient balance');
            }

            // Update the request transaction
            await Transaction.findByIdAndUpdate(req.params.requestId, {
                status: 'success'
            }, { session });

            // Create a debit transaction for the payer
            const debitTransaction = await Transaction.create([{
                userId: req.user._id,
                type: 'debit',
                amount: request.amount,
                method: 'online',
                status: 'success',
                notes: `Payment for request from ${request.userId.email}`,
                relatedRequest: request._id
            }], { session });

            // Update balances
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { balance: -request.amount },
                $push: { transactions: debitTransaction[0]._id }
            }, { session });

            await User.findByIdAndUpdate(request.userId, {
                $inc: { balance: request.amount }
            }, { session });

            await session.commitTransaction();
            res.json({ message: 'Request accepted successfully' });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Reject a money request
router.post('/:requestId/reject', protect, async (req, res) => {
    try {
        const request = await Transaction.findById(req.params.requestId);
        if (!request) {
            throw new Error('Request not found');
        }

        if (!request.isMoneyRequest || request.status !== 'pending') {
            throw new Error('Invalid request');
        }

        if (request.requestToId.toString() !== req.user._id.toString()) {
            throw new Error('Unauthorized');
        }

        await Transaction.findByIdAndUpdate(req.params.requestId, {
            status: 'failed',
            notes: request.notes + ' (Rejected)'
        });

        res.json({ message: 'Request rejected successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;