import "../config/env.js";
import mongoose from "mongoose";

const confirm = process.argv.includes("--confirm");

if (!confirm) {
	console.error("❌ Refusing to migrate PPPoE accounts without --confirm");
	console.error("Run: node scripts/migrate-pppoe-to-ipoe.js --confirm");
	process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

console.log("MongoDB connected.");

const db = mongoose.connection.db;
const collection = db.collection("accounts");

const filter = {
	serviceType: "pppoe",
	$or: [
		{ accessMethod: { $exists: false } },
		{ accessMethod: { $ne: "ipoe" } }
	]
};

const count = await collection.countDocuments(filter);

console.log(`\nPPPoE accounts requiring IPoE migration: ${count}`);

if (count === 0) {
	console.log("Nothing to migrate.");
	await mongoose.disconnect();
	console.log("\n✅ PPPoE → IPoE migration complete.");
	process.exit(0);
}

const result = await collection.updateMany(
	filter,
	{
		$set: {
			accessMethod: "ipoe"
		}
	}
);

console.log(`✅ Updated ${result.modifiedCount} PPPoE accounts to IPoE.`);

const remaining = await collection.countDocuments({
	serviceType: "pppoe",
	accessMethod: { $ne: "ipoe" }
});

console.log(`Remaining non-IPoE PPPoE accounts: ${remaining}`);

await mongoose.disconnect();

console.log("\n✅ PPPoE → IPoE migration complete.");
