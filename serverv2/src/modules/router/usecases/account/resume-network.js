// src/application/use-cases/ResumeNetworkAccount.js

import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ResumeNetworkAccount {
    constructor({
        accountRepository,
        routerRepository,
        mikrotikService,
        auditService
    }) {
        this.accountRepository = accountRepository;
        this.routerRepository = routerRepository;
        this.mikrotikService = mikrotikService;
        this.auditService = auditService;
    }

    async execute(accountId, context = {}) {

        // -----------------------------------
        // Fetch account
        // -----------------------------------
        const account = await this.accountRepository.findById(accountId);

        if (!account) {
            throw new ValidationError("Account not found");
        }

        // -----------------------------------
        // Fetch router
        // -----------------------------------
        if (!account.routerId) {
            throw new ValidationError("Account does not have an assigned router");
        }

        const router = await this.routerRepository.findById(account.routerId);

        if (!router) {
            throw new ValidationError("Assigned router not found");
        }

        if (!router.apiEnabled || !router.isEnabled) {
            throw new ValidationError("Router is currently unavailable");
        }

        try {

            // -----------------------------------
            // Check if user exists on router
            // -----------------------------------
            const userExists = await this.mikrotikService.checkUserExists(
                account,
                router
            );

            // -----------------------------------
            // Auto-create missing router account
            // -----------------------------------
            if (!userExists) {

                await this.mikrotikService.createAccount(
                    account,
                    router
                );

                if (this.auditService) {
                    await this.auditService.log({
                        actorId: context.actorId || "SYSTEM",
                        action: "ROUTER_ACCOUNT_AUTO_CREATED",
                        targetId: account.id,
                        resource: "Account",
                        metadata: {
                            wsnId: account.wsnId,
                            routerCode: router.code
                        }
                    });
                }
            }

            // -----------------------------------
            // Resume router account
            // -----------------------------------
            await this.mikrotikService.resumeAccount(
                account,
                router
            );

            // -----------------------------------
            // Update account state
            // -----------------------------------
            account.profileStatus = "active";

            account.routerProvision = {
                status: "synced",
                lastError: null,
                lastAttemptAt: new Date()
            };

            const updatedAccount = await this.accountRepository.update(
                account.id,
                account
            );

            // -----------------------------------
            // Audit log
            // -----------------------------------
            if (this.auditService) {
                await this.auditService.log({
                    actorId: context.actorId || "SYSTEM",
                    action: "NETWORK_ACCOUNT_RESUMED",
                    targetId: updatedAccount.id,
                    resource: "Account",
                    metadata: {
                        wsnId: updatedAccount.wsnId,
                        routerCode: router.code,
                        autoCreated: !userExists
                    }
                });
            }

            return {
                success: true,
                message: userExists
                    ? `Account ${updatedAccount.wsnId} resumed successfully`
                    : `Account ${updatedAccount.wsnId} recreated and resumed successfully`,
                data: updatedAccount
            };

        } catch (error) {

            // -----------------------------------
            // Update provisioning failure state
            // -----------------------------------
            account.routerProvision = {
                status: "failed",
                lastError: error.message,
                lastAttemptAt: new Date()
            };

            await this.accountRepository.update(
                account.id,
                account
            );

            throw new Error(
                `Network account resumption failed: ${error.message}`
            );
        }
    }
}