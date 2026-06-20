import { fetchJobs, submitResult }
from "./services/backend.service.js";

import { executeCommand }
from "./services/mikrotik.service.js";

export async function processJobs() {

    try {

        const jobs = await fetchJobs();

        for (const job of jobs) {

            try {

                const result =
                    await executeCommand(
                        job.router,
                        job.command,
                        job.params
                    );

                await submitResult({
                    jobId: job.jobId,
                    success: true,
                    result
                });

            } catch (err) {

                await submitResult({
                    jobId: job.jobId,
                    success: false,
                    error: err.message
                });

            }

        }

    } catch (err) {

        console.error(
            "Worker error:",
            err.message
        );
    }
}