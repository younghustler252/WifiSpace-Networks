// src/application/use-cases/SuspendNetworkAccount.js
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class SuspendNetworkAccount {
    constructor({ accountRepository, routerRepository, mikrotikService, auditService }) {
        this.accountRepository = accountRepository;
        this.routerRepository = routerRepository;
        this.mikrotikService = mikrotikService;
        this.auditService = auditService;
    }

    async execute(accountId, reason = "Subscription Expired", context = {}) {

        // 1. Fetch account
        const account = await this.accountRepository.findById(accountId);
        if (!account) throw new ValidationError("Network account not found");

        // 2. Idempotency check
        if (account.profileStatus === "suspended") {
            return { success: true, message: "Account already suspended" };
        }

        // 3. Fetch router
        if (!account.routerId) {
            throw new ValidationError("Account does not have an assigned router");
        }

        const router = await this.routerRepository.findById(account.routerId);
        if (!router) throw new ValidationError("Router not found");

        if (!router.apiEnabled || !router.isEnabled) {
            throw new ValidationError("Router is currently unavailable for provisioning");
        }

        try {
            // 4. Suspend user on MikroTik
            await this.mikrotikService.suspendAccount(account, router);

            // 5. Force disconnect active session (if supported)
            try {
                await this.mikrotikService.disconnectAccount(account, router);
            } catch (_) {
                // optional: ignore if router does not support force disconnect
            }

            // 6. Update account state
            account.profileStatus = "suspended";
            account.suspensionReason = reason;

            account.routerProvision = account.routerProvision || {};
            account.routerProvision.status = "synced";
            account.routerProvision.lastAttemptAt = new Date();
            account.routerProvision.lastError = null;

            const updatedAccount = await this.accountRepository.update(account.id, account);

            // 7. Session count adjustment (safe fallback)
            if (router.currentSessions > 0) {
                await this.routerRepository.decrementSessions(router.id);
            }

            // 8. Audit log
            if (this.auditService) {
                await this.auditService.log({
                    actorId: context.actorId || "SYSTEM_BILLING_ENGINE",
                    action: "NETWORK_ACCOUNT_SUSPENDED",
                    targetId: updatedAccount.id,
                    resource: "Account",
                    metadata: {
                        wsnId: updatedAccount.wsnId,
                        routerCode: router.code,
                        reason
                    }
                });
            }

            return {
                success: true,
                message: `Account ${updatedAccount.wsnId} successfully suspended`,
                data: updatedAccount
            };

        } catch (error) {
            // 9. Failure state tracking
            account.routerProvision = account.routerProvision || {};
            account.routerProvision.status = "failed";
            account.routerProvision.lastError = error.message;
            account.routerProvision.lastAttemptAt = new Date();

            await this.accountRepository.update(account.id, account);

            throw new Error(`Network suspension failed: ${error.message}`);
        }
    }
}