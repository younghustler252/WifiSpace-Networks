import {
	getDayString,
	getWeekString,
	getMonthString
} from "../../../shared/utils/date.js";

import { mapEventToData } from "../infrastructure/mappers/analytics.mapper.js";

export default class TrackAnalytics {
	constructor(analyticsRepo) {
		this.analyticsRepo = analyticsRepo;
	}

	async track(event, payload = {}) {
		const now = new Date();

		const day = getDayString(now);
		const week = getWeekString(now);
		const month = getMonthString(now);

		const data = mapEventToData(event, payload);

		// ignore unknown events
		if (!data) return;

		try {
			await Promise.all([
				this.analyticsRepo.upsertDaily(day, data),
				this.analyticsRepo.upsertWeekly(week, data),
				this.analyticsRepo.upsertMonthly(month, data)
			]);
		} catch (err) {
			console.error("Analytics write failed", {
				event,
				payload,
				data,
				error: err.message
			});
		}
	}
}