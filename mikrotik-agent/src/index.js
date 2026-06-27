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

async function handleJobExecution(job) {
    try {
        console.log(`[AGENT WORKER] Executing Job ID: ${job.jobId} | Cmd: ${job.command}`);
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
        console.error(`[AGENT WORKER ERROR] Job ${job.jobId} failed:`, err.message);
        try {
            await backendService.postResult(job.jobId, {
                success: false,
                error: err.message
            });
        } catch (postErr) {
            console.error(`[AGENT] Fatal result callback dropped for Job ${job.jobId}:`, postErr.message);
        }
    }
}

async function pollLoop() {
    while (true) {
        try {
            const commands = await backendService.fetchPendingCommands();

            if (commands && commands.length) {
                // 🔥 Fixed: Spin up all tasks in parallel using Promise.all to prevent single-file queuing delays
                await Promise.all(commands.map(job => handleJobExecution(job)));
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

        heartbeatLoop();
        pollLoop();
    } catch (err) {
        console.error("Fatal startup error:", err.message);
        await sleep(5000);
        start();
    }
}

start();

process.on("uncaughtException", (err) => {
    console.error("[UNCAUGHT EXCEPTION]", err);
});

process.on("unhandledRejection", (err) => {
    console.error("[UNHANDLED REJECTION]", err);
});
