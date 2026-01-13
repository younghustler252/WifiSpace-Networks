const connectDB = require('../config/db');

module.exports = async () => {
	await connectDB();
	console.log('✅ MongoDB connected');
};
