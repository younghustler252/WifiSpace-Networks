const express = require('express');
const cors = require('cors');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// -------- GLOBAL MIDDLEWARE --------
app.use(cors());
app.use(express.json());
app.use(logger);

// -------- ROUTES --------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// -------- HEALTH / ROOT --------
app.get('/', (_, res) => res.send('✅ Server is running'));
app.get('/api/health', (_, res) => res.json({ status: 'OK' }));

// -------- 404 --------
app.use((req, res, next) => {
	const error = new Error(`Route not found: ${req.originalUrl}`);
	error.status = 404;
	next(error);
});

// -------- ERROR HANDLER --------
app.use(errorHandler);

module.exports = app;
