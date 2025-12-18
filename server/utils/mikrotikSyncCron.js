const cron = require("node-cron");
const mikrotikQueue = require("../queues/mikrotikQueue");

console.log("🔄 MikroTik sync cron loaded");

// Runs every 6 hours (00:00, 06:00, 12:00, 18:00)
cron.schedule("0 */6 * * *", async () => {
    try {
        console.log("⏳ Starting automatic MikroTik → MongoDB sync...");
        await mikrotikQueue.add("importRouterUsers");
        console.log("✅ Sync job queued successfully");
    } catch (err) {
        console.error("❌ Failed to queue MikroTik sync:", err);
    }
});
