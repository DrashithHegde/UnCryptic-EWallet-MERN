const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['payment', 'request'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [1, 'Amount must be at least 1']
    },
    status: {
        type: String,
        enum: ['success', 'pending', 'rejected', 'accepted'],
        default: 'success'
    },
    method: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);