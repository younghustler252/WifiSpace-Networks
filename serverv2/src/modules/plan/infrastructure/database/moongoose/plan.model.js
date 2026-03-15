import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true
		},

		type: {
			type: String,
			required: true,
			enum: ["personal", "business"]
		},

		price: {
			type: Number,
			required: true,
			min: 0
		},

		speedRate: {
			type: String,
			required: true,
			trim: true
		},

		durationDays: {
			type: Number,
			default: 30,
			min: 1
		},

		devicesAllowed: {
			type: Number,
			default: 1,
			min: 1
		},

		features: {
			type: [String],
			default: []
		},

		mikrotikProfile: {
			type: String,
			required: true,
			trim: true
		},
		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active"
		}
	},
	{ timestamps: true }
);

export default mongoose.model("Plan", planSchema);