import { NotFoundError, ConflictError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { NETWORK_CONFIG_ERROR_CODES as CODES, PROTECTED_PROFILE_NAMES } from "../../domain/network-config.enum.js";

export class ListHotspotProfiles {
	constructor({ networkConfigRepository, planRepository }) {
		this.networkConfigRepository = networkConfigRepository;
		this.planRepository = planRepository;
	}

	async execute() {
		const [profiles, { data: plans }] = await Promise.all([
			this.networkConfigRepository.listProfiles(),
			this.planRepository.paginate({ filter: { deletedAt: null }, limit: 100 })
		]);

		return profiles.map((profile) => ({
			...profile,
			usedByPlans: plans
				.filter((plan) => plan.ipoeProfile === profile.name || (plan.serviceType === "hotspot" && plan.mikrotikProfile === profile.name))
				.map((plan) => ({ id: plan.id, name: plan.name, serviceType: plan.serviceType }))
		}));
	}
}

export class CreateHotspotProfile {
	constructor({ networkConfigRepository, networkConfigDispatcher, auditService }) {
		this.networkConfigRepository = networkConfigRepository;
		this.networkConfigDispatcher = networkConfigDispatcher;
		this.auditService = auditService;
	}

	async execute({ actorId, ip = null, ...data }) {
		if (PROTECTED_PROFILE_NAMES.includes(data.name.toLowerCase())) {
			throw new ValidationError(`"${data.name}" is a built-in RouterOS profile and cannot be managed here`);
		}

		if (await this.networkConfigRepository.findProfileByName(data.name)) {
			throw new ConflictError(`A hotspot profile named ${data.name} already exists`, CODES.PROFILE_NAME_CONFLICT);
		}

		const created = await this.networkConfigRepository.createProfile({ ...data, createdBy: actorId });
		await this.networkConfigDispatcher.enqueueAll();

		await this.auditService?.log({ actorId, action: "HOTSPOT_PROFILE_CREATED", entity: "HotspotProfile", entityId: created.id, newValue: { name: created.name, rateLimit: created.rateLimit }, ip });

		return created;
	}
}

export class UpdateHotspotProfile {
	constructor({ networkConfigRepository, networkConfigDispatcher, auditService }) {
		this.networkConfigRepository = networkConfigRepository;
		this.networkConfigDispatcher = networkConfigDispatcher;
		this.auditService = auditService;
	}

	async execute({ actorId, profileId, data, ip = null }) {
		const existing = await this.networkConfigRepository.findProfileById(profileId);
		if (!existing) throw new NotFoundError("Hotspot profile not found", CODES.PROFILE_NOT_FOUND);

		const updated = await this.networkConfigRepository.updateProfile(profileId, data);
		await this.networkConfigDispatcher.enqueueAll();

		await this.auditService?.log({ actorId, action: "HOTSPOT_PROFILE_UPDATED", entity: "HotspotProfile", entityId: profileId, oldValue: { rateLimit: existing.rateLimit }, newValue: data, ip });

		return updated;
	}
}

export class DeleteHotspotProfile {
	constructor({ networkConfigRepository, networkConfigDispatcher, planRepository, subscriptionRepository, auditService }) {
		this.networkConfigRepository = networkConfigRepository;
		this.networkConfigDispatcher = networkConfigDispatcher;
		this.planRepository = planRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, profileId, ip = null }) {
		const profile = await this.networkConfigRepository.findProfileById(profileId);
		if (!profile) throw new NotFoundError("Hotspot profile not found", CODES.PROFILE_NOT_FOUND);

		const { data: plans } = await this.planRepository.paginate({
			filter: { deletedAt: null, $or: [{ ipoeProfile: profile.name }, { serviceType: "hotspot", mikrotikProfile: profile.name }] },
			limit: 100
		});

		if (plans.length) {
			throw new ConflictError(`This profile is used by plan(s): ${plans.map((plan) => plan.name).join(", ")}. Move them to another profile first.`, CODES.PROFILE_IN_USE, { plans: plans.map((plan) => ({ id: plan.id, name: plan.name })) });
		}

		const liveSubscriptions = await this.subscriptionRepository.count({
			status: { $in: ["active", "pending", "suspended"] },
			$or: [{ "planSnapshot.ipoeProfile": profile.name }, { "planSnapshot.mikrotikProfile": profile.name }]
		});

		if (liveSubscriptions) {
			throw new ConflictError(`${liveSubscriptions} live subscription(s) still use this profile.`, CODES.PROFILE_IN_USE, { subscriptions: liveSubscriptions });
		}

		await this.networkConfigRepository.softDeleteProfile(profileId);
		await this.networkConfigDispatcher.enqueueAll();

		await this.auditService?.log({ actorId, action: "HOTSPOT_PROFILE_DELETED", entity: "HotspotProfile", entityId: profileId, oldValue: { name: profile.name }, ip });

		return { id: profileId, name: profile.name };
	}
}
