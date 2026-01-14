const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

    wsnId: {
        type: String,
    },

    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true,
    },

    planName: {
        type: String,
        required: true,
    },

    amount: {
        type: Number,
        required: true,
    },

    monthsPaid: {
        type: Number,
        required: true,
        min: 1,
    },

    bonusDays: {
        type: Number,
        default: 0,
    },

    method: {
        type: String,
        enum: ['paystack', 'wallet', 'bank_transfer'],
        required: true,
    },

    status: {
        type: String,
        enum: ['pending', 'successful', 'failed', 'expired'],
        default: 'pending',
        required: true,
    },

    transactionId: {
        type: String,
        unique: true,
        sparse: true, // prevents index issues for non-paystack payments
    },

    paymentDate: {
        type: Date,
    },

    subscriptionStartDate: {
        type: Date,
    },

    subscriptionEndDate: {
        type: Date,
    },

    paymentDetails: {
        type: Object,
    },

}, { timestamps: true });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
module.exports = Payment;
