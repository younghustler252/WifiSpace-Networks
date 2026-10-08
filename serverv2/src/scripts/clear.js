import mongoose from "mongoose";
import SubscriptionModel from "../modules/subscription/database/subscription.model.js";
import AccountModel from "../modules/account/database/account.model.js";
import "../config/env.js";

const WSN_ID = "WSN1204";

await mongoose.connect(process.env.MONGO_URI);

console.log("MongoDB connected");

const account = await AccountModel.findOne({ wsnId: WSN_ID });

if (!account) {
	console.log(`Account ${WSN_ID} not found`);
	await mongoose.disconnect();
	process.exit(1);
}

const subscriptions = await SubscriptionModel.find({
	accountId: account._id
}).sort({ createdAt: -1 });

console.log("\nACCOUNT:");
console.dir({
	_id: account._id.toString(),
	wsnId: account.wsnId
}, { depth: null });

console.log("\nSUBSCRIPTIONS:");

for (const subscription of subscriptions) {
	console.dir({
		_id: subscription._id.toString(),
		status: subscription.status,
		cycles: subscription.cycles,
		startsAt: subscription.startsAt,
		expiresAt: subscription.expiresAt,
		graceEndsAt: subscription.graceEndsAt,
		expiredAt: subscription.expiredAt,
		currentPeriodEnd: subscription.currentPeriodEnd
	}, { depth: null });
}

const badSubscription = subscriptions.find((subscription) =>
	subscription.status === "expired" &&
	subscription.expiredAt &&
	subscription.expiresAt &&
	new Date(subscription.expiresAt) > new Date(subscription.expiredAt)
);

if (!badSubscription) {
	console.log("\nNo bad expired subscription found.");
	await mongoose.disconnect();
	process.exit(0);
}

console.log("\nBAD SUBSCRIPTION FOUND:");
console.dir({
	_id: badSubscription._id.toString(),
	status: badSubscription.status,
	cycles: badSubscription.cycles,
	expiresAt: badSubscription.expiresAt,
	expiredAt: badSubscription.expiredAt,
	currentPeriodEnd: badSubscription.currentPeriodEnd
}, { depth: null });

const newExpiresAt = new Date(badSubscription.expiredAt);

badSubscription.expiresAt = newExpiresAt;
badSubscription.currentPeriodEnd = newExpiresAt;
badSubscription.graceEndsAt = null;

await badSubscription.save();

console.log("\nUPDATED.");

console.log("\nAFTER:");
console.dir({
	_id: badSubscription._id.toString(),
	status: badSubscription.status,
	cycles: badSubscription.cycles,
	startsAt: badSubscription.startsAt,
	expiresAt: badSubscription.expiresAt,
	graceEndsAt: badSubscription.graceEndsAt,
	expiredAt: badSubscription.expiredAt,
	currentPeriodEnd: badSubscription.currentPeriodEnd
}, { depth: null });

await mongoose.disconnect();