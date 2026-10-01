// payment-expiry.worker.js
import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";

export function createPaymentExpiryWorker() {
	const worker = new Worker(
		"payment-expiry",
		async () => {
			const expirePendingPayments = container.resolve("expirePendingPayments");
			const result = await expirePendingPayments.execute({ olderThanMinutes: 30 });
			console.log(`Checked ${result.checked}, reconciled ${result.reconciled}, expired ${result.expired} payment(s)`);
		},
		{ connection, concurrency: 1 }
	);

	attachWorkerLifecycleLogging(worker, "payment-expiry", { notifyOnFailure: true });
	return worker;
}