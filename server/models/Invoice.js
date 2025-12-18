const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Transaction',
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    issueDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid',
    },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
