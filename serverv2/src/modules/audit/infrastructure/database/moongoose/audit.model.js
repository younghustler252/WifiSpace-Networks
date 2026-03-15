// src/infrastructure/database/mongoose/models/audit.model.js
import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
	{
		actorId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true
		},
		targetId: {
			type: mongoose.Schema.Types.ObjectId
		},
		action: {
			type: String,
			required: true
		},
		resource: {
			type: String
		},
		metadata: {
			type: Object,
			default: {}
		},
		ip: {
			type: String
		},
		userAgent: {
			type: String
		}
	},
	{ timestamps: true }
);

export default mongoose.model("AuditLog", auditSchema);