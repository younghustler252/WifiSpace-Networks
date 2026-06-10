// ChangeAccountPassword.js

export class ChangeAccountPassword {
    constructor({
        accountRepository,
        routerRepository,
        mikrotikService
    }) {
        this.accountRepository = accountRepository;
        this.routerRepository = routerRepository;
        this.mikrotikService = mikrotikService;
    }

    async execute(accountId, password) {
        const account =
            await this.accountRepository.findById(accountId);

        if (!account) {
            throw new Error("Account not found");
        }

        const router =
            await this.routerRepository.findById(
                account.routerId
            );

        if (!router) {
            throw new Error("Router not found");
        }

        await this.mikrotikService.changePassword(
            account,
            router,
            password
        );

        account.routerPassword = password;

        await this.accountRepository.update(
            account.id,
            account
        );

        return {
            success: true,
            message: "Password changed successfully"
        };
    }
}