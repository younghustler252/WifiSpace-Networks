	import mongoose from "mongoose";

	const ROUTER_TYPES = [
		"pppoe",
		"hotspot",
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
			routerUid: {
				type: String,
				trim: true
			},

			// ----------------------------
			// Router Capability
			// ----------------------------

			supportedServices: {
				type: [String],
				enum: ["pppoe", "hotspot"],
				default: []
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

			lastError: {
				type: String, // Stores things like "Connection timed out" or "Invalid credentials"
				default: null
			},

			isEnabled: {
				type: Boolean,
				default: true,
			},

			apiEnabled: {
				type: Boolean,
				default: true, // Allows you to temporarily disable API commands to a router without taking it offline
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