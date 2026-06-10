import mongoose from "mongoose";

const UsageSchema = new mongoose.Schema(
{
	accountId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account",
		required: true,
		index: true
	},

	subscriptionId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subscription",
		default: null,
		index: true
	},

	routerId: {
		type: String,
		required: true,
		index: true
	},

	username: {
		type: String,
		required: true,
		index: true
	},

	sessionId: {
		type: String,
		required: true,
		unique: true,
		index: true
	},

	type: {
		type: String,
		enum: ["hotspot", "pppoe"],
		required: true,
		index: true
	},

	ipAddress: {
		type: String,
		required: true,
		index: true
	},

	macAddress: {
		type: String,
		default: null,
		index: true
	},

	interface: {
		type: String
	},

	bytesIn: {
		type: Number,
		default: 0
	},

	bytesOut: {
		type: Number,
		default: 0
	},

	lastBytesIn: {
		type: Number,
		default: 0
	},

	lastBytesOut: {
		type: Number,
		default: 0
	},

	sessionTime: {
		type: Number,
		default: 0
	},

	startedAt: {
		type: Date,
		required: true,
		index: true
	},

	endedAt: {
		type: Date,
		default: null
	},

	status: {
		type: String,
		enum: ["active", "offline"],
		default: "active",
		index: true
	}
},
{ timestamps: true }
);


// performance indexes
UsageSchema.index({ accountId: 1, status: 1, startedAt: -1 });
UsageSchema.index({ routerId: 1, status: 1 });
UsageSchema.index({ username: 1, status: 1 });
UsageSchema.index({ startedAt: -1 });


// keep status synced
UsageSchema.pre("save", function (next) {

	if (this.endedAt && this.status !== "offline")
		this.status = "offline";

	if (!this.endedAt && this.status !== "active")
		this.status = "active";

	next();
});

export const UsageModel = mongoose.model("Usage", UsageSchema);