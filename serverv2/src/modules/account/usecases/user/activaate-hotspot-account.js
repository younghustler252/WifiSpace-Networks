import { Account } from "../../domain/account.entity.js";
import { PROFILE_STATUSES, SERVICE_TYPES } from "../../domain/account.enum.js";

export class ActivateHotspotAccount {
    constructor({accountRepository, auditService}) {
        this.accountRepository = accountRepository;
        this.auditService = auditService;
    }

    async execute(user, data, context = {}) {
        // 1. Create Entity with Hotspot-specific defaults
        const account = new Account({
            ...data,
            userId: user.id,
            serviceType: SERVICE_TYPES.HOTSPOT,
            wsnId: `HS_${user.phone}`, 
            profileStatus: PROFILE_STATUSES.ACTIVE, 
            mikrotikUserCreated: false // Will be set to true by MikroTik Service
        });

        // 2. Persist 
        const createdAccount = await this.accountRepository.create(account);

        // 3. Audit
        await this.auditService.log({
            actorId: user.id,
            action: "HOTSPOT_ACCOUNT_ACTIVATED",
            targetId: createdAccount.id,
            resource: "Account",
            metadata: {
                wsnId: createdAccount.wsnId,
                serviceType: "hotspot"
            },
            ip: context.ip
        });

        return createdAccount;
    }
}