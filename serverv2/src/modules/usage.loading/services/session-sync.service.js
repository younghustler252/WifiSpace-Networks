import { MikrotikService } from "../../modules/mikrotik/services/mikrotik.service.js";
import { UsageRepositoryMongo } from "../../modules/usage/infrastructure/repositories/usage.repository.mongo.js";
import { Usage } from "../../modules/usage/domain/usage.entity.js";
import { SubscriptionRepositoryMongo } from "../../modules/subscription/infrastructure/repositories/subscription.repository.mongo.js";

export class SessionSyncService {
	constructor({
		mikrotikService = new MikrotikService(),
		usageRepo = new UsageRepositoryMongo(),
		subscriptionRepo = new SubscriptionRepositoryMongo()
	} = {}) {
		this.mikrotikService = mikrotikService;
		this.usageRepo = usageRepo;
		this.subscriptionRepo = subscriptionRepo;
	}

	async sync() {
		// 1️⃣ Fetch all active sessions from MikroTik
		const sessions = await this.mikrotikService.fetchActiveSessions();

		// 2️⃣ Track active sessionIds for ending inactive sessions
		const activeSessionIds = sessions.map(s => s.sessionId);

		await this._endInactiveSessions(activeSessionIds);

		// 3️⃣ Upsert usage per session
		for (const s of sessions) {
			// Link PPPoE sessions to subscription
			let subscriptionId = null;
			if (s.serviceType === "pppoe" && s.accountId) {
				const activeSub = await this.subscriptionRepo.findActiveByAccount(s.accountId);
				if (activeSub) subscriptionId = activeSub.id;
			}

			const usage = new Usage({
				accountId: s.accountId,
				subscriptionId,
				sessionId: s.sessionId,
				ipAddress: s.ipAddress,
				macAddress: s.macAddress,
				bytesIn: s.bytesIn,
				bytesOut: s.bytesOut,
				sessionTime: s.uptime,
				startedAt: s.startedAt
			});

			await this.usageRepo.upsert(usage);
		}

		console.log(`✅ Synced ${sessions.length} active sessions`);
	}

	async _endInactiveSessions(activeSessionIds) {
		const dbActiveSessions = await this.usageRepo.findActiveSessions();

		for (const session of dbActiveSessions) {
			if (!activeSessionIds.includes(session.sessionId)) {
				await this.usageRepo.markSessionEnded(session.sessionId, new Date());
				console.log(`🛑 Ended session ${session.sessionId}`);
			}
		}
	}

	// ----------------------------
	// Optional: fetch total usage per subscription
	// ----------------------------
	async getSubscriptionUsage(subscriptionId) {
		const usages = await this.usageRepo.getSubscriptionUsage(subscriptionId);

		return usages.reduce(
			(acc, u) => {
				acc.bytesIn += u.bytesIn;
				acc.bytesOut += u.bytesOut;
				acc.sessionTime += u.sessionTime;
				return acc;
			},
			{ bytesIn: 0, bytesOut: 0, sessionTime: 0 }
		);
	}
}