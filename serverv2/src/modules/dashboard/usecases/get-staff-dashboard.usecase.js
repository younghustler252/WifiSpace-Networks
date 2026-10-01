import { SUBSCRIPTION_STATUSES } from "../../subscription/domain/subscription.enum.js";
import { APPROVAL_STATUSES } from "../../account/domain/account.enum.js";

export class GetStaffDashboard {
	constructor({ accountRepository, subscriptionRepository }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
	}

	async execute() {
		const [accountStats, activeSubscriptions, pendingApprovals] = await Promise.all([
			this.accountRepository.getDashboardStats(),
			this.subscriptionRepository.count({ status: SUBSCRIPTION_STATUSES.ACTIVE }),
			this.accountRepository.count({ approvalStatus: APPROVAL_STATUSES.PENDING })
		]);

		return { accounts: accountStats, subscriptions: { active: activeSubscriptions }, pendingApprovals };
	}
}