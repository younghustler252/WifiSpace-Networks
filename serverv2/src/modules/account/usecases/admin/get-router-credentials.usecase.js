import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";

export class GetRouterCredentials {
	constructor({ accountRepository, routerRepository, auditService }) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const credentials = await this.accountRepository.findRouterCredentials(accountId);
		const router = account.routerId ? await this.routerRepository.findById(account.routerId?.id ?? account.routerId) : null;

		await this.auditService?.log({
			actorId, action: "ROUTER_PASSWORD_VIEWED", entity: "Account", entityId: account.id,
			newValue: { wsnId: account.wsnId }, ip
		});

		return {
			username: account.wsnId,
			password: credentials?.routerPassword ?? null,
			passwordSet: Boolean(credentials?.routerPassword),
			serviceType: account.serviceType,
			accessMethod: account.accessMethod ?? null,
			profile: credentials?.routerProfile ?? account.routerProfile ?? null,
			router: router ? { id: router.id, name: router.name, code: router.code } : null
		};
	}
}
