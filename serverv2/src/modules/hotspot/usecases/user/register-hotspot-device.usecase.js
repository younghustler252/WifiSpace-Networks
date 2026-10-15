// hotspot/usecases/register-hotspot-device.usecase.js
import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { HOTSPOT_ERROR_CODES } from "../../domain/hotspot-session.enum.js";

const MAX_SWAPS_PER_DAY = 3;

export class RegisterHotspotDevice {
	constructor({ accountRepository, subscriptionRepository, hotspotSessionRepository, networkService, redisClient, auditService }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.hotspotSessionRepository = hotspotSessionRepository;
		this.networkService = networkService;
		this.redisClient = redisClient;
		this.auditService = auditService;
	}

	async execute({ accountId, macAddress, hostname = null, enforceSwapLimit = true }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", HOTSPOT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const subscription = await this.subscriptionRepository.findCurrentByAccountId(accountId);
		const limit = subscription?.planSnapshot?.devicesAllowed ?? account.maxDevices;

		const mac = macAddress.toUpperCase();
		const isNewDevice = !account.devices.some((d) => d.macAddress === mac);

		if (isNewDevice && account.devices.length >= limit && enforceSwapLimit) {
			const key = `device-swaps:${accountId}`;
			const swaps = await this.redisClient.incr(key);
			if (swaps === 1) await this.redisClient.expire(key, 86400);
			if (swaps > MAX_SWAPS_PER_DAY) {
				throw new ValidationError("Too many device changes today. Try again tomorrow or contact support.", HOTSPOT_ERROR_CODES.DEVICE_SWAP_LIMIT);
			}
		}

		const { evicted } = account.registerDevice({ macAddress: mac, hostname, limit });
		await this.accountRepository.update(account.id, { devices: account.devices });

		for (const device of evicted) {
			await this.hotspotSessionRepository.revokeByMac(device.macAddress);
			if (subscription) {
				await this.networkService.disconnectDevice(subscription, { macAddress: device.macAddress });
			}
		}

		if (evicted.length) {
			await this.auditService?.log({
				actorId: null, actorType: "system", action: "HOTSPOT_DEVICE_REPLACED", entity: "Account", entityId: account.id,
				oldValue: { devices: evicted.map((d) => d.macAddress) }, newValue: { device: mac }
			});
		}

		return { evicted, devices: account.devices };
	}
}