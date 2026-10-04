// database/ticket-message.model.js
import mongoose from "mongoose";

const ticketMessageSchema = new mongoose.Schema(
	{
		ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
		authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		authorRole: { type: String, required: true },
		message: { type: String, required: true, trim: true },
		attachments: { type: [String], default: [] }
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

ticketMessageSchema.index({ ticketId: 1, createdAt: 1 });
export default mongoose.model("TicketMessage", ticketMessageSchema);