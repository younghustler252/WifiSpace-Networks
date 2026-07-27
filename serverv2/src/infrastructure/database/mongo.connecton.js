import mongoose from 'mongoose';
import { databaseConfig } from '../../config/database.js';

export const connectDatabase = async () => {
	try {
		await mongoose.connect(databaseConfig.uri, databaseConfig.options);

		console.log('✅ MongoDB connected successfully');

	} catch (error) {
		console.error('❌ MongoDB connection failed:', error.message);
		process.exit(1);
	}
};

