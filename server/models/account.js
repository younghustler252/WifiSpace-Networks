const mongoose = require('mongoose');
const usageStatsSchema = require('./subSchemas/usageStats.schema');
const activeSessionSchema = require('./subSchemas/activeSession.schema');

const accountSchema = new mongoose.Schema(
	{
		// -------------------------
		// Owner Reference
		// -------------------------
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true
		},

		// -------------------------
		// Account Type
		// -------------------------
		accountType: {
			type: String,
			enum: ['personal', 'business'],
			default: 'personal'
		},

		businessName: {
			type: String,
			required: function () {
				return this.accountType === 'business';
			}
		},

		// -------------------------
		// Unique WSN ID
		// -------------------------
		wsnId: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true
		},

		phone: Number,

		nin: {
			type: Number,
			index: {
				unique: true,
				partialFilterExpression: {
					nin: { $exists: true, $ne: null }
				}
			}
		},

		address: String,

		// -------------------------
		// Subscription
		// -------------------------
		subscription: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Subscription'
		},

		subscriptionStatus: {
			type: String,
			enum: ['none', 'active', 'expired', 'suspended'],
			default: 'none'
		},

		subscriptionStart: Date,
		subscriptionEnd: Date,

		cancelAtPeriodEnd: {
			type: Boolean,
			default: false
		},

		// -------------------------
		// MikroTik
		// -------------------------
		routerPassword: String,

		routerProfile: {
			type: String,
			default: 'default'
		},

		hotspotSynced: {
			type: Boolean,
			default: false
		},

		hotspotError: {
			type: String,
			default: null
		},

		lastSyncAt: Date,

		activeSessions: [activeSessionSchema],

		usageStats: usageStatsSchema,

		totalBytesIn: {
			type: Number,
			default: 0
		},

		totalBytesOut: {
			type: Number,
			default: 0
		},

		lastSeenAt: Date
	},
	{ timestamps: true }
);

module.exports =
	mongoose.models.Account || mongoose.model('Account', accountSchema);
