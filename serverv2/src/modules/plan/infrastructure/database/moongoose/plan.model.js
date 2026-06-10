import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		accountType: {
			type: String,
			enum: ["personal", "business"],
			required: function () {
				return this.serviceType === "pppoe";
			},
			default: "personal"
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

		durationValue: { type: Number, required: true }, // e.g., 1, 30, 12
        durationUnit: { 
            type: String, 
            enum: ["minutes", "hours", "days", "months"], 
            default: "days" 
        },

       
        dataLimitBytes: { type: Number, default: 0 }, 

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

		gracePeriodDays: {
			type: Number,
			default: 0,
			min: 0
		},

		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active"
		},
		serviceType: {
			type: String,
			enum: ["pppoe", "hotspot"],
			required: true
		},
		// 🔥 BONUS RULE ENGINE (THIS IS THE KEY UPGRADE)
		bonusRules: [
			{
				minCycles: {
					type: Number,
					required: true
				},
				bonusDays: {
					type: Number,
					required: true
				}
			}
		]
	},
	{ timestamps: true }
);

planSchema.index(
	{ name: 1, serviceType: 1 },
	{ unique: true }
);

export default mongoose.model("Plan", planSchema);