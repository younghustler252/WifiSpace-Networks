import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";

const WINDOW_DAYS = Number(process.env.WALLET_RECONCILE_DAYS || 2);

export function createWalletReconcileWorker() {
	const worker = new Worker(
		"wallet-reconcile",
		async () => {
			const reconcile = container.resolve("reconcileWalletFunding");
			const result = await reconcile.execute({
				from: new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000),
				apply: true
			});

			const { found, credited, unmatched } = result.summary;
			if (credited || unmatched) {
				console.log(`[wallet-reconcile] found ${found}, credited ${credited}, unmatched ${unmatched}`);
			}

			if (unmatched) {
				const unmatchedRows = result.rows.filter((row) => row.status === "unmatched");
				console.warn("[wallet-reconcile] Transfers with no matching wallet:", JSON.stringify(unmatchedRows));
			}
		},
		{ connection, concurrency: 1 }
	);

	attachWorkerLifecycleLogging(worker, "wallet-reconcile", { notifyOnFailure: true });
	return worker;
}
