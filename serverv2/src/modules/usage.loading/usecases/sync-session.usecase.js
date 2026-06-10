// modules/usage/usecases/sync-session.usecase.js

import { UsageRepositoryMongo } from "../infrastructure/repositories/usage.repository.mongo.js";
import { Usage } from "../domain/usage.entity.js";

export class SyncSessionUseCase {

	constructor({ usageRepo = new UsageRepositoryMongo() } = {}) {
		this.usageRepo = usageRepo;
	}

	async execute(sessions) {

		if (!sessions?.length) return [];

		const usageEntities = [];

		for (const s of sessions) {

			let usage = await this.usageRepo.findBySessionId(s.sessionId);

			if (!usage) {

				usage = new Usage({
					accountId: s.accountId,
					subscriptionId: s.subscriptionId ?? null,
					routerId: s.routerId,
					username: s.username,
					sessionId: s.sessionId,
					type: s.type,
					ipAddress: s.ip,
					macAddress: s.mac,
					startedAt: s.startTime
				});

			}

			const { deltaIn, deltaOut } = usage.updateUsageFromRouter({
				bytesIn: s.rx,
				bytesOut: s.tx,
				sessionTime: s.uptime
			});

			await this.usageRepo.save({
				...usage,
				bytesIn: deltaIn,
				bytesOut: deltaOut
			});

			usageEntities.push(usage);

		}

		return usageEntities;

	}
}