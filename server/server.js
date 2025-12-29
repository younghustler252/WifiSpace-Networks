require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- ROUTES ----------------
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ---------------- DEFAULT ROUTES ----------------
app.get('/', (req, res) => res.send('✅ Server is running'));

app.get('/api/health', (req, res) => {
	res.status(200).json({ status: 'OK' });
});

// ---------------- 404 HANDLER ----------------
app.use((req, res) => {
	res.status(404).json({
		message: `Route not found: ${req.originalUrl}`,
	});
});

// ---------------- START SERVER IMMEDIATELY ----------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));

// ---------------- ASYNC STARTUP TASKS ----------------
(async () => {
	try {
		const connectDB = require('./config/db');
		const { connectRouter } = require('./config/routeros');

		await connectDB();
		console.log('✅ MongoDB connected');

		try {
			await connectRouter();
			console.log('✅ RouterOS connected');
		} catch (err) {
			console.warn('⚠ RouterOS connection failed:', err.message);
		}

		// Background workers / cron jobs
		require('./services/mikrotikWorker');
		require('./utils/mikrotikSyncCron');
		require('./utils/subscriptionScheduler');
		require('./utils/expirePendingPayments');

	} catch (err) {
		console.error('❌ Startup error:', err);
	}
})();
