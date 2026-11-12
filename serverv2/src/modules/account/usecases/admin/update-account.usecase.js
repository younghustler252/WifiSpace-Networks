import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../../router/domain/router.enum.js";
import { SUBSCRIPTION_STATUSES } from "../../../subscription/domain/subscription.enum.js";
import { ACCOUNT_ERROR_CODES, PPPOE_ACCESS_METHODS, SERVICE_TYPES } from "../../domain/account.enum.js";

const COMMON_FIELDS = ["accountType", "businessName", "companyRegistrationNumber", "taxId"];
const PPPOE_FIELDS = ["routerId", "routerProfile", "limitUptime", "staticIp", "requestedLocation"];
const HOTSPOT_FIELDS = ["maxDevices"];

export class UpdateAccount {
	constructor({ accountRepository, subscriptionRepository, routerRepository, networkService, auditService }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.routerRepository = routerRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, accountId, ip = null, ...body }) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) throw new NotFoundError("Account not found", ACCOUNT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const isPppoe = account.serviceType === SERVICE_TYPES.PPPOE;
		const allowed = [...COMMON_FIELDS, ...(isPppoe ? PPPOE_FIELDS : HOTSPOT_FIELDS)];

		const updates = {};
		for (const [key, value] of Object.entries(body)) {
			if (value === undefined) continue;
			if (!allowed.includes(key)) {
				throw new ValidationError(`${key} cannot be changed on a ${account.serviceType} account`, "FIELD_NOT_EDITABLE");
			}
			updates[key] = value;
		}

		let move = null;
		if (updates.routerId !== undefined) {
			if (String(updates.routerId) === String(account.routerId)) {
				delete updates.routerId;
			} else {
				move = await this._prepareMove(account, updates.routerId);
			}
		}

		if (!Object.keys(updates).length) {
			throw new ValidationError("There is nothing to update", "NOTHING_TO_UPDATE");
		}

		const previous = { routerId: account.routerId, macAddress: account.macAddress };
		await this.accountRepository.update(account.id, updates);

		let provisioning = { status: "not_needed" };
		if (move?.subscription) {
			const queued = await this.networkService.moveRouter(move.subscription, {
				fromRouterId: previous.routerId,
				previousMacAddress: previous.macAddress,
				provisionNew: move.provisionNew
			});
			provisioning = queued.provisioning ?? { status: queued.success ? "pending" : "failed" };
		}

		await this.auditService?.log({
			actorId, action: move ? "ACCOUNT_ROUTER_MOVED" : "ACCOUNT_UPDATED", entity: "Account", entityId: account.id,
			oldValue: Object.fromEntries(Object.keys(updates).map((key) => [key, account[key] ?? null])),
			newValue: { ...updates, provisioning: provisioning.status }, ip
		});

		const fresh = await this.accountRepository.findById(account.id);
		return { account: fresh, provisioning };
	}

	async _prepareMove(account, routerId) {
		if (account.serviceType !== SERVICE_TYPES.PPPOE) {
			throw new ValidationError("Only home (PPPoE) accounts can be moved to another router", "ROUTER_MOVE_NOT_SUPPORTED");
		}

		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new NotFoundError("Router not found", ROUTER_ERROR_CODES.ROUTER_NOT_FOUND);
		if (router.isEnabled === false) throw new ValidationError("That router is disabled", "ROUTER_DISABLED");
		if (!router.supports(SERVICE_TYPES.PPPOE)) {
			throw new ValidationError("That router is not set up for home internet", "ROUTER_SERVICE_NOT_SUPPORTED");
		}

		if (account.accessMethod === PPPOE_ACCESS_METHODS.IPOE && !account.macAddress) {
			throw new ValidationError("Add the customer's MAC address before moving an IPoE account", "MAC_ADDRESS_INVALID");
		}

		const subscription = (await this.subscriptionRepository.findByAccountId(account.id))[0] ?? null;

		if (subscription?.status === SUBSCRIPTION_STATUSES.SUSPENDED) {
			throw new ValidationError("Resume the suspended subscription before moving this account", "SUBSCRIPTION_SUSPENDED");
		}

		return { subscription, provisionNew: Boolean(subscription?.isActive()) };
	}
}
