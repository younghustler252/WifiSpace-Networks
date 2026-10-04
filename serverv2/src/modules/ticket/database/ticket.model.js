// database/ticket.model.js
import mongoose from "mongoose";
import { TICKET_STATUS_LIST, TICKET_PRIORITY_LIST, TICKET_CATEGORY_LIST } from "../domain/ticket.enum.js";

const ticketSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
		assignedToId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
		category: { type: String, enum: TICKET_CATEGORY_LIST, required: true },
		priority: { type: String, enum: TICKET_PRIORITY_LIST, default: "normal", index: true },
		status: { type: String, enum: TICKET_STATUS_LIST, default: "open", index: true },
		subject: { type: String, required: true, trim: true },
		lastMessageAt: { type: Date, default: null },
		resolvedAt: { type: Date, default: null },
		closedAt: { type: Date, default: null }
	},
	{ timestamps: true }
);

ticketSchema.index({ status: 1, priority: -1, createdAt: 1 });
export default mongoose.model("Ticket", ticketSchema);