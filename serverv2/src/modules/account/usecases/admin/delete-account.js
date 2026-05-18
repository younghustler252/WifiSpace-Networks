export class DeleteAccount {
    constructor(accountRepository, routerRepository, mikrotikService, auditService) {
        this.accountRepository = accountRepository;
        this.routerRepository = routerRepository;
        this.mikrotikService = mikrotikService;
        this.auditService = auditService;
    }

    async execute(accountId, context = {}) {
        // ----------------------------
        // Fetch account from DB
        // ----------------------------
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new Error("Account not found");
        }

        // ----------------------------
        // Remove from hardware router if provisioned
        // ----------------------------
        if (account.mikrotikUserCreated && account.routerId) {
            const router = await this.routerRepository.findById(account.routerId);
            if (!router) {
                console.warn(`Router with ID ${account.routerId} not found; skipping hardware deletion`);
            } else {
                try {
                    await this.mikrotikService.removeAccount(account, router);
                } catch (err) {
                    console.error("Failed to remove account from router:", err.message);
                    // optionally: throw error to prevent DB deletion
                    // throw new Error(`Router deletion failed: ${err.message}`);
                }
            }
        }

        // ----------------------------
        // Delete account from DB
        // ----------------------------
        await this.accountRepository.delete(accountId);

        // ----------------------------
        // Audit log
        // ----------------------------
        if (this.auditService) {
            await this.auditService.log({
                actorId: context.actorId || "SYSTEM",
                action: "ACCOUNT_DELETED",
                targetId: accountId,
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

        return {
            success: true,
            message: `Account ${account.wsnId} deleted successfully`
        };
    }
}