// src/modules/usage/services/usage-aggregation.service.js
import moment from "moment";
import { UsageModel } from "../infrastructure/database/mongoose/usage.model.js";
import { UsageSummaryModel } from "../infrastructure/database/mongoose/usage-summary.model.js";

export class UsageAggregationService {
	constructor() {
		// Store last processed timestamp for incremental aggregation
		this.lastProcessed = {
			daily: null,
			weekly: null,
			monthly: null
		};
	}

	// ----------------------------
	// Generate period string based on type
	// ----------------------------
	getPeriod(date, type) {
		const m = moment(date);
		switch (type) {
			case "daily":
				return m.format("YYYY-MM-DD");
			case "weekly":
				return m.format("YYYY-[W]WW");
			case "monthly":
				return m.format("YYYY-MM");
			default:
				throw new Error("Invalid period type");
		}
	}

	// ----------------------------
	// Aggregate new sessions incrementally
	// ----------------------------
	async aggregate(periodType = "daily") {
		const now = new Date();
		const last = this.lastProcessed[periodType] || new Date(0);

		console.log(`🕒 Incremental aggregation for ${periodType} from ${last}`);

		// ----------------------------
		// PPPoE: group by subscriptionId
		// ----------------------------
		const pppoeDocs = await UsageModel.aggregate([
			{ $match: { subscriptionId: { $ne: null }, startedAt: { $gt: last } } },
			{
				$group: {
					_id: "$subscriptionId",
					accountId: { $first: "$accountId" },
					totalBytesIn: { $sum: "$bytesIn" },
					totalBytesOut: { $sum: "$bytesOut" },
					totalSessionTime: { $sum: "$sessionTime" },
					firstUsedAt: { $min: "$startedAt" }
				}
			}
		]);

		for (const doc of pppoeDocs) {
			const period = this.getPeriod(doc.firstUsedAt, periodType);

			await UsageSummaryModel.findOneAndUpdate(
				{
					subscriptionId: doc._id,
					periodType,
					period
				},
				{
					$set: {
						accountId: doc.accountId
					},
					$inc: {
						totalBytesIn: doc.totalBytesIn,
						totalBytesOut: doc.totalBytesOut,
						totalSessionTime: doc.totalSessionTime
					}
				},
				{ upsert: true, new: true }
			);
		}

		// ----------------------------
		// Hotspot: group by accountId
		// ----------------------------
		const hotspotDocs = await UsageModel.aggregate([
			{ $match: { subscriptionId: null, startedAt: { $gt: last } } },
			{
				$group: {
					_id: "$accountId",
					totalBytesIn: { $sum: "$bytesIn" },
					totalBytesOut: { $sum: "$bytesOut" },
					totalSessionTime: { $sum: "$sessionTime" },
					firstUsedAt: { $min: "$startedAt" }
				}
			}
		]);

		for (const doc of hotspotDocs) {
			const period = this.getPeriod(doc.firstUsedAt, periodType);

			await UsageSummaryModel.findOneAndUpdate(
				{
					accountId: doc._id,
					periodType,
					period
				},
				{
					$inc: {
						totalBytesIn: doc.totalBytesIn,
						totalBytesOut: doc.totalBytesOut,
						totalSessionTime: doc.totalSessionTime
					}
				},
				{ upsert: true, new: true }
			);
		}

		// Update last processed timestamp
		this.lastProcessed[periodType] = now;
	}
}