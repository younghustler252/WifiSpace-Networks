export class StartHotspotPurchase {
    constructor({
        registerHotspotUser,
        createPayment,
        routerRepository,
        accountRepository   // ← add this
    }) {
        this.registerHotspotUser = registerHotspotUser;
        this.createPayment       = createPayment;
        this.routerRepository    = routerRepository;
        this.accountRepository   = accountRepository;
    }

    async execute({
        firstName,
        email,
        phone,
        planId,
        routerId,
        routerUid,
        identity,
        macAddress,
        ipAddress,
        userAgent
    }) {

        // 1. Register or fetch existing user
        const user = await this.registerHotspotUser.execute({
            firstName,
            email,
            phone
        });

        // 2. Resolve router
        const router = await this.routerRepository.findRouterForHotspot({
            routerId,
            routerUid,
            identity
        });

        if (!router) {
            throw new Error("No available hotspot router found");
        }

        // 3. Check if user already has a hotspot account
        const existingAccount = await this.accountRepository.findOne({
            userId:      user.id,
            serviceType: "hotspot"
        });

        // 4. Create payment — pass existingAccountId so processor
        //    skips account creation and reuses the existing one
        const payment = await this.createPayment.execute({
            userId:    user.id,
            accountId: existingAccount?.id || null,  // ← key addition
            planId,
            email,

            metadata: {
                firstName,
                phone,

                routerId:     router.id,
                routerUid:    router.routerUid,
                identity,

                macAddress,
                ipAddress,

                serviceType:  "hotspot",

                routerCode:   router.code,
                routerStatus: router.status,

                userAgent,

                // Pass existing account id in metadata as backup
                existingAccountId: existingAccount?.id || null
            }
        });

        return {
            user,
            payment,
            router
        };
    }
}