import { NotFoundError, ConflictError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { NETWORK_CONFIG_ERROR_CODES as CODES, HOST_ACTIONS, IP_ACTIONS } from "../../domain/network-config.enum.js";

export class ListWalledGardenEntries {
	constructor({ networkConfigRepository }) {
		this.networkConfigRepository = networkConfigRepository;
	}

	execute() {
		return this.networkConfigRepository.listEntries();
	}
}

export class CreateWalledGardenEntry {
	constructor({ networkConfigRepository, networkConfigDispatcher, auditService }) {
		this.networkConfigRepository = networkConfigRepository;
		this.networkConfigDispatcher = networkConfigDispatcher;
		this.auditService = auditService;
	}

	async execute({ actorId, ip = null, ...data }) {
		if (await this.networkConfigRepository.findEntryByContent(data)) {
			throw new ConflictError("An identical walled garden entry already exists", CODES.WALLED_GARDEN_CONFLICT);
		}

		const created = await this.networkConfigRepository.createEntry({ ...data, createdBy: actorId });
		await this.networkConfigDispatcher.enqueueAll();

		await this.auditService?.log({ actorId, action: "WALLED_GARDEN_CREATED", entity: "WalledGardenEntry", entityId: created.id, newValue: data, ip });

		return created;
	}
}

export class UpdateWalledGardenEntry {
	constructor({ networkConfigRepository, networkConfigDispatcher, auditService }) {
		this.networkConfigRepository = networkConfigRepository;
		this.networkConfigDispatcher = networkConfigDispatcher;
		this.auditService = auditService;
	}

	async execute({ actorId, entryId, data, ip = null }) {
		const existing = await this.networkConfigRepository.findEntryById(entryId);
		if (!existing) throw new NotFoundError("Walled garden entry not found", CODES.WALLED_GARDEN_NOT_FOUND);

		const merged = { ...existing, ...data };
		const allowedActions = merged.kind === "ip" ? IP_ACTIONS : HOST_ACTIONS;
		if (!allowedActions.includes(merged.action)) throw new ValidationError(`action must be one of ${allowedActions.join(", ")} for a ${merged.kind} entry`);
		if (merged.kind === "host" && !merged.dstHost) throw new ValidationError("dstHost is required for a host entry");
		if (merged.kind === "ip" && !merged.dstAddress && !merged.dstHost) throw new ValidationError("dstAddress or dstHost is required for an ip entry");
		if (await this.networkConfigRepository.findEntryByContent(merged, { excludeId: entryId })) {
			throw new ConflictError("An identical walled garden entry already exists", CODES.WALLED_GARDEN_CONFLICT);
		}

		const updated = await this.networkConfigRepository.updateEntry(entryId, data);
		await this.networkConfigDispatcher.enqueueAll();

		await this.auditService?.log({ actorId, action: "WALLED_GARDEN_UPDATED", entity: "WalledGardenEntry", entityId: entryId, newValue: data, ip });

		return updated;
	}
}

export class DeleteWalledGardenEntry {
	constructor({ networkConfigRepository, networkConfigDispatcher, auditService }) {
		this.networkConfigRepository = networkConfigRepository;
		this.networkConfigDispatcher = networkConfigDispatcher;
		this.auditService = auditService;
	}

	async execute({ actorId, entryId, ip = null }) {
		const existing = await this.networkConfigRepository.findEntryById(entryId);
		if (!existing) throw new NotFoundError("Walled garden entry not found", CODES.WALLED_GARDEN_NOT_FOUND);

		await this.networkConfigRepository.softDeleteEntry(entryId);
		await this.networkConfigDispatcher.enqueueAll();

		await this.auditService?.log({ actorId, action: "WALLED_GARDEN_DELETED", entity: "WalledGardenEntry", entityId: entryId, oldValue: { dstHost: existing.dstHost, dstAddress: existing.dstAddress }, ip });

		return { id: entryId };
	}
}
