const express = require('express');
const router = express.Router();

const {
    getAllPlans,
    purchaseSubscription,
    getCurrentSubscription,
    unsubscribeUser,
} = require('../controllers/subscriptionController');

const { protect } = require('../middleware/authMiddleware');

// -------------------------------------------------------------
// Apply protect middleware globally (all routes require login)
// -------------------------------------------------------------
router.use(protect);

// -------------------------------------------------------------
// USER ROUTES
// -------------------------------------------------------------

// Get all subscription plans
router.get('/', getAllPlans);

// Purchase a subscription (user only)
router.post('/purchase', purchaseSubscription);

// Get current subscription (user only)
router.get('/current', getCurrentSubscription);

// Unsubscribe (user cancels their own subscription)
router.delete('/unsubscribe', unsubscribeUser);

module.exports = router;
