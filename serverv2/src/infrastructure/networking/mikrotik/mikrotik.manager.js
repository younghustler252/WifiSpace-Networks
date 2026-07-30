export class MikrotikManager {
	constructor({
		accountRepository,
		routerRepository,
		hotspotService,
		pppoeService
	}) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.hotspotService = hotspotService;
		this.pppoeService = pppoeService;
	}


	async provision({
		subscription,
		metadata = {}
	}) {
		const {
			account,
			router
		} = await this.loadContext(subscription);

		const service =
			this.getService(subscription);


		const exists =
			await service.userExists(
				router,
				account.wsnId
			);


		if (!exists) {
			await service.createUser(
				router,
				account
			);
		} else {
			await service.updateUser(
				router,
				account
			);

			await service.resumeUser(
				router,
				account.wsnId
			);
		}


		return service.provisionAccess(
			router,
			{
				username: account.wsnId,
				password: account.routerPassword,
				macAddress: metadata.macAddress,
				ipAddress: metadata.ipAddress
			}
		);
	}
	async suspend(subscription) {
		const {
			account,
			router
		} = await this.loadContext(subscription);

		const service =
			this.getService(subscription);


		await service.suspendUser(
			router,
			account.wsnId
		);


		await service.disconnectUser(
			router,
			account.wsnId
		);


		return {
			success: true
		};
	}


	async resume(subscription) {
		const {
			account,
			router
		} = await this.loadContext(subscription);


		const service =
			this.getService(subscription);


		await service.resumeUser(
			router,
			account.wsnId
		);


		return service.provisionAccess(
			router,
			{
				username: account.wsnId,
				password: account.routerPassword,
				macAddress: account.macAddress,
				ipAddress: account.ipAddress
			}
		);
	}


	async disconnect(subscription) {
		const {
			account,
			router
		} = await this.loadContext(subscription);


		return this.getService(subscription)
			.disconnectUser(
				router,
				account.wsnId
			);
	}


	async remove(subscription) {
		const {
			account,
			router
		} = await this.loadContext(subscription);


		const service =
			this.getService(subscription);


		if (!service.removeUser) {
			return {
				success: true
			};
		}


		return service.removeUser(
			router,
			account.wsnId
		);
	}


	async changePassword(subscription, password) {

		const {
			account,
			router
		} = await this.loadContext(subscription);


		return this.getService(subscription)
			.changePassword(
				router,
				account.wsnId,
				password
			);
	}

	async getProfiles(router, serviceType) {
		const service =
			this.getService({
				planSnapshot: {
					serviceType
				}
			});

		return service.getProfiles(router);
	}

	async getActiveSession(router, serviceType, username) {
		const service =
			this.getService({
				planSnapshot: {
					serviceType
				}
			});

		return service.getActiveSession(
			router,
			username
		);
	}


	async getActiveSessions(router, serviceType) {
		const service =
			this.getService({
				planSnapshot: {
					serviceType
				}
			});

		return service.getActiveSessions(
			router
		);
	}

	async loadContext(subscription) {

		const account =
			await this.accountRepository.findById(
				subscription.accountId
			);


		if (!account) {
			throw new Error(
				"Account not found"
			);
		}


		if (!account.routerId) {
			throw new Error(
				"Account has no router assigned"
			);
		}


		const router =
			await this.routerRepository.findById(
				account.routerId
			);


		if (!router) {
			throw new Error(
				"Router not found"
			);
		}


		return {
			account,
			router
		};
	}


	getService(subscription) {

		const type =
			subscription.planSnapshot?.serviceType;


		switch (type) {

			case "hotspot":
				return this.hotspotService;


			case "pppoe":
				return this.pppoeService;


			default:
				throw new Error(
					`Unsupported service type: ${type}`
				);
		}
	}
}