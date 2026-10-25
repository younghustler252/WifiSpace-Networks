import { ConflictError } from "../../../../shared/errors/domain.errors.js";
import { PLAN_ERROR_CODES } from "../../domain/plan.enum.js";
import { Plan } from "../../domain/plan.entity.js";

export class CreatePlan {
	constructor({ planRepository, hotspotProfileGuard, auditService }) {
		this.hotspotProfileGuard = hotspotProfileGuard;
		this.planRepository = planRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, ip = null, ...data }) {
		const existing = await this.planRepository.findByNameAndServiceType(data.name?.trim(), data.serviceType);
		if (existing) {
			throw new ConflictError("A plan with this name already exists for this service type", PLAN_ERROR_CODES.PLAN_NAME_CONFLICT);
		}

		const plan = new Plan(data); // throws ValidationError via entity.validate() if malformed

		await this.hotspotProfileGuard.assertPlanProfile(plan);

		const created = await this.planRepository.create(plan);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "PLAN_CREATED", entity: "Plan", entityId: created.id,
				newValue: { name: created.name, serviceType: created.serviceType, price: created.price }, ip
			});
		}

		return created;
	}
}