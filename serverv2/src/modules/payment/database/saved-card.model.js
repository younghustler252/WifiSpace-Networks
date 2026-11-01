import mongoose from "mongoose";

const savedCardSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		authorizationCode: { type: String, required: true, select: false },
		signature: { type: String, required: true },
		email: { type: String, required: true },
		last4: { type: String, required: true },
		brand: { type: String, default: null },
		bank: { type: String, default: null },
		cardType: { type: String, default: null },
		expMonth: { type: String, default: null },
		expYear: { type: String, default: null },
		isDefault: { type: Boolean, default: false },
		lastUsedAt: { type: Date, default: null }
	},
	{ timestamps: true }
);

savedCardSchema.index({ userId: 1, signature: 1 }, { unique: true });

export default mongoose.model("SavedCard", savedCardSchema);
