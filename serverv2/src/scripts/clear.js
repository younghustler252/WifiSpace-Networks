import mongoose from "mongoose";
import "../config/env.js";

// Exact accounts to delete.
// WSN0010 and WSN0014 are intentionally excluded.
const TARGET_WSN_IDS = [
	"WSN0009",
	"WSN0011",
	"WSN0012",
	"WSN0013",
	"WSN0015",
	"WSN0016",
];

const args = process.argv.slice(2);

const APPLY = args.includes("--apply");
const CONFIRM = args.includes("--confirm-delete");
const EXPECT_DB = args
	.find((arg) => arg.startsWith("--expect-db="))
	?.split("=")[1];

async function main() {
	if (APPLY && !CONFIRM) {
		throw new Error(
			"Deletion requires both --apply and --confirm-delete"
		);
	}

	if (APPLY && !EXPECT_DB) {
		throw new Error(
			"Specify --expect-db=YOUR_DATABASE_NAME before deleting"
		);
	}

	await mongoose.connect(process.env.MONGO_URI);

	try {
		const db = mongoose.connection.db;
		const accounts = db.collection("accounts");

		console.log("\n=== WSN Account Cleanup ===");
		console.log("Database:", db.databaseName);
		console.log("Mode:", APPLY ? "DELETE" : "PREVIEW");

		if (EXPECT_DB && db.databaseName !== EXPECT_DB) {
			throw new Error(
				`Database mismatch! Expected ${EXPECT_DB}, connected to ${db.databaseName}`
			);
		}

		const query = {
			wsnId: { $in: TARGET_WSN_IDS },
		};

		const matches = await accounts
			.find(query)
			.project({
				_id: 1,
				wsnId: 1,
				userId: 1,
				serviceType: 1,
				status: 1,
				approvalStatus: 1,
			})
			.sort({ wsnId: 1 })
			.toArray();

		console.log("\n=== Matching Accounts ===");

		console.table(
			matches.map((account) => ({
				id: account._id.toString(),
				wsnId: account.wsnId,
				serviceType: account.serviceType,
				status: account.status,
				userId: account.userId?.toString(),
			}))
		);

		const foundIds = new Set(
			matches.map((account) => account.wsnId)
		);

		const missing = TARGET_WSN_IDS.filter(
			(id) => !foundIds.has(id)
		);

		console.log("\nTarget accounts:", TARGET_WSN_IDS.length);
		console.log("Found:", matches.length);
		console.log("Missing:", missing);

		if (!APPLY) {
			console.log("\nPREVIEW ONLY: Nothing deleted.");
			console.log(
				"Use --apply --confirm-delete --expect-db=YOUR_DATABASE_NAME to delete."
			);
			return;
		}

		if (matches.length === 0) {
			console.log("No matching accounts found.");
			return;
		}

		// Delete only the exact records found during preview.
		// Recheck both _id and wsnId before deleting.
		const deleteQuery = {
			$or: matches.map((account) => ({
				_id: account._id,
				wsnId: account.wsnId,
			})),
		};

		const result = await accounts.deleteMany(deleteQuery);

		console.log("\n=== Deletion Result ===");
		console.log("Deleted:", result.deletedCount);
		console.log(
			"Skipped or changed:",
			matches.length - result.deletedCount
		);

		console.log(
			"\nWSN0010 and WSN0014 were not targeted."
		);
	} finally {
		await mongoose.disconnect();
	}
}

main().catch((error) => {
	console.error("Cleanup failed:", error.message);
	process.exitCode = 1;
});