require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
	console.log(`⚡ Server running on port ${PORT}`);
});

// Graceful shutdown
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

// ---- Background bootstrapping ----
(async () => {
	try {
		await require('./loaders/routeros')();  // ensure it's called if it exports a function
		console.log('✅ RouterOS initialized');
	} catch (err) {
		console.error('❌ RouterOS init failed:', err);
	}

	try {
		
		await require('./loaders/database')();
		console.log('✅ Database initialized');
	} catch (err) {
		console.error('❌ Database init failed:', err);
	}

	try {
		await require('./loaders/jobs')();
		console.log('✅ Jobs initialized');
	} catch (err) {
		console.error('❌ Jobs init failed:', err);
	}
})();
