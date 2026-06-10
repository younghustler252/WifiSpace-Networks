export class GetAdminDashboardUseCase {
    constructor({
        userRepository,
        accountRepository,
        subscriptionRepository
    }) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    async execute() {
        const [
            users,
            accounts,
            subscriptions
        ] = await Promise.all([
            this.userRepository.getDashboardStats(),
            this.accountRepository.getDashboardStats(),
            this.subscriptionRepository.getDashboardStats()
        ]);

        return {
            overview: {
                totalUsers: users.total,
                totalAccounts: accounts.total,
                activeAccounts: accounts.active,
                activeSubscriptions: subscriptions.active,
                expiredSubscriptions: subscriptions.expired
            },

            users,
            accounts,
            subscriptions
        };
    }
}