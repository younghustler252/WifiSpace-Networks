import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES, PPPOE_ACCESS_METHODS, SERVICE_TYPES } from "../../domain/account.enum.js";
import { normalizeRouterPassword } from "../../domain/wsn-id.js";

const MAC_PATTERN = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;

export class ChangeAccessMethod {
	constructor({ accountRepository, subscriptionRepository, networkService, auditService }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, accessMethod, macAddress = null, routerPassword = null, ip = null }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		if (account.serviceType !== SERVICE_TYPES.PPPOE) {
			throw new ValidationError("Only home (PPPoE) accounts can change their access method", "ACCESS_METHOD_NOT_SUPPORTED");
		}
		if (!account.routerId) {
			throw new ValidationError("Assign a router to this account before changing its access method", "ACCOUNT_HAS_NO_ROUTER");
		}
		if (account.accessMethod === accessMethod) {
			throw new ValidationError(`This account already uses ${accessMethod === PPPOE_ACCESS_METHODS.IPOE ? "IPoE" : "PPP"}`, "ACCESS_METHOD_UNCHANGED");
		}

		const subscription = (await this.subscriptionRepository.findByAccountId(account.id))[0] ?? null;
		const live = subscription?.isActive() ? subscription : null;
		const updates = { accessMethod };
		let credentials = null;

		if (accessMethod === PPPOE_ACCESS_METHODS.IPOE) {
			const mac = String(macAddress ?? account.macAddress ?? "").trim().toUpperCase().replace(/-/g, ":");
			if (!MAC_PATTERN.test(mac)) {
				throw new ValidationError("A valid MAC address is required for IPoE", "MAC_ADDRESS_INVALID");
			}
			if (live && !live.planSnapshot?.ipoeProfile) {
				throw new ValidationError(`The plan "${live.planSnapshot?.name}" has no IPoE profile. Set one on the plan first.`, "IPOE_PROFILE_MISSING");
			}
			updates.macAddress = mac;
			if (live) updates.routerProfile = live.planSnapshot.ipoeProfile;
		} else {
			if (live && !live.planSnapshot?.mikrotikProfile) {
				throw new ValidationError(`The plan "${live.planSnapshot?.name}" has no PPP profile.`, "PPP_PROFILE_MISSING");
			}
			if (routerPassword) {
				await this.accountRepository.setRouterPassword(account.id, normalizeRouterPassword(routerPassword));
			}
			credentials = await this.accountRepository.ensureRouterCredentials(account.id);
			if (live) updates.routerProfile = live.planSnapshot.mikrotikProfile;
		}

		const previous = { accessMethod: account.accessMethod, macAddress: account.macAddress };
		await this.accountRepository.update(account.id, updates);

		let provisioning = { status: "not_needed" };
		if (subscription) {
			const queued = await this.networkService.switchAccessMethod(subscription, {
				fromAccessMethod: previous.accessMethod,
				previousMacAddress: previous.macAddress,
				provisionNew: Boolean(live)
			});
			provisioning = queued.provisioning ?? { status: queued.success ? "pending" : "failed" };
		}

		await this.auditService?.log({
			actorId, action: "ACCOUNT_ACCESS_METHOD_CHANGED", entity: "Account", entityId: account.id,
			oldValue: previous, newValue: { accessMethod, macAddress: updates.macAddress ?? null, provisioning: provisioning.status }, ip
		});

		const fresh = await this.accountRepository.findById(account.id);

		return {
			account: fresh,
			routerCredentials: accessMethod === PPPOE_ACCESS_METHODS.PPP
				? { username: account.wsnId, password: credentials?.routerPassword ?? null, generated: !routerPassword }
				: null,
			provisioning
		};
	}
}
