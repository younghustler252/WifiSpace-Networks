// workers/session-sync.worker.js

import cron from "node-cron";
import { SessionSyncService } from "../modules/usage/services/session-sync.service.js"; // adjust path
import { UsageSummaryService } from "../modules/usage/services/usage-summary.service.js"; // new

const sessionSyncService = new SessionSyncService();
const usageSummaryService = new UsageSummaryService();

// ----------------------------
// Run every 2 minutes
// ----------------------------
cron.schedule("*/2 * * * *", async () => {
	try {
		console.log("🔄 Starting session sync...");

		// Fetch sessions from MikroTik
		const sessions = await sessionSyncService.sync();

		console.log(`✅ Session sync completed. Sessions: ${sessions.length}`);

		// ----------------------------
		// Update UsageSummary live
		// ----------------------------
		for (const session of sessions) {
			await usageSummaryService.updateUsage(session);
		}

		console.log("✅ Usage summary updated.");
	} catch (err) {
		console.error("❌ Session sync failed:", err);
	}
});