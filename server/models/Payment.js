const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',  // Link to the User model
    },
    amount: {
        type: Number,
        required: true,
    },
    method: {
        type: String,
        enum: ['paystack', 'wallet', 'bank_transfer'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending',
        required: true,
    },
    planName: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
        unique: true,  // Paystack's transaction reference
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
        type: Object,
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',  // Reference to the Subscription model
    },
});

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
module.exports = Payment;
