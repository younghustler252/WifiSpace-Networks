// src/scripts/sync-ipoe-from-routers.js
import fs from "fs";
import path from "path";
import "../config/env.js";
import { connectDatabase } from "../infrastructure/database/mongo.connecton.js";
import { container } from "../container/index.js";

const args = new Map(
	process.argv.slice(2).map((arg) => {
		const [key, value = "true"] = arg.replace(/^--/, "").split("=");
		return [key, value];
	})
);

const apply = args.has("apply");
const fixWsnIds = args.has("fix-wsn-ids");
const routerFilter = args.get("router") ?? null;

const COLUMNS = ["router", "wsnId", "matchType", "status", "reason", "detail", "drift", "macAddress", "profile", "accountWsnId", "accountId", "suggestedPlans"];

function toCsv(rows) {
	const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
	return [COLUMNS.join(","), ...rows.map((row) => COLUMNS.map((column) => escape(row[column])).join(","))].join("\n");
}

async function main() {
	await connectDatabase();

	const result = await container.resolve("reconcileIpoeAccounts").execute({ routerFilter, apply, fixWsnIds });

	const directory = path.resolve("reports");
	fs.mkdirSync(directory, { recursive: true });

	const stamp = new Date().toISOString().replace(/[:.]/g, "-");
	const base = path.join(directory, `ipoe-reconcile-${result.summary.mode}-${stamp}`);

	fs.writeFileSync(`${base}.json`, JSON.stringify(result, null, 2));
	fs.writeFileSync(`${base}.csv`, toCsv(result.rows));

	console.log(JSON.stringify(result.summary, null, 2));
	console.log(result.complete ? `Database accounts not found on any router: ${result.notFound.length} (see the JSON file)` : "Partial scan: the not-found list was skipped.");
	console.log(`Report written to ${base}.csv and ${base}.json`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await container.resolve("mikrotikClient").disconnectAll().catch(() => {});
		process.exit();
	});