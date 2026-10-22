import mongoose from "mongoose";
import { WALLET_TX_TYPE_LIST, WALLET_TX_SOURCE_LIST } from "../domain/wallet.enum.js";

const walletTransactionSchema = new mongoose.Schema(
	{
		walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		type: { type: String, enum: WALLET_TX_TYPE_LIST, required: true },
		source: { type: String, enum: WALLET_TX_SOURCE_LIST, required: true },
		amountKobo: { type: Number, required: true, min: 1 },
		balanceAfterKobo: { type: Number, default: null },
		reference: { type: String, required: true, unique: true },
		description: { type: String, default: null },
		metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("WalletTransaction", walletTransactionSchema);
