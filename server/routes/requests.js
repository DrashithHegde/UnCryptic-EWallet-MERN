const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get all money requests for current user (where they are the one being asked to pay)
router.get('/my', protect, async (req, res) => {
    try {
        const requests = await Transaction.find({
            userId: req.user._id,
            type: 'request',
            status: 'pending'
        }).populate('receiverId', 'name email');

        const formattedRequests = requests.map(req => ({
            _id: req._id,
            userName: req.receiverId.name,
            userEmail: req.receiverId.email,
            amount: req.amount,
            createdAt: req.createdAt
        }));

        res.json(formattedRequests);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create a money request
router.post('/', protect, async (req, res) => {
    try {
        const { receiverEmail, amount, notes } = req.body;

        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) throw new Error('User not found');

        if (receiver._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot request money from yourself' });
        }

        const transaction = await Transaction.create({
            userId: receiver._id,
            receiverId: req.user._id,
            type: 'request',
            amount,
            method: 'online',
            status: 'pending',
            description: notes || 'Money request'
        });

        res.json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/:requestId/accept', protect, async (req, res) => {
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        const request = await Transaction.findById(req.params.requestId).session(session);
        if (!request || request.type !== 'request' || request.status !== 'pending') {
            throw new Error('Invalid request');
        }

        if (request.userId.toString() !== req.user._id.toString()) {
            throw new Error('Unauthorized');
        }

        const user = await User.findById(req.user._id).session(session);
        if (user.balance < request.amount) {
            throw new Error('Insufficient balance');
        }

        await Transaction.findByIdAndUpdate(req.params.requestId, {
            status: 'accepted'
        }, { session });

        await User.findByIdAndUpdate(req.user._id, {
            $inc: { balance: -request.amount }
        }, { session });

        await User.findByIdAndUpdate(request.userId, {
            $inc: { balance: request.amount }
        }, { session });

        await session.commitTransaction();
        session.endSession();
        res.json({ message: 'Request accepted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/:requestId/reject', protect, async (req, res) => {
    try {
        const request = await Transaction.findById(req.params.requestId);
        if (!request || request.type !== 'request' || request.status !== 'pending') {
            throw new Error('Invalid request');
        }

        if (request.userId.toString() !== req.user._id.toString()) {
            throw new Error('Unauthorized');
        }

        await Transaction.findByIdAndUpdate(req.params.requestId, {
            status: 'rejected'
        });

        res.json({ message: 'Request rejected' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;