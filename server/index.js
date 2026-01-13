const app = require('./app');

const PORT = process.env.PORT || 4000;

// Start HTTP server
const server = app.listen(PORT, () => {
    console.log(`⚡ Server running on port ${PORT}`);
});

// Graceful shutdown (recommended)
const shutdown = () => {
    console.log('🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = server;
