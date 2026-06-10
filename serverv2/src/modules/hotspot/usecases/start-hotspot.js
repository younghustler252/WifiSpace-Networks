export class StartHotspotPurchase {
    constructor({
        registerHotspotUser,
        createPayment,
        routerRepository // 👈 ADD THIS
    }) {
        this.registerHotspotUser = registerHotspotUser;
        this.createPayment = createPayment;
        this.routerRepository = routerRepository;
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
          
        console.log("ipAddress from body:", ipAddress);
        // 1. Create / fetch user
        const user = await this.registerHotspotUser.execute({
            firstName,
            email,
            phone
        });

        // 2. Resolve router (IMPORTANT FIX)
        const router = await this.routerRepository.findRouterForHotspot({
            routerId,
            routerUid,
            identity
        });

        if (!router) {
            throw new Error("No available hotspot router found");
        }

        // if (!router.isHotspotRouter?.()) {
        //     throw new Error("Selected router does not support hotspot service");
        // }

        // 3. Create payment with clean router context
        const payment = await this.createPayment.execute({
            userId: user.id,
            planId,
            email,

            metadata: {
                firstName,
                phone,

                routerId: router.id,
                routerUid: router.routerUid,
                identity,

                macAddress,

                serviceType: "hotspot",

                routerCode: router.code,
                routerStatus: router.status,

                userAgent,
                ipAddress
            }
        });
        console.log("Payment created with metadata:", payment.metadata);
        return {
            user,
            payment,
            router // optional but useful for debugging
        };
    }
}