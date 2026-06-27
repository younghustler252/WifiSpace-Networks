export async function startWorkers() {
    try {
        console.log("⏳ Initializing system background queue workers...");

        // 🔥 FIXED: Added await and included your brand new provisioning worker runner file
        await Promise.all([
            import("../../modules/subscription/infrastructure/workers/expire-subscription.runner.js"),
            import("../../modules/subscription/infrastructure/workers/provision-subscription.runner.js") // 👈 ADD THIS LINE
        ]);

        console.log("🚀 Workers loaded and actively listening to Redis channels.");
    } catch (error) {
        console.error("🔥 FATAL: Failed to initialize background queue workers:", error.message);
        process.exit(1); // Crash early so you know immediately if your worker imports are broken
    }
}
