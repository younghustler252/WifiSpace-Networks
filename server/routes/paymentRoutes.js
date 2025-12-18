const express = require('express');
const router = express.Router();

const {
    initiatePayment,
    verifyPaymentStatus,
    paystackWebhook,   // <-- include webhook controller
    getMyPayments,
    getSinglePayment,
} = require('../controllers/paymentControllers')

const { protect } = require('../middleware/authMiddleware');


// ---------------------------------------------
// 1. INITIATE PAYMENT
// ---------------------------------------------


router.post('/initiate-payment', initiatePayment);

// ---------------------------------------------
// 2. CALLBACK VERIFICATION (User returns to App)
// ---------------------------------------------
router.get('/verify-payment', verifyPaymentStatus);

// ---------------------------------------------
// 3. PAYSTACK WEBHOOK (Server-to-server)
// ---------------------------------------------
// IMPORTANT: must use express.raw() for signature validation
router.post(
    '/paystack/webhook',
    express.raw({ type: 'application/json' }),
    paystackWebhook
);

// ---------------------------------------------
// 4. GET ALL PAYMENTS FOR USER
// ---------------------------------------------
router.get('/', protect, getMyPayments);

// ---------------------------------------------
// 5. GET SINGLE PAYMENT
// ---------------------------------------------
router.get('/:transactionId', protect, getSinglePayment);

module.exports = router;
