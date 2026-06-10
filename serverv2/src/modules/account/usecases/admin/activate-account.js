import { PROFILE_STATUSES } from "../../domain/account.enum.js";

export class ActivateAccount {
    constructor({accountRepository, routerRepository, mikrotikService, auditService}) {
        this.accountRepository = accountRepository;
        this.routerRepository = routerRepository;
        this.mikrotikService = mikrotikService;
        this.auditService = auditService;
    }

    async execute(accountId, context = {}) {
        // ----------------------------
        // Load the account (already mapped to entity)
        // ----------------------------
        const account = await this.accountRepository.findById(accountId);
        if (!account) throw new Error("Account not found");

        // ----------------------------
        // Only allow activation if pending or suspended
        // ----------------------------
        if (account.isActive()) {
            throw new Error("Account already active");
        }

        if (![PROFILE_STATUSES.PENDING, PROFILE_STATUSES.SUSPENDED].includes(account.profileStatus)) {
            throw new Error(`Cannot activate account with status ${account.profileStatus}`);
        }

        // ----------------------------
        // Provision on router if not yet created
        // ----------------------------
        if (!account.mikrotikUserCreated) {
            const router = await this.routerRepository.findById(account.routerId);
            if (!router) throw new Error("Assigned router not found");
            if (!router.apiEnabled || !router.isEnabled) {
                throw new Error("Router API is disabled");
            }

            try {
                await this.mikrotikService.createAccount(account, router);
                account.mikrotikUserCreated = true;
            } catch (err) {
                throw new Error(`Failed to provision account on router: ${err.message}`);
            }
        }

        // ----------------------------
        // Activate profile
        // ----------------------------
        account.activateProfile();

        // ----------------------------
        // Persist changes
        // ----------------------------
        await this.accountRepository.update(account.id, account);

        // ----------------------------
        // Audit log
        // ----------------------------
        if (this.auditService) {
            await this.auditService.log({
                actorId: context.actorId || "SYSTEM",
                action: "ACCOUNT_ACTIVATED",
                targetId: account.id,
                resource: "Account",
                metadata: {
                    wsnId: account.wsnId,
                    serviceType: account.serviceType,
                    routerId: account.routerId
                },
                ip: context.ip,
                userAgent: context.userAgent
            });
        }

        return account;
    }
}