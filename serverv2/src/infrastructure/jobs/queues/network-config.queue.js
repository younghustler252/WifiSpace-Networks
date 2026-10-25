import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const networkConfigQueue = new Queue("network-config", { connection });

const JOB_OPTIONS = { attempts: 3, backoff: { type: "exponential", delay: 15000 }, removeOnComplete: 50, removeOnFail: 100 };

export async function enqueueNetworkConfigSync(routerId) {
	const bucket = Math.floor(Date.now() / 5000);
	return networkConfigQueue.add("sync-router", { routerId }, { ...JOB_OPTIONS, jobId: `netcfg-${routerId}-${bucket}`, delay: 2000 });
}

export async function registerNetworkConfigJob() {
	await networkConfigQueue.upsertJobScheduler(
		"network-config-scheduler",
		{ pattern: "0 */6 * * *" },
		{ name: "sync-all-routers", data: { all: true }, opts: JOB_OPTIONS }
	);

	console.log("✅ Network config scheduler registered");
}
