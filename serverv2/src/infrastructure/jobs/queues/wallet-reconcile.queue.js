import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const walletReconcileQueue = new Queue("wallet-reconcile", { connection });

export async function registerWalletReconcileJob() {
	await walletReconcileQueue.upsertJobScheduler(
		"wallet-reconcile-scheduler",
		{ pattern: "*/15 * * * *" },
		{
			name: "reconcile-wallet-funding",
			data: {},
			opts: {
				attempts: 3,
				backoff: { type: "exponential", delay: 30000 },
				removeOnComplete: 20,
				removeOnFail: 50
			}
		}
	);

	console.log("✅ Wallet reconciliation scheduler registered");
}
