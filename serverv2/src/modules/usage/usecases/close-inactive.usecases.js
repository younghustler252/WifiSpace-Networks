// modules/usage/usecases/close-inactive-sessions.usecase.js

import { UsageRepositoryMongo } from "../infrastructure/repositories/usage.repository.mongo.js";

export class CloseInactiveSessionsUseCase {

	constructor({ usageRepo = new UsageRepositoryMongo() } = {}) {
		this.usageRepo = usageRepo;
	}

	/**
	 * Close sessions not present in router anymore
	 * @param {Array<string>} activeSessionIdsFromRouter - array of sessionIds currently active on router
	 * @param {Date} endedAt - optional end time for sessions
	 * @returns {Promise<Usage[]>} - ended session entities
	 */
	async execute(activeSessionIdsFromRouter = [], endedAt = new Date()) {

		// 1️⃣ Fetch all DB sessions that are still active
		const activeDbSessions = await this.usageRepo.findByAccountId(null, { status: "active" });

		// 2️⃣ Filter sessions that are no longer in router
		const endedSessions = activeDbSessions.filter(session => 
			!activeSessionIdsFromRouter.includes(session.sessionId)
		);

		if (!endedSessions.length) return [];

		// 3️⃣ Mark ended sessions in bulk
		const updates = endedSessions.map(session => 
			this.usageRepo.markSessionEnded(session.sessionId, endedAt)
		);

		// 4️⃣ Wait for all to complete
		return Promise.all(updates);
	}
}