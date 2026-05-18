import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CreateRouterAccount {
    constructor(accountRepository, routerRepository, mikrotikService, auditService) {
        this.accountRepository = accountRepository;
        this.routerRepository = routerRepository;
        this.mikrotikService = mikrotikService;
        this.auditService = auditService;
    }

    async execute(accountId, context = {}) {
        console.log(`[CreateRouterAccount] Start provisioning for accountId: ${accountId}`);

        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            console.error(`[CreateRouterAccount] Account not found: ${accountId}`);
            throw new ValidationError("Account not found");
        }
        console.log(`[CreateRouterAccount] Fetched account:`, account.toJSON());

        if (!account.routerId) {
            console.error(`[CreateRouterAccount] No routerId assigned to account: ${accountId}`);
            throw new ValidationError("This account does not have an assigned router ID");
        }
        if (!account.routerPassword) {
            console.error(`[CreateRouterAccount] No routerPassword for account: ${accountId}`);
            throw new ValidationError("Router password is required to provision this account");
        }

        const router = await this.routerRepository.findById(account.routerId);
        if (!router) {
            console.error(`[CreateRouterAccount] Router not found for routerId: ${account.routerId}`);
            throw new ValidationError("Assigned hardware router not found");
        }
        console.log(`[CreateRouterAccount] Fetched router:`, router);

        if (!router.apiEnabled || !router.isEnabled) {
            console.error(`[CreateRouterAccount] Router API disabled or router not enabled: ${router.id}`);
            throw new ValidationError("Target router API interface is currently disabled");
        }

        try {
            console.log(`[CreateRouterAccount] Sending account to MikrotikService...`);
            await this.mikrotikService.createAccount(account, router);
            console.log(`[CreateRouterAccount] MikrotikService call successful for account ${account.wsnId}`);

            account.mikrotikUserCreated = true;
            const updatedAccount = await this.accountRepository.update(account.id, account);
            console.log(`[CreateRouterAccount] Account updated with mikrotikUserCreated = true`);

            await this.routerRepository.incrementSessions(router.id);
            console.log(`[CreateRouterAccount] Incremented router session count for routerId: ${router.id}`);

            // if (this.auditService) {
            //     await this.auditService.log({
            //         actorId: context.actorId,
            //         ip: context.ip,
            //         userAgent: context.userAgent,
            //         action: "MIKROTIK_ACCOUNT_CREATION_SUCCESS",
            //         targetId: updatedAccount.id,
            //         resource: "Account",
            //         metadata: {
            //             wsnId: updatedAccount.wsnId,
            //             serviceType: updatedAccount.serviceType,
            //             routerCode: router.code
            //         }
            //     });
            //     console.log(`[CreateRouterAccount] Audit log written for account: ${updatedAccount.wsnId}`);
            // }

            return {
                success: true,
                code: "ACCOUNT_CREATED",
                message: `Account ${updatedAccount.wsnId} successfully created on the MikroTik router.`,
                data: updatedAccount
            };

        } catch (error) {
            console.error(`[CreateRouterAccount] Mikrotik provisioning failed:`, error.message);
            await this.routerRepository.updateStatus(router.id, "online", error.message);
            throw new Error(`Network hardware communication failure: ${error.message}`);
        }
    }
}