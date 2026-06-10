// modules/usage/usecases/aggregate-summary.usecase.js

import { UsageSummaryRepositoryMongo } from "../infrastructure/repositories/usage-summary.repository.mongo.js";

export class AggregateSummaryUseCase {

	constructor({ summaryRepo = new UsageSummaryRepositoryMongo() } = {}) {
		this.summaryRepo = summaryRepo;
	}

	async execute(usages, periodType = "daily") {

		if (!usages?.length) return;

		const period = new Date().toISOString().slice(0, 10);

		const grouped = new Map();

		for (const u of usages) {

			const key = `${u.accountId}-${period}`;

			if (!grouped.has(key)) {

				grouped.set(key, {
					accountId: u.accountId,
					subscriptionId: u.subscriptionId,
					periodType,
					period,
					totalBytesIn: 0,
					totalBytesOut: 0,
					totalSessionTime: 0
				});

			}

			const summary = grouped.get(key);

			summary.totalBytesIn += u.bytesIn;
			summary.totalBytesOut += u.bytesOut;
			summary.totalSessionTime += u.sessionTime;

		}

		for (const summary of grouped.values()) {

			await this.summaryRepo.upsert(summary);

		}

	}
}