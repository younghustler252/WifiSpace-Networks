import mongoose from "mongoose";

const ROUTER_TYPES = [
	"pppoe",
	"hotspot",
	"mixed"
];

const ROUTER_STATUSES = [
	"online",
	"offline",
	"maintenance"
];

const routerSchema = new mongoose.Schema(
	{
		// ----------------------------
		// Identity
		// ----------------------------

		name: {
			type: String,
			required: true,
			trim: true,
		},

		code: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},

		// ----------------------------
		// Router Access
		// ----------------------------

		host: {
			type: String,
			required: true,
			trim: true,
		},

		port: {
			type: Number,
			default: 8728,
		},

		username: {
			type: String,
			required: true,
		},

		password: {
			type: String,
			required: true,
			select: false,
		},

		ssl: {
			type: Boolean,
			default: false,
		},

		// ----------------------------
		// Router Capability
		// ----------------------------

		routerType: {
			type: String,
			enum: ROUTER_TYPES,
			default: "pppoe",
		},

		// ----------------------------
		// Location / POP
		// ----------------------------

		location: {
			type: String,
			trim: true,
		},

		popName: {
			type: String,
			trim: true,
		},

		// ----------------------------
		// Operational State
		// ----------------------------

		status: {
			type: String,
			enum: ROUTER_STATUSES,
			default: "offline",
		},

		isEnabled: {
			type: Boolean,
			default: true,
		},

		lastSeenAt: {
			type: Date,
		},

		lastProvisionSyncAt: {
			type: Date,
		},

		// ----------------------------
		// Capacity Monitoring
		// ----------------------------

		maxSessions: {
			type: Number,
			default: 0,
		},

		currentSessions: {
			type: Number,
			default: 0,
		},

		// ----------------------------
		// RouterOS Metadata
		// ----------------------------

		routerOsVersion: {
			type: String,
		},

		routerBoard: {
			type: String,
		},

		systemIdentity: {
			type: String,
		},

		// ----------------------------
		// Failover / Priority
		// ----------------------------

		priority: {
			type: Number,
			default: 1,
		},

		isDefaultRouter: {
			type: Boolean,
			default: false,
		}
	},
	{
		timestamps: true,
	}
);



// ----------------------------
// Indexes
// ----------------------------

routerSchema.index({ code: 1 });

routerSchema.index({ host: 1 });

routerSchema.index({ status: 1 });

routerSchema.index({ routerType: 1 });

routerSchema.index({ location: 1 });



// ----------------------------
// Hide Sensitive Data
// ----------------------------

routerSchema.set("toJSON", {
	transform: (doc, ret) => {

		delete ret.password;

		return ret;
	}
});



export default mongoose.model("Router", routerSchema);