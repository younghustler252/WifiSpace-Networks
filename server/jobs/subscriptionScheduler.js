const cron = require('node-cron');
const { deactivateExpiredSubscriptions } = require('../controllers/subscriptionController');

// Schedule a cron job to run every 10 minutes
// Cron format: * * * * * -> minute hour day month day-of-week
cron.schedule('*/10 * * * *', async () => {
    console.log('⏰ Running scheduled subscription check...');
    try {
        await deactivateExpiredSubscriptions();
    } catch (err) {
        console.error('❌ Error running subscription cron:', err.message);
    }
});
