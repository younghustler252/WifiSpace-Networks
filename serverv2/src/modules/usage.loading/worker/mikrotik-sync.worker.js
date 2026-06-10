// modules/usage/workers/mikrotik-sync.worker.js
import { MikrotikService } from "../../mikrotik/services/mikrotik.service.js";
import { SyncSessionUseCase } from "../usecases/sync-session.usecase.js";
import { AggregateSummaryUseCase } from "../usecases/aggregate-summary.usecase.js";
import { UsageRepositoryMongo } from "../infrastructure/repositories/usage.repository.mongo.js";

export class MikrotikUsageSyncWorker {
	constructor() {
		this.mikrotikService = new MikrotikService();
		this.syncUseCase = new SyncSessionUseCase({ usageRepo: new UsageRepositoryMongo() });
		this.aggregateUseCase = new AggregateSummaryUseCase();
		this.usageRepo = new UsageRepositoryMongo();
	}

	async sync() {
		try {
			// 1️⃣ Fetch active sessions
			const sessions = await this.mikrotikService.fetchActiveSessions();

			// 2️⃣ Sync to Usage repository
			const usageEntities = await this.syncUseCase.execute(sessions);

			// 3️⃣ Mark ended sessions
			const activeSessionIds = sessions.map(s => s.sessionId);
			const ongoingUsages = await this.usageRepo.findByAccountId(null, { status: "active" });
			const endedSessions = ongoingUsages.filter(u => !activeSessionIds.includes(u.sessionId));
			for (const session of endedSessions) {
				await this.usageRepo.markSessionEnded(session.sessionId, new Date());
			}

			// 4️⃣ Aggregate Usage Summary
			await this.aggregateUseCase.execute(usageEntities, "daily");

		} catch (error) {
			console.error("MikrotikUsageSyncWorker Error:", error);
			// Retry logic can be implemented here
		}
	}

	/**
	 * Start worker periodically (interval in ms)
	 */
	start(intervalMs = 30000) {
		this.sync(); // immediate sync
		setInterval(() => this.sync(), intervalMs);
	}
}