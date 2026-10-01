import { SUBSCRIPTION_STATUSES } from "../../subscription/domain/subscription.enum.js";
import { APPROVAL_STATUSES } from "../../account/domain/account.enum.js";
import { USER_ROLE } from "../../user/domain/user.enum.js";

export class GetAdminDashboard {
	constructor({ userRepository, accountRepository, subscriptionRepository, paymentRepository }) {
		this.userRepository = userRepository;
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.paymentRepository = paymentRepository;
	}

	async execute() {
		const [
			totalUsers,
			totalCustomers,
			accountStats,
			activeSubscriptions,
			pendingApprovals,
			revenueStats,
			successfulPayments
		] = await Promise.all([
			this.userRepository.count(),
			this.userRepository.count({ role: USER_ROLE.CUSTOMER }),
			this.accountRepository.getDashboardStats(),
			this.subscriptionRepository.count({ status: SUBSCRIPTION_STATUSES.ACTIVE }),
			this.accountRepository.count({ approvalStatus: APPROVAL_STATUSES.PENDING }),
			this.paymentRepository.getRevenueStats(),
			this.paymentRepository.countSuccessfulPayments()
		]);

		return {
			users: { total: totalUsers, customers: totalCustomers },
			accounts: accountStats,
			subscriptions: { active: activeSubscriptions },
			pendingApprovals,
			revenue: { total: revenueStats.totalRevenue, thisMonth: revenueStats.revenueThisMonth },
			payments: { successfulCount: successfulPayments }
		};
	}
}