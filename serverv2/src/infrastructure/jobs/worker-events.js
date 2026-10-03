// infrastructure/jobs/worker-events.js
export function attachWorkerLifecycleLogging(worker, jobName, { notifyOnFailure = false } = {}) {
	worker.on("completed", (job) => {
		console.log(`[${jobName}] Job ${job.id} completed`);
	});

	worker.on("failed", (job, err) => {
		console.error(`[${jobName}] Job ${job?.id} failed (attempt ${job?.attemptsMade}/${job?.opts?.attempts}):`, err.message);

		// Only alert once a job has exhausted all its retries — a transient
		// failure that will retry successfully shouldn't page anyone.
		const exhausted = job && job.attemptsMade >= (job.opts?.attempts ?? 1);
		if (exhausted && notifyOnFailure) {
			notifyOpsOfJobFailure(jobName, job, err).catch((notifyErr) =>
				console.error(`[${jobName}] Failed to send failure notification:`, notifyErr.message)
			);
		}
	});

	worker.on("error", (err) => {
		// Worker-level errors (e.g. Redis connection lost) — not tied to a specific job.
		console.error(`[${jobName}] Worker error:`, err.message);
	});
}
async function notifyOpsOfJobFailure(jobName, job, err) {
	const { container } = await import("../../container/index.js");
	const sendSystemAlert = container.resolve("sendSystemAlert");
	await sendSystemAlert.execute({
		title: `Job "${jobName}" failed permanently`,
		message: `Job ${job.id} in queue "${jobName}" failed after exhausting all retries.\n\nError: ${err.message}\n\nData: ${JSON.stringify(job.data)}`
	});
}