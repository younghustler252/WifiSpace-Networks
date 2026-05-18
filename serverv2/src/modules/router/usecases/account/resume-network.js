// src/application/use-cases/ResumeNetworkAccount.js
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ResumeNetworkAccount {
    constructor(accountRepository, routerRepository, mikrotikService, auditService) {
        this.accountRepository = accountRepository;
        this.routerRepository = routerRepository;
        this.mikrotikService = mikrotikService;
        this.auditService = auditService;
    }

    async execute(accountId, context = {}) {
        // 1. Fetch and validate the network account profile
        const account = await this.accountRepository.findById(accountId);
        if (!account) throw new ValidationError("Network account not found");

        // If it's already active, save router API cycles
        if (account.profileStatus === "active") {
            return { success: true, message: "Account is already active" };
        }

        // 2. Fetch the target hardware router configuration
        if (!account.routerId) throw new ValidationError("Account does not have an assigned router");
        const router = await this.routerRepository.findById(account.routerId);
        if (!router) throw new ValidationError("Assigned hardware router could not be found");
        
        if (!router.apiEnabled || !router.isEnabled) {
            throw new ValidationError("Target router API interface is currently offline or disabled");
        }

        try {
            // 3. Re-enable the user configuration on the MikroTik router
            await this.mikrotikService.resumeAccount(account, router);

            // 4. Update state tracking flags inside your database
            account.profileStatus = "active";
            account.suspensionReason = null; // Clear out the previous suspension reason
            await this.accountRepository.update(account.id, account);

            // Note: We don't manually increment router sessions here. 
            // The counter will increment naturally once their hardware physically logs back in 
            // and your live accounting/polling script detects the active session.

            // 5. Log to the internal system audit trail
            await this.auditService.log({
                actorId: context.actorId || "SYSTEM_BILLING_ENGINE",
                action: "MIKROTIK_RESUMPTION_SUCCESS",
                targetId: account.id,
                resource: "Account",
                metadata: { 
                    wsnId: account.wsnId, 
                    routerCode: router.code
                }
            });

            return { 
                success: true, 
                message: `Account ${account.wsnId} successfully restored on network layer.` 
            };

        } catch (error) {
            // Update live operational error metrics on your router schema
            await this.routerRepository.updateStatus(router.id, "online", error.message);
            
            throw new Error(`Network resumption execution failure: ${error.message}`);
        }
    }
}