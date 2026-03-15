// payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
			index: true
		},

		accountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Account",
			index: true
		},

		wsnId: {
			type: String
		},

		planId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Plan",
			required: true
		},
		amount: {
			type: Number,
			required: true,
			min: 0
		},

		monthsPaid: {
			type: Number,
			required: true,
			min: 1
		},

		bonusDays: {
			type: Number,
			default: 0,
			min: 0
		},

		method: {
			type: String,
			enum: ["paystack", "wallet", "bank_transfer"],
			required: true
		},

		status: {
			type: String,
			enum: ["pending", "successful", "failed", "expired"],
			default: "pending",
			required: true
		},

		transactionId: {
			type: String,
			unique: true,
			sparse: true 
		},

		paymentDate: {
			type: Date,
			default: Date.now
		},

		subscriptionStartDate: {
			type: Date
		},

		subscriptionEndDate: {
			type: Date
		},

		paymentDetails: {
			type: Object
		}
	},
	{
		timestamps: true
	}
);

// Optional: index for quick query by user & active payments
paymentSchema.index({ userId: 1, status: 1 });

export default mongoose.model("Payment", paymentSchema);