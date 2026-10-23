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
const requery = args.has("requery");
const days = Number(args.get("days") ?? 7);

async function main() {
	await connectDatabase();

	const result = await container.resolve("reconcileWalletFunding").execute({
		from: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
		apply,
		requery
	});

	console.table(result.rows);
	console.log(JSON.stringify(result.summary, null, 2));

	if (result.rows.some((row) => row.status === "unmatched")) {
		console.log("Unmatched transfers have no wallet with that account number or email. Check them in the Paystack dashboard.");
	}

	const directory = path.resolve("reports");
	fs.mkdirSync(directory, { recursive: true });
	const file = path.join(directory, `wallet-reconcile-${result.summary.mode}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
	fs.writeFileSync(file, JSON.stringify(result, null, 2));
	console.log(`Report written to ${file}`);

	if (!apply) console.log("Dry run only. Add --apply to credit the wallets.");
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => process.exit());
