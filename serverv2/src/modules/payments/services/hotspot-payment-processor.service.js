import { toSeconds } from "../../../shared/utils/formatUptime.js";

export class HotspotPaymentProcessorService {

    constructor({
        userRepository,
        planRepository,
        createAccount,
        createSubscription,
        accountRepository,
        routerRepository,
        paymentRepository,
        activateHotspotAccess
    }) {
        this.userRepository       = userRepository;
        this.planRepository       = planRepository;
        this.createAccount        = createAccount;
        this.createSubscription   = createSubscription;
        this.accountRepository    = accountRepository;
        this.routerRepository     = routerRepository;
        this.paymentRepository    = paymentRepository;
        this.activateHotspotAccess = activateHotspotAccess;
    }

    async process(payment) {

        if (!payment) throw new Error("Payment required");
        if (!payment.isSuccessful()) return payment;
        if (payment.businessProcessed) return payment;

        const { planId, id: paymentId, userId } = payment;
        const metadata = payment.metadata || {};

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------
        if (!metadata.macAddress) throw new Error("MAC address is required");
        if (!metadata.routerId)   throw new Error("RouterId missing");

        // ---------------------------------------------
        // LOAD DATA
        // ---------------------------------------------
        const user = await this.userRepository.findById(userId);
        if (!user) throw new Error("User not found");

        const plan = await this.planRepository.findById(planId);
        if (!plan) throw new Error("Plan not found");

        const router = await this.routerRepository.findById(metadata.routerId);
        if (!router) throw new Error("Router not found");

        const limitUptime = toSeconds(plan.durationValue, plan.durationUnit);

        // ---------------------------------------------
        // ACCOUNT — reuse if exists, create if not
        // ---------------------------------------------
        let account = null;

        // 1. Try payment.accountId (set during purchase if account existed)
        if (payment.accountId) {
            account = await this.accountRepository.findById(payment.accountId);
        }

        // 2. Try metadata fallback
        if (!account && metadata.existingAccountId) {
            account = await this.accountRepository.findById(
                metadata.existingAccountId
            );
        }

        // 3. Last resort — find by userId + serviceType
        if (!account) {
            account = await this.accountRepository.findOne({
                userId:      user.id,
                serviceType: "hotspot"
            });
        }

        // 3. Last resort — find by userId + serviceType
if (!account) {
    account = await this.accountRepository.findOne({
        userId:      user.id,
        serviceType: "hotspot"
    });
}

console.log("Account found:", account?.id || "none");
console.log("Plan mikrotikProfile:", plan.mikrotikProfile);
console.log("limitUptime:", limitUptime);
console.log("user.id:", user.id);
console.log("router.id:", router.id);

if (account) {
    console.log("Reusing existing account:", account.id);
    console.log("Account serviceType:", account.serviceType);
    account.routerProfile = plan.mikrotikProfile;
    account.limitUptime   = limitUptime;
    await this.accountRepository.update(account.id, account);

} else {
    console.log("Creating new account with:", {
        userId:         user.id,
        accountType:    "personal",
        serviceType:    "hotspot",
        routerId:       router.id,
        routerPassword: metadata.phone,
        routerProfile:  plan.mikrotikProfile,
        limitUptime
    });

    const result = await this.createAccount.execute(
        {
            userId:         user.id,
            accountType:    "personal",
            serviceType:    "hotspot",
            routerId:       router.id,
            routerPassword: metadata.phone,
            routerProfile:  plan.mikrotikProfile,
            limitUptime
        },
        { id: user.id }
    );

    account = result.account;
    console.log("New account created:", account, "serviceType:", account.serviceType);
}

        // Always keep payment.accountId in sync
        payment.accountId = account.id;
        await this.paymentRepository.update(payment);

        // ---------------------------------------------
        // SUBSCRIPTION
        // ---------------------------------------------
        const subscription = await this.createSubscription.execute({
            accountId: account.id,
            userId:    user.id,
            planId,
            paymentId,
            cycles:    1
        });

        // ---------------------------------------------
        // HOTSPOT ACTIVATION
        // ---------------------------------------------
        const activation = await this.activateHotspotAccess.execute({
            accountId:  account.id,
            macAddress: metadata.macAddress,
            ipAddress:  metadata.ipAddress,
            hostname:   metadata.hostname,
            routerId:   router.id
        });

        // ---------------------------------------------
        // FINALIZE
        // ---------------------------------------------
        payment.businessProcessed = true;
        await this.paymentRepository.update(payment);

        return {
            user,
            account,
            subscription,
            router,
            autoConnected: activation?.autoConnected ?? false  // ← real value
        };
    }
}