import mongoose from "mongoose";
import "../config/env.js";

// Deletes only confirmed orphaned account records.
// Rechecks user references immediately before deletion.

const ORPHAN_ACCOUNT_IDS = [
	"6a40bdd131efef69a75fda16", // ESN1072 - pppoe
	"6a4402edde8ae12c7e491bfc", // HS0004 - hotspot
	"6ac9f0f3b751eb2a02fab214", // HS0035 - hotspot
];

await mongoose.connect(process.env.MONGO_URI);

try {
	const db = mongoose.connection.db;
	const accounts = db.collection("accounts");
	const users = db.collection("users");

	console.log("=== Database ===");
	console.log({
		database: db.databaseName,
		targetAccounts: ORPHAN_ACCOUNT_IDS.length,
	});

	let deleted = 0;
	let skipped = 0;
	let failed = 0;

	for (const id of ORPHAN_ACCOUNT_IDS) {
		const accountId = new mongoose.Types.ObjectId(id);

		try {
			const account = await accounts.findOne({
				_id: accountId,
			});

			if (!account) {
				console.log("SKIPPED: Account not found.", { id });
				skipped++;
				continue;
			}

			if (
				!account.userId ||
				!(account.userId instanceof mongoose.Types.ObjectId)
			) {
				console.log(
					"SKIPPED: userId is missing or invalid; requires manual review.",
					{
						id,
						wsnId: account.wsnId ?? null,
					}
				);
				skipped++;
				continue;
			}

			// Recheck the referenced user immediately before deletion.
			const userExists = await users.findOne(
				{ _id: account.userId },
				{ projection: { _id: 1 } }
			);

			if (userExists) {
				console.log(
					"SKIPPED: Referenced user now exists.",
					{
						id,
						wsnId: account.wsnId ?? null,
						userId: account.userId.toString(),
					}
				);
				skipped++;
				continue;
			}

			// Delete only if the account still references the same missing user.
			const result = await accounts.deleteOne({
				_id: accountId,
				userId: account.userId,
			});

			if (result.deletedCount === 1) {
				console.log("DELETED: Confirmed orphaned account.", {
					accountId: id,
					wsnId: account.wsnId ?? null,
					serviceType: account.serviceType ?? null,
					userId: account.userId.toString(),
				});
				deleted++;
			} else {
				console.log(
					"SKIPPED: Account changed or was already removed.",
					{ id }
				);
				skipped++;
			}
		} catch (error) {
			console.error("FAILED:", {
				accountId: id,
				error: error.message,
			});
			failed++;
		}
	}

	console.log("\n=== Cleanup Summary ===");
	console.log({
		database: db.databaseName,
		deleted,
		skipped,
		failed,
	});

	if (failed > 0) {
		process.exitCode = 1;
	}
} catch (error) {
	console.error("Orphan cleanup failed:", error.message);
	process.exitCode = 1;
} finally {
	await mongoose.disconnect();
}