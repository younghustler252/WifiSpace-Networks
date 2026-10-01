import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { HOTSPOT_ERROR_CODES } from "../../domain/hotspot-session.enum.js";
import { PLAN_ERROR_CODES } from "../../../plan/domain/plan.enum.js";
import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";

export class HotspotCheckoutFlow {
	constructor({ accountRepository, planRepository, initiatePayment, auditService }) {
		this.accountRepository = accountRepository;
		this.planRepository = planRepository;
		this.initiatePayment = initiatePayment;
		this.auditService = auditService;
	}

	async execute({ userId, planId, callbackUrl, metadata = {}, ip = null }) {
		if (!callbackUrl) throw new ValidationError("callbackUrl is required");

		const account = await this.accountRepository.findOne({ userId, serviceType: SERVICE_TYPES.HOTSPOT });
		if (!account) throw new NotFoundError("Hotspot account not found", HOTSPOT_ERROR_CODES.ACCOUNT_NOT_FOUND);

		const plan = await this.planRepository.findByIdOrNull(planId);
		if (!plan) throw new NotFoundError("Plan not found", PLAN_ERROR_CODES.PLAN_NOT_FOUND);
		if (plan.serviceType !== SERVICE_TYPES.HOTSPOT) throw new ValidationError("Plan is not a hotspot plan");

		const result = await this.initiatePayment.execute({
			userId, accountId: account.id, planId, callbackUrl,
			provisioningMetadata: metadata, ip
		});

		if (this.auditService) {
			await this.auditService.log({
				actorId: userId, action: "HOTSPOT_CHECKOUT_STARTED", entity: "Payment", entityId: result.payment.id,
				newValue: { accountId: account.id, planId, ...metadata }, ip
			});
		}

		return { status: "PAYMENT_REQUIRED", account, plan, payment: result.payment, authorizationUrl: result.authorizationUrl };
	}
}