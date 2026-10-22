import "../config/env.js";
import mongoose from "mongoose";
import { connectDatabase } from "../infrastructure/database/mongo.connecton.js";

const args = new Map(
	process.argv.slice(2).map((arg) => {
		const [key, value = "true"] = arg.replace(/^--/, "").split("=");
		return [key, value];
	})
);

const apply = args.has("apply");
const suffix = args.get("suffix") ?? "Mbps-userprofile";
const validProfiles = new Set(
	(args.get("profiles") ?? "1,2,3,4,5,6,8,10,11").split(",").map((n) => `${n.trim()}${suffix}`)
);
const overrides = new Map(
	(args.get("map") ?? "").split(";").filter(Boolean).map((pair) => pair.split("=").map((part) => part.trim()))
);

function proposeProfile(plan) {
	if (overrides.has(plan.name)) return overrides.get(plan.name);

	const speed = parseInt(plan.speedRate, 10);
	return Number.isFinite(speed) ? `${speed}${suffix}` : null;
}

async function main() {
	await connectDatabase();

	const db = mongoose.connection.db;
	const plans = await db.collection("plans").find({ serviceType: "pppoe", deletedAt: null }).toArray();

	const rows = plans.map((plan) => {
		const proposed = plan.ipoeProfile || proposeProfile(plan);
		const exists = proposed ? validProfiles.has(proposed) : false;
		return { name: plan.name, speedRate: plan.speedRate, mikrotikProfile: plan.mikrotikProfile, current: plan.ipoeProfile ?? null, proposed, exists, plan };
	});

	console.table(rows.map(({ plan, ...row }) => row));

	const blocked = rows.filter((row) => !row.exists);
	if (blocked.length) {
		console.log(`\n${blocked.length} plan(s) have no matching router profile and will be skipped:`);
		blocked.forEach((row) => console.log(` - ${row.name} (speedRate "${row.speedRate}")`));
		console.log('Fix with e.g. --map="Plan Name=5Mbps-userprofile;Other Plan=10Mbps-userprofile" or --profiles=1,2,5,10');
	}

	let plansUpdated = 0;
	let subscriptionsUpdated = 0;
	let legacyReset = 0;

	for (const row of rows.filter((item) => item.exists)) {
		const { plan, proposed } = row;

		const subscriptionFilter = {
			planId: plan._id,
			status: { $in: ["active", "pending", "suspended"] },
			$or: [{ "planSnapshot.ipoeProfile": { $exists: false } }, { "planSnapshot.ipoeProfile": null }]
		};

		const planChanges = {};
		if (plan.ipoeProfile !== proposed) planChanges.ipoeProfile = proposed;
		if (/-userprofile$/.test(plan.mikrotikProfile ?? "")) {
			planChanges.mikrotikProfile = "default";
			legacyReset++;
		}

		const affected = await db.collection("subscriptions").countDocuments(subscriptionFilter);
		if (Object.keys(planChanges).length) plansUpdated++;
		subscriptionsUpdated += affected;

		if (!apply) continue;

		if (Object.keys(planChanges).length) {
			await db.collection("plans").updateOne({ _id: plan._id }, { $set: planChanges });
		}

		const snapshotChanges = { "planSnapshot.ipoeProfile": proposed };
		if (planChanges.mikrotikProfile) snapshotChanges["planSnapshot.mikrotikProfile"] = "default";

		await db.collection("subscriptions").updateMany(subscriptionFilter, { $set: snapshotChanges });
	}

	console.log(`\n${apply ? "APPLIED" : "DRY RUN (nothing written)"}: ${plansUpdated} plan(s), ${subscriptionsUpdated} subscription snapshot(s), ${legacyReset} legacy PPP profile reset(s).`);
	if (!apply) console.log("Run again with --apply to write these changes.");
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await mongoose.disconnect().catch(() => {});
		process.exit();
	});
