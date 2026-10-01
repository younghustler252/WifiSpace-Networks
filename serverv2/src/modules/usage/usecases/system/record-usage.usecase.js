import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { USAGE_ERROR_CODES } from "../../domain/usage.enum.js";
import { Usage } from "../../domain/usage.entity.js";

export class RecordUsage {
	constructor({ usageRepository, usageSummaryRepository, subscriptionRepository, networkService }) {
		this.usageRepository = usageRepository;
		this.usageSummaryRepository = usageSummaryRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
	}

	async execute({ subscriptionId, accountId, routerId = null, macAddress = null, bytesUsed = 0, secondsUsed = 0, source = "mikrotik_sync" }) {
		if (bytesUsed === 0 && secondsUsed === 0) return null; // nothing to record

		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription not found", USAGE_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);

		await this.usageRepository.create(new Usage({ subscriptionId, accountId, routerId, macAddress, bytesUsed, secondsUsed, source }));

		await this.usageSummaryRepository.upsertForSubscription(subscriptionId, accountId, {
			dataCapBytes: subscription.planSnapshot?.dataLimitBytes ?? 0,
			durationSeconds: this._durationSeconds(subscription)
		});

		const summary = await this.usageSummaryRepository.incrementUsage(subscriptionId, { bytesUsed, secondsUsed });

		// A subscription is time-boxed by its own expiresAt already (handled by
		// ExpireSubscriptions job) — but a DATA cap can be hit well before the
		// time expires. That needs its own enforcement, right here, the moment
		// the cap is crossed.
		if (summary.isDataExhausted() && subscription.isActive()) {
			await this.networkService.suspend(subscription).catch((err) =>
				console.error(`[RecordUsage] Data-cap suspension failed for subscription ${subscriptionId}:`, err.message)
			);
		}

		return summary;
	}

	_durationSeconds(subscription) {
		const { durationValue, durationUnit } = subscription.planSnapshot || {};
		const unitSeconds = { minutes: 60, hours: 3600, days: 86400, months: 30 * 86400 }[durationUnit] || 0;
		return (durationValue || 0) * unitSeconds;
	}
}