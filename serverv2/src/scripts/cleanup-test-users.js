import mongoose from "mongoose";
import "../config/env.js";
import { HardDeleteCleanupService } from "../shared/services/hard-delete-cleanup.service.js";

// Match "test" anywhere in the user's full email or name.
// Examples:
// young@test.com
// hotspot2@test.com
// test@gmail.com
// youngtest@gmail.com
// young.test@gmail.com
// Test User
// Young Test
// Testing Account

const isTestUser = (user) => {
	const email = String(user.email ?? "");
	const firstName = String(user.firstName ?? "");
	const lastName = String(user.lastName ?? "");

	return (
		/test/i.test(email) ||
		/test/i.test(firstName) ||
		/test/i.test(lastName)
	);
};

// CLI arguments
const apply = process.argv.includes("--apply");

const confirm = process.argv.includes(
	"--confirm-test-user-purge"
);

const expectedDb = process.argv
	.find((arg) => arg.startsWith("--expect-db="))
	?.slice("--expect-db=".length);

// Prevent accidental deletion
if (apply && !confirm) {
	console.error(
		"Refusing deletion: use --apply --confirm-test-user-purge"
	);

	process.exit(1);
}

if (!process.env.MONGO_URI) {
	throw new Error("MONGO_URI is required");
}

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);

try {
	const db = mongoose.connection.db;

	// Confirm the database before deleting
	if (
		apply &&
		(!expectedDb || expectedDb !== db.databaseName)
	) {
		throw new Error(
			`Deletion requires --expect-db=${db.databaseName} to confirm the target database`
		);
	}

	// Fetch ALL users, regardless of role
	const users = await db
		.collection("users")
		.find({})
		.project({
			_id: 1,
			firstName: 1,
			lastName: 1,
			email: 1,
			role: 1,
		})
		.toArray();

	// Only customer users are eligible for deletion
	const matches = users.filter(
		(user) =>
			user.role === "customer" &&
			isTestUser(user)
	);

	// Show matching staff/admin users but protect them
	const excluded = users.filter(
		(user) =>
			user.role !== "customer" &&
			isTestUser(user)
	);

	console.log("\n========== USER DATABASE SCAN ==========");

	console.log(`Database: ${db.databaseName}`);
	console.log(`Total users: ${users.length}`);
	console.log(`Matching customer users: ${matches.length}`);
	console.log(`Excluded non-customer users: ${excluded.length}`);
	console.log(`Mode: ${apply ? "DELETE" : "PREVIEW"}`);

	// Display excluded users
	if (excluded.length) {
		console.log("\n========== EXCLUDED USERS ==========");

		console.table(
			excluded.map((user) => ({
				id: String(user._id),
				name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
				email: user.email,
				role: user.role,
			}))
		);
	}

	// Display matching customer users
	console.log("\n========== MATCHING TEST USERS ==========");

	console.table(
		matches.map((user) => ({
			id: String(user._id),
			name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
			email: user.email,
			role: user.role,
		}))
	);

	if (!matches.length) {
		console.log("\nNo matching customer users found.");
	} else if (!apply) {
		// PREVIEW MODE
		// No records are deleted.

		const result = await new HardDeleteCleanupService({
			db,
		}).cleanup({
			userIds: matches.map((user) => user._id),
			deleteUsers: true,
		});

		console.log("\n========== CLEANUP PREVIEW ==========");

		console.log(JSON.stringify(result, null, 2));

		console.log(
			"\nReview the listed users carefully before applying."
		);

		console.log(
			"Backup your database before permanent deletion."
		);
	} else {
		// DELETE MODE
		const session = await mongoose.startSession();

		try {
			let result;

			await session.withTransaction(async () => {
				// Recheck matching users inside the transaction
				const current = await db
					.collection("users")
					.find(
						{
							_id: {
								$in: matches.map(
									(user) => user._id
								),
							},
							role: "customer",
						},
						{ session }
					)
					.toArray();

				const userIds = current
					.filter(isTestUser)
					.map((user) => user._id);

				result = await new HardDeleteCleanupService({
					db,
				}).cleanup({
					userIds,
					deleteUsers: true,
					session,
					dryRun: false,
				});
			});

			console.log("\n========== CLEANUP COMPLETED ==========");

			console.log(JSON.stringify(result, null, 2));
		} finally {
			await session.endSession();
		}
	}
} catch (error) {
	console.error("\nCleanup failed:", error);

	process.exitCode = 1;
} finally {
	await mongoose.disconnect();
}