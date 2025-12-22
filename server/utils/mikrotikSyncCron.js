const cron = require("node-cron");
const mikrotikQueue = require("../queues/mikrotikQueue");

console.log("🔄 MikroTik sync cron loaded");

// Runs every 5 minutes (00:00, 06:00, 12:00, 18:00)
cron.schedule("*/5 * * * *", async () => {
    try {
        console.log("⏳ Starting full MikroTik → MongoDB sync...");
        await mikrotikQueue.add("fullSync");
        console.log("✅ Full sync job queued successfully");
    } catch (err) {
        console.error("❌ Failed to queue full MikroTik sync:", err);
    }
});
