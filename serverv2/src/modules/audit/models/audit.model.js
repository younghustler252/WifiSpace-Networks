import mongoose from "mongoose";
import { ACTOR_TYPE_LIST } from "../domain/audit.enum.js";

const auditLogSchema = new mongoose.Schema(
	{
		actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
		actorType: { type: String, enum: ACTOR_TYPE_LIST, default: "user", index: true },

		action: { type: String, required: true, index: true },
		entity: { type: String, required: true, index: true },
		entityId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },

		oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
		newValue: { type: mongoose.Schema.Types.Mixed, default: null },

		metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
		ip: { type: String, default: null },
		userAgent: { type: String, default: null }
	},
	{ timestamps: true }
);

auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);