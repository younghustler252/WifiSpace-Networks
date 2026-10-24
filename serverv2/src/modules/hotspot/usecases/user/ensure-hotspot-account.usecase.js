import { HotspotAccount } from "../../../account/domain/hotspot-account.entity.js";
import { APPROVAL_STATUSES } from "../../../account/domain/account.enum.js";
import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";

export class EnsureHotspotAccount {
	constructor({ accountRepository, auditService }) {
		this.accountRepository = accountRepository;
		this.auditService = auditService;
	}

	async execute({ userId }) {
		const existing = await this.accountRepository.findOne({ userId, serviceType: SERVICE_TYPES.HOTSPOT });
		if (existing) return existing;

		const created = await this.accountRepository.create(new HotspotAccount({ userId, approvalStatus: APPROVAL_STATUSES.APPROVED }));

		await this.auditService?.log({
			actorId: null, actorType: "system", action: "HOTSPOT_ACCOUNT_AUTO_CREATED", entity: "Account", entityId: created.id,
			newValue: { userId, wsnId: created.wsnId }
		});

		return created;
	}
}
