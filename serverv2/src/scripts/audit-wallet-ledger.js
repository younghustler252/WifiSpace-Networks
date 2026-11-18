// src/scripts/audit-wallet-ledger.js
// Read-only. Never writes to the database.
import "../config/env.js";
import mongoose from "mongoose";
import { connectDatabase } from "../infrastructure/database/mongo.connecton.js";
import WalletModel from "../modules/wallet/database/wallet.model.js";
import WalletTransactionModel from "../modules/wallet/database/wallet-transaction.model.js";

const hasUniqueIndex = (indexes, field) => indexes.some((index) => index.unique && Object.keys(index.key).length === 1 && index.key[field] === 1);

async function main() {
	await connectDatabase();
	const report = {};

	const walletIndexes = await WalletModel.collection.indexes();
	const txIndexes = await WalletTransactionModel.collection.indexes();
	report.indexes = {
		walletUserIdUnique: hasUniqueIndex(walletIndexes, "userId"),
		transactionReferenceUnique: hasUniqueIndex(txIndexes, "reference")
	};

	report.duplicateWalletsPerUser = await WalletModel.aggregate([
		{ $group: { _id: "$userId", count: { $sum: 1 }, ids: { $push: "$_id" } } },
		{ $match: { count: { $gt: 1 } } }
	]);

	report.duplicateReferences = await WalletTransactionModel.aggregate([
		{ $group: { _id: "$reference", count: { $sum: 1 }, ids: { $push: "$_id" } } },
		{ $match: { count: { $gt: 1 } } }
	]);

	report.incompleteTransactions = await WalletTransactionModel.find({ balanceAfterKobo: null })
		.select("reference userId type amountKobo source createdAt").lean();

	const sums = await WalletTransactionModel.aggregate([
		{ $group: { _id: "$walletId", ledgerKobo: { $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amountKobo", { $multiply: ["$amountKobo", -1] }] } }, count: { $sum: 1 } } }
	]);
	const ledger = new Map(sums.map((row) => [String(row._id), row]));
	report.balanceMismatches = [];
	for await (const wallet of WalletModel.find({}).select("userId balanceKobo").lean()) {
		const row = ledger.get(String(wallet._id));
		const ledgerKobo = row?.ledgerKobo ?? 0;
		if (ledgerKobo !== wallet.balanceKobo) {
			report.balanceMismatches.push({ walletId: String(wallet._id), userId: String(wallet.userId), balanceKobo: wallet.balanceKobo, ledgerKobo, difference: wallet.balanceKobo - ledgerKobo });
		}
	}

	report.sameTransferDifferentReference = await WalletTransactionModel.aggregate([
		{ $match: { source: "transfer", "metadata.gatewayReference": { $ne: null } } },
		{ $group: { _id: "$metadata.gatewayReference", count: { $sum: 1 }, references: { $addToSet: "$reference" } } },
		{ $match: { count: { $gt: 1 } } }
	]);

	console.log(JSON.stringify(report, null, 2));
	await mongoose.disconnect();
}

main().catch((error) => { console.error(error); process.exit(1); });
