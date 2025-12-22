const cron = require('node-cron');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

// Wait for DB connection first
mongoose.connection.once('open', () => {
    console.log('🗄️ Database connected, initializing cron job...');

    cron.schedule('*/2 * * * *', async () => {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

            const result = await Payment.updateMany(
                { status: 'pending', createdAt: { $lt: oneHourAgo } },
                { $set: { status: 'expired' } }
            );

            if (result.modifiedCount > 0) {
                console.log(
                    `[${new Date().toISOString()}] Expired ${result.modifiedCount} pending payments (matched ${result.matchedCount})`
                );
            } else {
                // Optional: log nothing if nothing changed
                console.log(`[${new Date().toISOString()}] No pending payments to expire`);
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error expiring payments:`, error);
        }
    });

    console.log('🕒 Expired pending payments cron job initialized');
});

// DB connection error handling
mongoose.connection.on('error', (err) => {
    console.error('Database connection error:', err);
});
