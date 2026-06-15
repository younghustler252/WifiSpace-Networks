export class GetHotspotSession {

    constructor({
        accountRepository,
        userRepository,
        subscriptionRepository,
        planRepository
    }) {
        this.accountRepository      = accountRepository;
        this.userRepository         = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository         = planRepository;
    }

    async execute({ macAddress, email }) {

        if (!macAddress && !email) {
            throw new Error("MAC address or email is required");
        }

        let account = null;
        let user    = null;

        // 1. Try MAC lookup first
        if (macAddress) {
            account = await this.accountRepository.findByMac(macAddress);

            if (account) {
                user = await this.userRepository.findById(account.userId);
            }
        }

        // 2. Fall back to email lookup if MAC not found
        if (!account && email) {
            user = await this.userRepository.findByEmail(email);

            if (user) {
                account = await this.accountRepository.findOne({
                    userId:      user.id,
                    serviceType: "hotspot"
                });
            }
        }

        // 3. Nothing found — new user
        if (!account || !user) {
            return null;
        }

        // 4. Get active subscription
        const subscription = await this.subscriptionRepository
            .findActiveByAccount(account.id);

        // 5. Enrich with plan
        let plan = null;

        if (subscription?.planId) {
            plan = await this.planRepository.findById(subscription.planId);
        }

        return {
            account,
            user,
            subscription: subscription
                ? { ...subscription, plan }
                : null
        };
    }
}