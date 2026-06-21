import { backendService } from "./services/backend.service.js";
import { mikrotikService } from "./services/mikrotik.service.js";
import { config } from "./config.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function heartbeatLoop() {
    while (true) {
        try {
            await backendService.heartbeat();
        } catch (err) {
            console.error("[HEARTBEAT ERROR]", err.message);
        }

        await sleep(config.heartbeatInterval);
    }
}

async function pollLoop() {
    while (true) {
        try {
            const commands = await backendService.fetchPendingCommands();

            if (commands && commands.length) {
                for (const job of commands) {
                    console.log(`[AGENT] Executing: ${job.command}`, job.params);

                    try {
                        const result = await mikrotikService.executeCommand(
                            job.router,
                            job.command,
                            job.params
                        );

                        await backendService.postResult(job.jobId, {
                            success: true,
                            data: result
                        });

                    } catch (err) {
                        await backendService.postResult(job.jobId, {
                            success: false,
                            error: err.message
                        });
                    }
                }
            }

        } catch (err) {
            console.error("[POLLING ERROR]", err.message);
        }

        await sleep(config.pollInterval);
    }
}

async function start() {
    console.log("Agent starting...");

    try {
        await backendService.register();
        console.log("Registered with backend");

        // run independently (non-blocking)
        heartbeatLoop();
        pollLoop();

    } catch (err) {
        console.error("Fatal startup error:", err.message);

        // retry startup after delay
        await sleep(5000);
        start();
    }
}

start();

// safety nets (VERY important for agents running 24/7)
process.on("uncaughtException", (err) => {
    console.error("[UNCAUGHT EXCEPTION]", err);
});

process.on("unhandledRejection", (err) => {
    console.error("[UNHANDLED REJECTION]", err);
});