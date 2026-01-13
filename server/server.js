require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
	console.log(`⚡ Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
	console.log('🛑 Shutting down server...');
	server.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ---- Background bootstrapping ----
(async () => {
	try {
		// Database SHOULD retry but not kill app
		await require('./loaders/database')();
		console.log('✅ Database connected');
	} catch (err) {
		console.error('❌ Database connection failed:', err);
	}

	require('./loaders/routeros')

	require('./loaders/jobs')();

})();
