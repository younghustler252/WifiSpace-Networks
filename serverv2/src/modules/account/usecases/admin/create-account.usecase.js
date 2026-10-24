import crypto from "crypto";
import { PppoeAccount } from "../../domain/pppoe-account.entity.js";
import { HotspotAccount } from "../../domain/hotspot-account.entity.js";
import { SERVICE_TYPES, PPPOE_ACCESS_METHODS } from "../../domain/account.enum.js";
import { ValidationError, NotFoundError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { ACCOUNT_ERROR_CODES } from "../../domain/account.enum.js";
import { normalizeWsnId, normalizeRouterPassword } from "../../domain/wsn-id.js";
import { USER_ERROR_CODES } from "../../../user/domain/user.enum.js";

function generateRouterPassword() {
	return crypto.randomBytes(9).toString("base64url");
}

export class CreateAccount {
	constructor({
		accountRepository,
		userRepository,
		auditService,
		createNotification
	}) {
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
		this.createNotification = createNotification;
		this.auditService = auditService;
	}

	async execute({
		actorId,
		userId,
		serviceType,
		accountType,
		businessName,
		companyRegistrationNumber,
		taxId,
		routerId,
		routerProfile,
		accessMethod,
		macAddress,
		staticIp,
		maxDevices,
		wsnId,
		routerPassword,
		ip = null
	}) {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new NotFoundError(
				"User not found",
				USER_ERROR_CODES.USER_NOT_FOUND
			);
		}

		let account;
		let assignedRouterPassword = null;

		const requestedWsnId = wsnId ? normalizeWsnId(wsnId) : null;
		if (requestedWsnId && (await this.accountRepository.wsnIdExists(requestedWsnId))) {
			throw new ConflictError(`WSN ID ${requestedWsnId} is already used by another account`, ACCOUNT_ERROR_CODES.WSN_ID_CONFLICT);
		}

		if (serviceType === SERVICE_TYPES.PPPOE) {
			if (!routerId) {
				throw new ValidationError(
					"routerId is required for a PPPoE account"
				);
			}

			const resolvedAccessMethod =
				accessMethod || PPPOE_ACCESS_METHODS.IPOE;

			if (!Object.values(PPPOE_ACCESS_METHODS).includes(resolvedAccessMethod)) {
				throw new ValidationError("Invalid PPPoE access method");
			}

			assignedRouterPassword = routerPassword ? normalizeRouterPassword(routerPassword) : generateRouterPassword();

			account = new PppoeAccount({
				userId,
				wsnId: requestedWsnId,
				accountType,
				businessName,
				companyRegistrationNumber,
				taxId,
				routerId,
				routerProfile,
				accessMethod: resolvedAccessMethod,
				routerPassword: assignedRouterPassword,
				macAddress:
					resolvedAccessMethod === PPPOE_ACCESS_METHODS.IPOE
						? macAddress
						: null,
				staticIp:
					resolvedAccessMethod === PPPOE_ACCESS_METHODS.IPOE
						? staticIp
						: null
			});

			account.approve(actorId);
		} else if (serviceType === SERVICE_TYPES.HOTSPOT) {
			account = new HotspotAccount({
				userId,
				wsnId: requestedWsnId,
				maxDevices
			});

			account.approve(actorId);
		} else {
			throw new ValidationError("Invalid service type");
		}

		const createdAccount =
			await this.accountRepository.create(account);

		if (this.auditService) {
			await this.auditService.log({
				actorId,
				action: "ACCOUNT_CREATED_BY_ADMIN",
				entity: "Account",
				entityId: createdAccount.id,
				newValue: {
					userId,
					serviceType,
					accountType,
					wsnId: createdAccount.wsnId,
					wsnIdAssignedManually: Boolean(requestedWsnId),
					routerPasswordSuppliedByAdmin: Boolean(routerPassword)
				},
				ip
			});
		}

		if (this.createNotification) {
			await this.createNotification.execute({
				actorId,
				type: "account_approved",
				title: "Your account is ready!",
				message:
					"Your account has been created — subscribe to a plan to get connected.",
				userIds: [userId],
				accountId: createdAccount.id,
				entityType: "Account",
				entityId: createdAccount.id
			});
		}

		return {
			account: createdAccount,
			routerCredentials: assignedRouterPassword
				? { username: createdAccount.wsnId, password: assignedRouterPassword, generated: !routerPassword }
				: null
		};
	}
}
