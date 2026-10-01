import mongoose from "mongoose";

const PROVISIONING_STATUSES = ["not_started", "synced", "failed"];

const routerProvisioningSchema = new mongoose.Schema({
	accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
	subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
	routerId: { type: mongoose.Schema.Types.ObjectId, ref: "Router", required: true },

	status: { type: String, enum: PROVISIONING_STATUSES, default: "not_started" },
	lastSyncedAt: { type: Date, default: null },
	lastError: { type: String, default: null }
}, { timestamps: true });

routerProvisioningSchema.index({ accountId: 1, routerId: 1 }, { unique: true });
routerProvisioningSchema.index({ routerId: 1, status: 1 });

export default mongoose.model("RouterProvisioning", routerProvisioningSchema);