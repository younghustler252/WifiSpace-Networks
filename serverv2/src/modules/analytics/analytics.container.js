import { asClass } from "awilix";
import AnalyticsRepositoryMongo from "./infrastructure/repositories/analytics.repository.mongo.js";
import TrackAnalytics from "./usecases/track-analytics.js";

export function registerAnalytics(container) {

	container.register({

		analyticsRepository: asClass(AnalyticsRepositoryMongo).singleton(),

		trackAnalytics: asClass(TrackAnalytics).scoped()
	});
}