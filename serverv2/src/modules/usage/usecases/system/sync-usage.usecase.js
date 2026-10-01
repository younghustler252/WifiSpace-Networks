import { parseUptime } from "../../../../shared/utils/parse-uptime.js";
import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";

export class SyncUsage {
	constructor({ subscriptionRepository, accountRepository, routerRepository, routerProvisioningRepository, mikrotikManager, usageSyncCursorRepository, recordUsage }) {
		this.subscriptionRepository = subscriptionRepository;
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.routerProvisioningRepository = routerProvisioningRepository;
		this.mikrotikManager = mikrotikManager;
		this.usageSyncCursorRepository = usageSyncCursorRepository;
		this.recordUsage = recordUsage;
	}

	async execute() {
		const activeSubscriptions = await this.subscriptionRepository.findAllActive();

		let synced = 0;
		let failed = 0;
		let skipped = 0;

		for (const subscription of activeSubscriptions) {
			try {
				const account = await this.accountRepository.findById(subscription.accountId);
				if (!account) { skipped++; continue; }

				const routers = await this._resolveRouters(account);

				for (const router of routers) {
					if (!router.isOnline()) continue; // don't waste retries hitting an offline router every tick

					const session = await this.mikrotikManager.getActiveSession(router, account.serviceType, account.wsnId);
					if (!session) continue; // account has no live session on this router right now — nothing to record

					await this._syncOne({ subscription, account, router, session });
					synced++;
				}
			} catch (err) {
				console.error(`[SyncUsage] Failed for subscription ${subscription.id}:`, err.message);
				failed++;
			}
		}

		return { checked: activeSubscriptions.length, synced, failed, skipped };
	}

	async _resolveRouters(account) {
		if (account.serviceType === SERVICE_TYPES.PPPOE) {
			if (!account.routerId) return [];
			const router = await this.routerRepository.findById(account.routerId);
			return router ? [router] : [];
		}

		// Hotspot: an account may be live on more than one router at once
		// (different devices at different street locations) — RouterProvisioning
		// is exactly the record of which routers to check.
		const provisionings = await this.routerProvisioningRepository.findByAccount(account.id, { status: "synced" });
		const routers = await Promise.all(provisionings.map((p) => this.routerRepository.findById(p.routerId)));
		return routers.filter(Boolean);
	}

	async _syncOne({ subscription, account, router, session }) {
		// RouterOS session field names — confirmed against typical
		// /ip/hotspot/active/print and /ppp/active/print output; verify
		// against your actual node-routeros response shape before relying
		// on this in production.
		const currentBytes = Number(session["bytes-in"] || 0) + Number(session["bytes-out"] || 0);
		const currentSeconds = parseUptime(session.uptime);

		const cursor = await this.usageSyncCursorRepository.find({ routerId: router.id, username: account.wsnId });

		let deltaBytes;
		let deltaSeconds;

		if (!cursor) {
			// First time seeing this session — record its full current value as
			// the delta rather than 0, so usage isn't silently lost for however
			// long the session was already running before the job first saw it.
			deltaBytes = currentBytes;
			deltaSeconds = currentSeconds;
		} else if (currentBytes < cursor.lastBytes || currentSeconds < cursor.lastSeconds) {
			// Counter went backwards — the session reconnected and RouterOS reset
			// its counters to zero. Treat the current value as a fresh delta.
			deltaBytes = currentBytes;
			deltaSeconds = currentSeconds;
		} else {
			deltaBytes = currentBytes - cursor.lastBytes;
			deltaSeconds = currentSeconds - cursor.lastSeconds;
		}

		await this.usageSyncCursorRepository.upsert({
			subscriptionId: subscription.id, accountId: account.id, routerId: router.id, username: account.wsnId,
			lastBytes: currentBytes, lastSeconds: currentSeconds
		});

		if (deltaBytes > 0 || deltaSeconds > 0) {
			await this.recordUsage.execute({
				subscriptionId: subscription.id, accountId: account.id, routerId: router.id,
				macAddress: session["mac-address"] || null,
				bytesUsed: deltaBytes, secondsUsed: deltaSeconds
			});
		}
	}
}