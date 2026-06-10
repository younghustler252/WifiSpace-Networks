// src/application/hotspot/GetHotspotSessionByMac.js

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

    async execute({ macAddress }) {

        if (!macAddress) {
            throw new Error("MAC address is required");
        }

        // 1. Find account that has this MAC in its devices array
        const account = await this.accountRepository.findByMac(macAddress);

        if (!account) {
            return null; // new user — no account yet
        }

        // 2. Get the user
        const user = await this.userRepository.findById(account.userId);

        if (!user) {
            return null;
        }

        // 3. Get active subscription if any
        const subscription = await this.subscriptionRepository
            .findActiveByAccount(account.id);

        // 4. Enrich with plan details if subscription exists
        let plan = null;

        if (subscription?.planId) {
            plan = await this.planRepository.findById(subscription.planId);
        }

        return {
            account,
            user,
            subscription: subscription
                ? {
                    ...subscription,
                    plan
                }
                : null
        };
    }
}