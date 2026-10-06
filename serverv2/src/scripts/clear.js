// src/scripts/clear.js

import "../config/env.js";
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGO_URI);

console.log("MongoDB connected.\n");

const db = mongoose.connection.db;
const collection = db.collection("accounts");

const DRY_RUN = process.env.DRY_RUN !== "false";

// ==================================================
// Helpers
// ==================================================

async function getApprovalSummary() {
	return collection
		.aggregate([
			{
				$group: {
					_id: "$approvalStatus",
					count: { $sum: 1 }
				}
			},
			{
				$sort: {
					count: -1
				}
			}
		])
		.toArray();
}

async function getStatusSummary() {
	return collection
		.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 }
				}
			},
			{
				$sort: {
					count: -1
				}
			}
		])
		.toArray();
}

function printSeparator() {
	console.log("────────────────────────────────────────");
}

// ==================================================
// Total accounts
// ==================================================

const totalAccounts = await collection.countDocuments();

printSeparator();
console.log("Account Database Summary");
printSeparator();

console.log(`Total accounts: ${totalAccounts}`);

console.log("");

// ==================================================
// Approval status summary
// ==================================================

const approvalSummary = await getApprovalSummary();

console.log("Approval Status");
printSeparator();

for (const item of approvalSummary) {
	console.log(
		`${JSON.stringify(item._id)}: ${item.count}`
	);
}

console.log("");

// ==================================================
// Account status summary
// ==================================================

const statusSummary = await getStatusSummary();

console.log("Account Status");
printSeparator();

for (const item of statusSummary) {
	console.log(
		`${JSON.stringify(item._id)}: ${item.count}`
	);
}

console.log("");

// ==================================================
// Pending accounts
// ==================================================

const pendingAccounts = await collection
	.find(
		{
			approvalStatus: "pending"
		},
		{
			projection: {
				_id: 1,
				userId: 1,
				wsnId: 1,
				accountType: 1,
				serviceType: 1,
				status: 1,
				approvalStatus: 1,
				approvalNote: 1,
				approvedAt: 1,
				approvedBy: 1
			}
		}
	)
	.toArray();

console.log(`Found ${pendingAccounts.length} pending accounts.\n`);

if (pendingAccounts.length > 0) {
	printSeparator();
	console.log("Pending Accounts");
	printSeparator();

	for (const account of pendingAccounts) {
		console.log(`ID:             ${account._id}`);
		console.log(`User ID:        ${account.userId ?? "MISSING"}`);
		console.log(`WSN ID:         ${account.wsnId ?? "MISSING"}`);
		console.log(`Account Type:   ${account.accountType ?? "MISSING"}`);
		console.log(`Service Type:   ${account.serviceType ?? "MISSING"}`);
		console.log(`Status:         ${account.status ?? "MISSING"}`);
		console.log(`Approval:       ${account.approvalStatus ?? "MISSING"}`);
		console.log(`Approved At:    ${account.approvedAt ?? "MISSING"}`);
		console.log(`Approved By:    ${account.approvedBy ?? "MISSING"}`);
		printSeparator();
	}
}

// ==================================================
// Legacy accounts
//
// These are accounts where both fields are missing:
//
// status: null
// approvalStatus: null
// ==================================================

const legacyFilter = {
	status: null,
	approvalStatus: null
};

const legacyCount = await collection.countDocuments(legacyFilter);

console.log("");
printSeparator();
console.log("Legacy Accounts");
printSeparator();

console.log(
	`Status + approvalStatus missing: ${legacyCount}`
);

console.log("");

// ==================================================
// Suspended / terminated accounts
// ==================================================

const protectedFilter = {
	status: {
		$in: ["suspended", "terminated"]
	}
};

const protectedCount = await collection.countDocuments(protectedFilter);

console.log(
	`Suspended/terminated accounts protected: ${protectedCount}`
);

console.log("");

// ==================================================
// Migration preview
// ==================================================

const accountsToMigrate = legacyCount + pendingAccounts.length;

printSeparator();
console.log("Migration Preview");
printSeparator();

console.log(
	`Legacy accounts → active + approved: ${legacyCount}`
);

console.log(
	`Pending accounts → approved:          ${pendingAccounts.length}`
);

console.log(
	`Total accounts affected:              ${accountsToMigrate}`
);

console.log(
	`Suspended/terminated affected:         NO`
);

printSeparator();

// ==================================================
// DRY RUN
// ==================================================

if (DRY_RUN) {
	console.log("\nDRY RUN enabled.");
	console.log("No accounts were modified.");

	console.log(
		`\nWould migrate ${accountsToMigrate} account(s).`
	);

	console.log(
		"Run with DRY_RUN=false to apply the changes."
	);

	await mongoose.disconnect();

	console.log("\nMongoDB disconnected.");
	console.log("Done.");

	process.exit(0);
}

// ==================================================
// REAL MIGRATION
// ==================================================

console.log("\nDRY RUN disabled.");
console.log("Applying migration...\n");

const migrationDate = new Date();

// ==================================================
// 1. Migrate legacy accounts
//
// Only accounts where BOTH fields are null.
//
// This changes:
//
// status: null
// approvalStatus: null
//
// INTO:
//
// status: "active"
// approvalStatus: "approved"
// ==================================================

const legacyResult = await collection.updateMany(
	{
		status: null,
		approvalStatus: null
	},
	{
		$set: {
			status: "active",
			approvalStatus: "approved",
			approvedAt: migrationDate,
			approvalNote: null
		}
	}
);

console.log("Legacy account migration complete.");
console.log(`Matched: ${legacyResult.matchedCount}`);
console.log(`Updated: ${legacyResult.modifiedCount}`);

// ==================================================
// 2. Approve pending accounts
//
// IMPORTANT:
// We do NOT change their status.
//
// Example:
//
// status: "active"
// approvalStatus: "pending"
//
// becomes:
//
// status: "active"
// approvalStatus: "approved"
// ==================================================

const pendingResult = await collection.updateMany(
	{
		approvalStatus: "pending"
	},
	{
		$set: {
			approvalStatus: "approved",
			approvedAt: migrationDate,
			approvalNote: null
		}
	}
);

console.log("\nPending account migration complete.");
console.log(`Matched: ${pendingResult.matchedCount}`);
console.log(`Updated: ${pendingResult.modifiedCount}`);

// ==================================================
// Final summary
// ==================================================

console.log("\n");
printSeparator();
console.log("FINAL ACCOUNT SUMMARY");
printSeparator();

const finalTotal = await collection.countDocuments();

console.log(`Total accounts: ${finalTotal}`);

console.log("");

// ==================================================
// Final approval summary
// ==================================================

console.log("Final Approval Status");
printSeparator();

const finalApprovalSummary = await getApprovalSummary();

for (const item of finalApprovalSummary) {
	console.log(
		`${JSON.stringify(item._id)}: ${item.count}`
	);
}

console.log("");

// ==================================================
// Final account status summary
// ==================================================

console.log("Final Account Status");
printSeparator();

const finalStatusSummary = await getStatusSummary();

for (const item of finalStatusSummary) {
	console.log(
		`${JSON.stringify(item._id)}: ${item.count}`
	);
}

console.log("");

// ==================================================
// Verification
// ==================================================

const remainingPending = await collection.countDocuments({
	approvalStatus: "pending"
});

const remainingLegacy = await collection.countDocuments({
	status: null,
	approvalStatus: null
});

const remainingMissingApproval = await collection.countDocuments({
	approvalStatus: null
});

console.log("");
printSeparator();
console.log("Migration Verification");
printSeparator();

console.log(`Remaining pending:          ${remainingPending}`);
console.log(`Remaining legacy records:   ${remainingLegacy}`);
console.log(`Missing approvalStatus:      ${remainingMissingApproval}`);

printSeparator();

if (
	remainingPending === 0 &&
	remainingLegacy === 0 &&
	remainingMissingApproval === 0
) {
	console.log("\nMigration verification PASSED.");
} else {
	console.log("\nWARNING: Some records still need investigation.");
}

// ==================================================
// Disconnect
// ==================================================

await mongoose.disconnect();

console.log("\nMongoDB disconnected.");
console.log("Done.");
