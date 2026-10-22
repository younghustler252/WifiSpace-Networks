import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
		balanceKobo: { type: Number, default: 0, min: 0 },
		currency: { type: String, default: "NGN" },
		virtualAccount: {
			accountNumber: { type: String, default: null, index: true, sparse: true },
			bankName: { type: String, default: null },
			accountName: { type: String, default: null },
			customerCode: { type: String, default: null, index: true, sparse: true },
			assignedAt: { type: Date, default: null }
		}
	},
	{ timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);
