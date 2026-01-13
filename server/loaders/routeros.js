const { connectRouter } = require('../config/routeros');

module.exports = async () => {
	try {
		await connectRouter();
		console.log('✅ RouterOS connected');
	} catch (err) {
		console.warn('⚠ RouterOS connection failed:', err.message);
	}
};
