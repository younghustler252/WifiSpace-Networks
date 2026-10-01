import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { USAGE_ERROR_CODES } from "../../domain/usage.enum.js";

export class GetMyUsage {
	constructor({ usageSummaryRepository, subscriptionRepository }) {
		this.usageSummaryRepository = usageSummaryRepository;
		this.subscriptionRepository = subscriptionRepository;
	}

	async execute({ userId, accountId }) {
		const subscription = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		if (!subscription) throw new NotFoundError("No active subscription found", USAGE_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);
		if (subscription.userId !== userId) throw new NotFoundError("No active subscription found", USAGE_ERROR_CODES.SUBSCRIPTION_NOT_FOUND); // deliberately same message — don't leak existence to non-owners

		const summary = await this.usageSummaryRepository.findBySubscriptionId(subscription.id);
		if (!summary) {
			return { totalBytesUsed: 0, totalSecondsUsed: 0, dataCapBytes: subscription.planSnapshot?.dataLimitBytes ?? 0, remainingSeconds: subscription.getRemainingSeconds(), remainingBytes: null, dataUsagePercent: 0 };
		}

		return {
			totalBytesUsed: summary.totalBytesUsed,
			totalSecondsUsed: summary.totalSecondsUsed,
			remainingBytes: summary.getRemainingBytes(),
			remainingSeconds: subscription.getRemainingSeconds(),
			dataUsagePercent: summary.getDataUsagePercent(),
			lastSyncedAt: summary.lastSyncedAt
		};
	}
}