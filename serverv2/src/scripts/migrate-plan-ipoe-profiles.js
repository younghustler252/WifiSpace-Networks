import "../config/env.js";
import mongoose from "mongoose";
import { connectDatabase } from "../infrastructure/database/mongo.connecton.js";
import { container } from "../container/index.js";

const args = new Map(
	process.argv.slice(2).map((arg) => {
		const [key, value = "true"] = arg.replace(/^--/, "").split("=");
		return [key, value];
	})
);

const apply = args.has("apply");
const routerFilter = args.get("router") ?? null;
const allowPartial = args.has("allow-partial");
const suffix = args.get("suffix") ?? "Mbps-userprofile";
const overrides = new Map(
	(args.get("map") ?? "").split(";").filter(Boolean).map((pair) => pair.split("=").map((part) => part.trim()))
);

async function loadRouterProfiles() {
	const routerRepository = container.resolve("routerRepository");
	const hotspotService = container.resolve("hotspotService");

	const { data } = await routerRepository.paginate({ filter: { isEnabled: true }, limit: 100 });
	const selected = routerFilter ? data.filter((router) => router.code === routerFilter || router.id === routerFilter) : data;

	const perRouter = [];

	for (const summary of selected) {
		const router = await routerRepository.findById(summary.id);

		try {
			const profiles = await hotspotService.getProfiles(router);
			perRouter.push({ code: router.code, ok: true, profiles });
		} catch (error) {
			perRouter.push({ code: router.code, ok: false, error: error.errno || error.code || error.message, profiles: [] });
		}
	}

	return perRouter;
}

function summarizeProfiles(perRouter) {
	const reachable = perRouter.filter((entry) => entry.ok);
	const names = new Map();

	for (const entry of reachable) {
		for (const profile of entry.profiles) {
			const row = names.get(profile.name) ?? { name: profile.name, rateLimit: profile["rate-limit"] ?? "", sharedUsers: profile["shared-users"] ?? "", routers: [] };
			row.routers.push(entry.code);
			names.set(profile.name, row);
		}
	}

	return { reachable, names };
}

function proposeProfile(plan, names) {
	if (overrides.has(plan.name)) return overrides.get(plan.name);
	if (plan.ipoeProfile) return plan.ipoeProfile;

	const speed = parseInt(plan.speedRate, 10);
	if (!Number.isFinite(speed)) return null;

	const exact = `${speed}${suffix}`;
	if (names.has(exact)) return exact;

	const loose = [...names.keys()].filter((name) => new RegExp(`^${speed}\\s*Mbps`, "i").test(name));
	return loose.length === 1 ? loose[0] : exact;
}

async function main() {
	await connectDatabase();

	const perRouter = await loadRouterProfiles();
	const failed = perRouter.filter((entry) => !entry.ok);
	const { reachable, names } = summarizeProfiles(perRouter);

	console.log("\nRouters:");
	console.table(perRouter.map((entry) => ({ router: entry.code, reachable: entry.ok, profiles: entry.profiles.length, error: entry.error ?? "" })));

	console.log("\nHotspot user profiles found on routers:");
	console.table([...names.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })).map((row) => ({
		name: row.name, rateLimit: row.rateLimit, sharedUsers: row.sharedUsers, onRouters: `${row.routers.length}/${reachable.length}`
	})));

	if (failed.length && apply && !allowPartial) {
		console.log(`\n${failed.length} router(s) could not be reached, so profile availability is unknown. Nothing was written. Fix the router or add --allow-partial.`);
		return;
	}

	const db = mongoose.connection.db;
	const plans = await db.collection("plans").find({ serviceType: "pppoe", deletedAt: null }).toArray();

	const rows = plans.map((plan) => {
		const proposed = proposeProfile(plan, names);
		const present = proposed ? names.get(proposed)?.routers ?? [] : [];
		const missingOn = reachable.map((entry) => entry.code).filter((code) => !present.includes(code));

		return {
			name: plan.name, speedRate: plan.speedRate, current: plan.ipoeProfile ?? null, proposed,
			exists: Boolean(proposed) && missingOn.length === 0,
			missingOn: missingOn.join(", "),
			plan
		};
	});

	console.log("\nPlan to profile mapping:");
	console.table(rows.map(({ plan, ...row }) => row));

	const blocked = rows.filter((row) => !row.exists);
	if (blocked.length) {
		console.log(`\n${blocked.length} plan(s) will be skipped because the profile is missing on at least one router:`);
		blocked.forEach((row) => console.log(` - ${row.name} (speedRate "${row.speedRate}") wants "${row.proposed}"${row.missingOn ? `, missing on: ${row.missingOn}` : ""}`));
		console.log('Fix by creating the profile on the router(s), or point the plan at an existing one: --map="Plan Name=18Mbps-userprofile;Other Plan=20Mbps-userprofile"');
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
		await container.resolve("mikrotikClient").disconnectAll().catch(() => {});
		await mongoose.disconnect().catch(() => {});
		process.exit();
	});
