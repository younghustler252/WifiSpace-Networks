// router/usecases/admin/list-router-hotspot-users.usecase.js
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../domain/router.enum.js";

export class ListRouterHotspotUsers {
	constructor({ routerRepository, hotspotService, accountRepository }) {
		this.routerRepository = routerRepository;
		this.hotspotService = hotspotService;
		this.accountRepository = accountRepository;
	}

	async execute({ routerId }) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new NotFoundError("Router not found", ROUTER_ERROR_CODES.ROUTER_NOT_FOUND);

		const [users, hosts] = await Promise.all([
			this.hotspotService.getAllUsers(router),
			this.hotspotService.getAllHosts(router)
		]);

		const hostByUser = new Map();
		for (const host of hosts) {
			if (host.user) hostByUser.set(host.user, host);
		}

		const results = [];
		for (const user of users) {
			const wsnId = user.name;
			const host = hostByUser.get(wsnId);
			const account = await this.accountRepository.findOne({ wsnId });

			results.push({
				wsnId,
				profile: user.profile,
				disabled: user.disabled === "true",
				macAddress: host?.["mac-address"] ?? null,
				ipAddress: host?.address ?? null,
				matchedAccountId: account?.id ?? null,
				accountMacAddress: account?.macAddress ?? null,
				needsLink: Boolean(account && host && account.macAddress !== host["mac-address"])
			});
		}

		return results;
	}
}