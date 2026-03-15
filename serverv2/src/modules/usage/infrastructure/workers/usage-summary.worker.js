import cron from "node-cron";
import { UsageModel } from "../database/mongoose/usage.model.js";
import { UsageSummaryModel } from "../database/mongoose/usageSummary.model.js";

// ----------------------------
// Worker: run every day at 1 AM
// ----------------------------
cron.schedule("0 1 * * *", async () => {
	try {
		console.log("🕒 Starting UsageSummary aggregation...");

		// ----------------------------
		// Define aggregation periods
		// ----------------------------
		const periods = [
			{ type: "daily", dateFormat: "%Y-%m-%d" },
			{ type: "weekly", isoWeek: true },
			{ type: "monthly", dateFormat: "%Y-%m" }
		];

		// ----------------------------
		// Loop over periods
		// ----------------------------
		for (const period of periods) {
			// ---- PPPoE (subscription-based) ----
			const pppoeAgg = await UsageModel.aggregate([
				{ $match: { subscriptionId: { $ne: null } } },
				{
					$group: {
						_id: getGroupId(period, true),
						accountId: { $first: "$accountId" },
						subscriptionId: { $first: "$subscriptionId" },
						totalBytesIn: { $sum: "$bytesIn" },
						totalBytesOut: { $sum: "$bytesOut" },
						totalSessionTime: { $sum: "$sessionTime" }
					}
				}
			]);

			await upsertSummaries(pppoeAgg, period.type);

			// ---- Hotspot (account-based) ----
			const hotspotAgg = await UsageModel.aggregate([
				{ $match: { subscriptionId: null } },
				{
					$group: {
						_id: getGroupId(period, false),
						accountId: { $first: "$accountId" },
						totalBytesIn: { $sum: "$bytesIn" },
						totalBytesOut: { $sum: "$bytesOut" },
						totalSessionTime: { $sum: "$sessionTime" }
					}
				}
			]);

			await upsertSummaries(hotspotAgg, period.type);
		}

		console.log("✅ UsageSummary aggregation completed.");
	} catch (err) {
		console.error("❌ UsageSummary aggregation error:", err);
	}
});

// ----------------------------
// Helper: Build MongoDB group _id based on period
// ----------------------------
function getGroupId(period, isPPPoE) {
	if (period.isoWeek) {
		// Weekly aggregation
		return {
			subscriptionId: isPPPoE ? "$subscriptionId" : null,
			accountId: "$accountId",
			year: { $isoWeekYear: "$startedAt" },
			week: { $isoWeek: "$startedAt" }
		};
	} else {
		// Daily or Monthly
		return {
			subscriptionId: isPPPoE ? "$subscriptionId" : null,
			accountId: "$accountId",
			period: {
				$dateToString: { format: period.dateFormat, date: "$startedAt" }
			}
		};
	}
}

// ----------------------------
// Helper: Upsert aggregated summaries
// ----------------------------
async function upsertSummaries(aggregates, periodType) {
	for (const agg of aggregates) {
		const filter = {
			subscriptionId: agg.subscriptionId || null,
			accountId: agg.accountId || null,
			periodType: periodType,
			period: agg._id.period || (agg._id.year && agg._id.week ? `${agg._id.year}-W${agg._id.week}` : null)
		};

		const update = {
			totalBytesIn: agg.totalBytesIn,
			totalBytesOut: agg.totalBytesOut,
			totalSessionTime: agg.totalSessionTime
		};

		await UsageSummaryModel.findOneAndUpdate(filter, update, {
			new: true,
			upsert: true
		});
	}
}