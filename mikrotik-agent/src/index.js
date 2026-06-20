import { backendService } from "./services/backend.service.js";
import { mikrotikService } from "./services/mikrotik.service.js";
import { config } from "./config.js";

async function start() {
    console.log("Agent starting...");

    await backendService.register();
    console.log("Registered with backend");

    // Heartbeat
    setInterval(() => {
        backendService.heartbeat().catch(console.error);
    }, config.heartbeatInterval);

    // Poll for commands
    setInterval(async () => {
        try {
            const commands = await backendService.fetchPendingCommands();
            if (!commands.length) return;

            for (const job of commands) {
                console.log(`[AGENT] Executing: ${job.command}`, job.params);

                try {
                    const result = await mikrotikService.executeCommand(
                        job.router,   // router creds come from the job
                        job.command,
                        job.params
                    );

                    await backendService.postResult(job.jobId, { success: true, data: result });

                } catch (err) {
                    await backendService.postResult(job.jobId, { success: false, error: err.message });
                }
            }

        } catch (err) {
            console.error("Polling error:", err.message);
        }

    }, config.pollInterval);
}

start();