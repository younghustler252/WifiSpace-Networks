// src/application/use-cases/SuspendNetworkAccount.js
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class SuspendNetworkAccount {
    constructor(accountRepository, routerRepository, mikrotikService, auditService) {
        this.accountRepository = accountRepository;
        this.routerRepository = routerRepository;
        this.mikrotikService = mikrotikService;
        this.auditService = auditService;
    }

    async execute(accountId, reason = "Subscription Expired", context = {}) {
        // 1. Fetch and validate the network account profile
        const account = await this.accountRepository.findById(accountId);
        if (!account) throw new ValidationError("Network account not found");

        // If it's already suspended, no need to waste router API cycles
        if (account.profileStatus === "suspended") {
            return { success: true, message: "Account is already marked as suspended" };
        }

        // 2. Fetch the target hardware router configuration
        if (!account.routerId) throw new ValidationError("Account does not have an assigned router");
        const router = await this.routerRepository.findById(account.routerId);
        if (!router) throw new ValidationError("Assigned hardware router could not be found");
        
        if (!router.apiEnabled || !router.isEnabled) {
            throw new ValidationError("Target router API interface is currently offline or disabled");
        }

        try {
            // 3. Disable the user configuration on the MikroTik router
            await this.mikrotikService.suspendAccount(account, router);

            // 4. Force-disconnect the user's active session to kick them offline instantly
            await this.mikrotikService.disconnectAccount(account, router);

            // 5. Update state tracking flags inside your database
            account.profileStatus = "suspended";
            account.suspensionReason = reason;
            await this.accountRepository.update(account.id, account);

            // 6. Decrement the router's active session counter safely
            await this.routerRepository.decrementSessions(router.id);

            // 7. Log to the internal system audit trail
            await this.auditService.log({
                actorId: context.actorId || "SYSTEM_BILLING_ENGINE",
                action: "MIKROTIK_SUSPENSION_SUCCESS",
                targetId: account.id,
                resource: "Account",
                metadata: { 
                    wsnId: account.wsnId, 
                    routerCode: router.code,
                    reason 
                }
            });

            return { 
                success: true, 
                message: `Account ${account.wsnId} successfully suspended on network layer.` 
            };

        } catch (error) {
            // Update live operational error metrics on your updated router schema
            await this.routerRepository.updateStatus(router.id, "online", error.message);
            
            throw new Error(`Network suspension execution failure: ${error.message}`);
        }
    }
}