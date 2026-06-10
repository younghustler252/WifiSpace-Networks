export class GetStaffDashboardUseCase {
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
            customers: {
                active: users.active,
                suspended: users.suspended
            },

            accounts: {
                pending: accounts.pending,
                active: accounts.active,
                suspended: accounts.suspended
            },

            subscriptions: {
                active: subscriptions.active,
                expired: subscriptions.expired,
                expiringSoon: subscriptions.expiringSoon
            }
        };
    }
}