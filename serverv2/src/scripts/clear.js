import "../config/env.js";
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGO_URI);

console.log("MongoDB connected.\n");

const db = mongoose.connection.db;
const collection = db.collection("accounts");

const OLD_WSN_ID = "WSN0007";
const NEW_WSN_ID = "WSN1227";

try {
	// 1. Find the existing account
	const oldAccount = await collection.findOne({ wsnId: OLD_WSN_ID });

	if (!oldAccount) {
		throw new Error(`Account ${OLD_WSN_ID} was not found.`);
	}

	console.log(`Found account: ${OLD_WSN_ID}`);
	console.log(`Account _id: ${oldAccount._id}`);
	console.log(`User ID: ${oldAccount.userId}`);

	// 2. Make sure the new WSN ID isn't already being used
	const existingNewAccount = await collection.findOne({
		wsnId: NEW_WSN_ID
	});

	if (existingNewAccount) {
		throw new Error(
			`Cannot update: ${NEW_WSN_ID} already exists on account ${existingNewAccount._id}.`
		);
	}

	// 3. Perform the update
	const result = await collection.updateOne(
		{ _id: oldAccount._id, wsnId: OLD_WSN_ID },
		{
			$set: {
				wsnId: NEW_WSN_ID
			}
		}
	);

	// 4. Verify the update
	if (result.modifiedCount !== 1) {
		throw new Error(
			`Update failed. Expected 1 modified document, got ${result.modifiedCount}.`
		);
	}

	const updatedAccount = await collection.findOne({
		_id: oldAccount._id
	});

	console.log("\nAccount updated successfully.");
	console.log(`Old WSN ID: ${OLD_WSN_ID}`);
	console.log(`New WSN ID: ${updatedAccount.wsnId}`);
	console.log(`Account _id: ${updatedAccount._id}`);
} catch (error) {
	console.error("\nFailed to update account:");
	console.error(error.message);

	process.exitCode = 1;
} finally {
	await mongoose.disconnect();
	console.log("\nMongoDB disconnected.");
}