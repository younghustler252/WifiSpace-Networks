require('dotenv').config();
const app = require('./app');


// --- Server Setup ---
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`⚡ Server running on port ${PORT}`);
});

// --- Graceful Shutdown ---
const shutdown = () => {
    console.log('🛑 Shutting down server...');
    server.close(err => {
        if (err) {
            console.error('Error during server shutdown:', err);
            process.exit(1);
        }
        process.exit(0);
    });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// --- Background Bootstrapping ---
(async () => {
    // Start DB first — critical
    try {
        await require('./loaders/database')();
        console.log('✅ Database initialized');
    } catch (err) {
        console.error('❌ Database init failed:', err);
        process.exit(1); // stop server if DB fails
    }

    // Start jobs — depends on DB
    try {
        await require('./loaders/jobs')();
        console.log('✅ Jobs initialized');
    } catch (err) {
        console.error('❌ Jobs init failed:', err);
        // optionally continue
    }

    // RouterOS — optional, runs in background, keeps retrying
    (async function initRouterOS() {
        try {
            const routeros = require('./loaders/routeros');
            await routeros(); // initial attempt
            console.log('✅ RouterOS connected');
        } catch (err) {
            console.error('❌ RouterOS initial connection failed:', err);
        }
        // Node-routeros retry logic will continue in background automatically
    })();
})();
