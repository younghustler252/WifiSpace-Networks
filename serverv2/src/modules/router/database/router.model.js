import mongoose from "mongoose";
import { ROUTER_STATUS_LIST, CONNECTION_TYPE_LIST, AGENT_STATUS_LIST, SERVICE_TYPE_LIST } from "../domain/router.enum.js";

const routerSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		code: { type: String, required: true, uppercase: true, trim: true, unique: true },

		host: { type: String, required: true, trim: true },
		port: { type: Number, default: 8728 },
		username: { type: String, required: true },
		passwordEncrypted: { type: String, required: true, select: false },
		ssl: { type: Boolean, default: false },
		routerUid: { type: String, trim: true },

		supportedServices: { type: [String], enum: SERVICE_TYPE_LIST, default: [] },

		location: { type: String, trim: true },
		siteCode: { type: String, trim: true },
		popName: { type: String, trim: true },

		status: { type: String, enum: ROUTER_STATUS_LIST, default: "offline", index: true },
		lastError: { type: String, default: null },

		isEnabled: { type: Boolean, default: true },
		apiEnabled: { type: Boolean, default: true },

		lastSeenAt: { type: Date },
		lastProvisionSyncAt: { type: Date },

		connectionType: { type: String, enum: CONNECTION_TYPE_LIST, default: "direct" },
		connectorId: { type: String, default: null, trim: true, index: true },

		maxSessions: { type: Number, default: 0 },
		currentSessions: { type: Number, default: 0 },
		agentLastSeenAt: { type: Date },
		agentStatus: { type: String, enum: AGENT_STATUS_LIST, default: "offline", index: true },

		routerOsVersion: { type: String },
		routerBoard: { type: String },
		systemIdentity: { type: String },

		priority: { type: Number, default: 1 },
		isDefaultRouter: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

routerSchema.index({ host: 1 });
routerSchema.index({ location: 1 });
routerSchema.index({ connectionType: 1 });

routerSchema.set("toJSON", {
	transform: (doc, ret) => {
		delete ret.passwordEncrypted;
		return ret;
	}
});

export default mongoose.model("Router", routerSchema);