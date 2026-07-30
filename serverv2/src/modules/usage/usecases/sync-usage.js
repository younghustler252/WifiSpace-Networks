import { UsageSnapshot } from "../domain/usage.entity.js";

export class SyncUsageUseCase {
	constructor({
		mikrotikManager,
		accountRepository,
		usageRepository
	}) {
		this.mikrotikManager = mikrotikManager;
		this.accountRepository = accountRepository;
		this.usageRepository = usageRepository;
	}


	async execute(
		router,
		serviceType = "pppoe",
		targetAccountId = null
	) {

		let accounts = [];
		let sessions = [];


		if (targetAccountId) {

			// SINGLE ACCOUNT SYNC
			const account =
				await this.accountRepository.findById(
					targetAccountId
				);


			if (!account) {
				return null;
			}


			accounts = [account];


			const session =
				await this.mikrotikManager.getActiveSession(
					router,
					serviceType,
					account.wsnId
				);


			if (session) {
				sessions = [session];
			}

		} else {

			// GLOBAL ROUTER SYNC
			sessions =
				await this.mikrotikManager.getActiveSessions(
					router,
					serviceType
				);


			if (!Array.isArray(sessions)) {
				return;
			}


			accounts =
				await this.accountRepository.findByRouterId(
					router._id
				);
		}



		const accountMap =
			new Map(
				accounts.map(acc => [
					acc.wsnId,
					acc
				])
			);


		const snapshots = [];


		for (const session of sessions) {

			const wsnId =
				session.name ||
				session.user;


			const account =
				accountMap.get(wsnId);


			if (!account) {
				continue;
			}


			snapshots.push(
				new UsageSnapshot({
					accountId: account.id,
					routerId: router._id,
					wsnId,

					online: true,

					ipAddress:
						session.address || null,

					macAddress:
						session["caller-id"] ||
						session["mac-address"] ||
						null,

					uptime:
						session.uptime || "0s",

					downloadBytes:
						Number(
							session["bytes-out"] || 0
						),

					uploadBytes:
						Number(
							session["bytes-in"] || 0
						),

					lastSeenAt:
						new Date()
				})
			);
		}



		if (snapshots.length) {
			await this.usageRepository.bulkUpsert(
				snapshots
			);
		}



		const onlineSet =
			new Set(
				snapshots.map(
					s => s.wsnId
				)
			);


		for (const account of accounts) {

			if (!onlineSet.has(account.wsnId)) {

				await this.usageRepository.markOffline(
					account.id
				);
			}
		}


		return snapshots[0] || null;
	}
}