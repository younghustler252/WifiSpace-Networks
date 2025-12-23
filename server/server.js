require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { logger } = require('./middleware/logger');
const { errorHandler } = require("./middleware/errorHandler");
const { connectRouter } = require('./config/routeros');


// Routes
const routerRoutes = require('./routes/routerRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);

// API Routes
app.use('/api/router', routerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Default route
app.get('/', (req, res) => res.send('✅ Server is running and Socket.io is active.'));

// 404 handler
app.use((req, res, next) => {
	res.status(404);
	next(new Error(`Route not found: ${req.originalUrl}`));
});

// Custom error handler
app.use(errorHandler);

// 🚀 Start server after DB + RouterOS connection
(async () => {
	try {
		// 1️⃣ Connect database
		await connectDB();
		console.log('✅ MongoDB connected');

		// 2️⃣ Connect MikroTik safely
		await connectRouter();

		// 3️⃣ Start workers & cron AFTER router ready
		require('./services/mikrotikWorker');
		require('./utils/mikrotikSyncCron');
		require('./utils/subscriptionScheduler');
		require('./utils/expirePendingPayments');



		// 4️⃣ Start server
		const PORT = process.env.PORT || 4000; 
		app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));

	} catch (err) {
		console.error('❌ Failed to start server:', err);
		process.exit(1);
	}
})();

// Handle unhandled errors
process.on('unhandledRejection', err => console.error('❌ Unhandled Rejection:', err));
process.on('uncaughtException', err => console.error('❌ Uncaught Exception:', err));
