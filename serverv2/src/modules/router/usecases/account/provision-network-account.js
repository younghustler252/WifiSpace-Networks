// src/application/use-cases/ProvisionNetworkAccount.js
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ProvisionNetworkAccount {
    constructor({
        accountRepository,
        routerRepository,
        subscriptionRepository,
        mikrotikService,
        auditService
    }) {
        this.accountRepository = accountRepository;
        this.routerRepository = routerRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.mikrotikService = mikrotikService;
        this.auditService = auditService;
    }

    async execute(subscriptionId, context = {}) {

        // 1. Fetch subscription
        const subscription = await this.subscriptionRepository.findById(subscriptionId);
        if (!subscription) throw new ValidationError("Subscription not found");

        if (subscription.status !== "active") {
            throw new ValidationError("Subscription must be active to provision network account");
        }

        // 2. Fetch account
        const account = await this.accountRepository.findById(subscription.accountId);
        if (!account) throw new ValidationError("Account not found");

        if (account.profileStatus !== "active") {
            throw new ValidationError("Account must be active for provisioning");
        }

        // 3. Fetch router
        if (!account.routerId) {
            throw new ValidationError("Account has no assigned router");
        }

        const router = await this.routerRepository.findById(account.routerId);
        if (!router) throw new ValidationError("Router not found");

        if (!router.apiEnabled || !router.isEnabled) {
            throw new ValidationError("Router is not available for provisioning");
        }

        // 4. Apply subscription plan to account
        account.routerProfile = subscription.planSnapshot.mikrotikProfile;
        account.limitUptime =
            `${subscription.planSnapshot.durationValue}${subscription.planSnapshot.durationUnit[0]}`;

        account.routerProvision = account.routerProvision || {
            status: "pending",
            lastError: null,
            lastAttemptAt: null
        };

        try {

            // 5. Check existence on MikroTik (NO outdated flags)
            const userExists = await this.mikrotikService.checkUserExists(account, router);

            if (userExists) {
                await this.mikrotikService.updateAccount(account, router);
            } else {
                await this.mikrotikService.createAccount(account, router);
            }

            // 6. Update account provisioning state
            account.routerProvision.status = "synced";
            account.routerProvision.lastError = null;
            account.routerProvision.lastAttemptAt = new Date();

            const updatedAccount = await this.accountRepository.update(account.id, account);

            // 7. Update router usage
            await this.routerRepository.incrementSessions(router.id);

            // 8. Update subscription sync state
            subscription.mikrotikStatus = "synced";
            subscription.mikrotikLastSyncAt = new Date();

            await this.subscriptionRepository.update(subscription.id, subscription);

            // 9. Audit log (optional safe guard)
            if (this.auditService) {
                await this.auditService.log({
                    actorId: context.actorId || "SYSTEM_PROVISIONER",
                    action: "NETWORK_PROVISIONED",
                    targetId: updatedAccount.id,
                    resource: "Account",
                    metadata: {
                        subscriptionId: subscription.id,
                        routerCode: router.code,
                        wsnId: updatedAccount.wsnId,
                        userExists
                    }
                });
            }

            return {
                success: true,
                message: userExists
                    ? "Account synced with router successfully"
                    : "Account provisioned successfully on router",
                data: updatedAccount
            };

        } catch (error) {

            // 10. Fail-safe account state update
            account.routerProvision.status = "failed";
            account.routerProvision.lastError = error.message;
            account.routerProvision.lastAttemptAt = new Date();

            await this.accountRepository.update(account.id, account);

            // subscription failure tracking
            subscription.mikrotikStatus = "failed";
            subscription.mikrotikLastSyncAt = new Date();

            await this.subscriptionRepository.update(subscription.id, subscription);

            throw new Error(`Network provisioning failed: ${error.message}`);
        }
    }
}