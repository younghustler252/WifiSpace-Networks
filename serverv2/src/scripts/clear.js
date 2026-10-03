import "../config/env.js";
import mongoose from "mongoose";

const confirm = process.argv.includes("--confirm");

if (!confirm) {
	console.error("❌ Refusing to delete audit log data without --confirm");
	console.error("Run: node scripts/clear-audit-logs.js --confirm");
	process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

console.log("MongoDB connected.");

const db = mongoose.connection.db;

const collections = ["auditlogs"];

for (const name of collections) {
	const exists = await db.listCollections({ name }).hasNext();

	if (!exists) {
		console.log(`ℹ️ Collection "${name}" does not exist. Skipping.`);
		continue;
	}

	const collection = db.collection(name);

	const count = await collection.countDocuments();

	console.log(`\n${name}: ${count} documents`);

	if (count === 0) {
		console.log(`Nothing to delete from "${name}".`);
		continue;
	}

	const result = await collection.deleteMany({});

	console.log(`✅ Deleted ${result.deletedCount} documents from "${name}".`);
}

await mongoose.disconnect();

console.log("\n✅ Audit log cleanup complete.");
