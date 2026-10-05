import crypto from "crypto";
import { ConflictError, NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { USER_ROLE, USER_STATUS } from "../../../user/domain/user.enum.js";
import { User } from "../../../user/domain/user.entity.js";
import { PppoeAccount } from "../../domain/pppoe-account.entity.js";
import { APPROVAL_STATUSES, ACCOUNT_STATUSES } from "../../domain/account.enum.js";
import { Subscription } from "../../../subscription/domain/subscription.entity.js";
import { SUBSCRIPTION_STATUSES } from "../../../subscription/domain/subscription.enum.js";

function generateRouterPassword() {
	return crypto.randomBytes(9).toString("base64url");
}

export class AdoptExistingIpoeAccount {
	constructor({ userRepository, accountRepository, subscriptionRepository, planRepository, passwordService, auditService }) {
		this.userRepository = userRepository;
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
	}

	async execute({ actorId, email, firstName, lastName, phone, routerId, macAddress, staticIp = null, planId, expiresAt, ip = null }) {
		let user = await this.userRepository.findByEmail(email);
		if (!user) {
			const randomPassword = crypto.randomBytes(16).toString("hex");
			const hashedPassword = await this.passwordService.hash(randomPassword);
			user = await this.userRepository.create(new User({
				firstName, lastName, email, hashedPassword, phone,
				role: USER_ROLE.CUSTOMER, status: USER_STATUS.ACTIVE, isVerified: true
			}));
		}

		const existingAccount = await this.accountRepository.findOne({ userId: user.id, serviceType: "pppoe", macAddress });
		if (existingAccount) throw new ConflictError("An account for this MAC address already exists");

		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found");

		const account = new PppoeAccount({
			userId: user.id, routerId, accessMethod: "ipoe", macAddress, staticIp,
			routerPassword: generateRouterPassword(), routerProfile: plan.mikrotikProfile,
			approvalStatus: APPROVAL_STATUSES.APPROVED, status: ACCOUNT_STATUSES.ACTIVE
		});
		account.approve(actorId);
		const createdAccount = await this.accountRepository.create(account);

		const planSnapshot = {
			name: plan.name, serviceType: plan.serviceType, price: plan.getEffectivePrice(),
			durationValue: plan.durationValue, durationUnit: plan.durationUnit,
			speedRate: plan.speedRate, mikrotikProfile: plan.mikrotikProfile,
			devicesAllowed: plan.devicesAllowed, gracePeriodDays: plan.gracePeriodDays
		};

		const subscription = new Subscription({
			accountId: createdAccount.id, userId: user.id, planId,
			status: SUBSCRIPTION_STATUSES.ACTIVE, planSnapshot, cycles: 1, totalAmount: planSnapshot.price,
			startsAt: new Date(), activatedAt: new Date(),
			currentPeriodStart: new Date(), currentPeriodEnd: new Date(expiresAt), expiresAt: new Date(expiresAt)
		});
		subscription.markMikrotikSynced();
		const createdSubscription = await this.subscriptionRepository.create(subscription);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "IPOE_ACCOUNT_ADOPTED", entity: "Account", entityId: createdAccount.id,
				newValue: { macAddress, routerId, expiresAt }, ip
			});
		}

		return { user, account: createdAccount, subscription: createdSubscription };
	}
}