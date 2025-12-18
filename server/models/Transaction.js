const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    wsnId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    subscriptionPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['flutterwave', 'wallet', 'bank_transfer'],
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true, // This is important to track unique transactions
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        required: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    subscriptionStartDate: {
        type: Date,
    },
    subscriptionEndDate: {
        type: Date,
    },
    paymentDetails: {
        type: Object,  // Store additional payment-related data if necessary
    },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
