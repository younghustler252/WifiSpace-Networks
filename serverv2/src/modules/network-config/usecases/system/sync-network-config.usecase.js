import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../../router/domain/router.enum.js";
import { RESOURCE_TYPES, SYNC_STATUSES, PROTECTED_PROFILE_NAMES } from "../../domain/network-config.enum.js";
import { toRouterFields as profileFields, diffRouterFields } from "../../domain/hotspot-profile.js";
import { toRouterFields as entryFields, diffFields, contentKeyOfEntry, contentKeyOfRow, markerIdOf } from "../../domain/walled-garden.js";

const emptyResult = () => ({ created: [], updated: [], removed: [], unchanged: 0, skipped: [], failed: [] });
const liveRows = (rows) => rows.filter((row) => row.dynamic !== "true");

export class SyncNetworkConfig {
	constructor({ routerRepository, networkConfigRepository, routerConfigDriver, hotspotService, auditService }) {
		this.routerRepository = routerRepository;
		this.networkConfigRepository = networkConfigRepository;
		this.routerConfigDriver = routerConfigDriver;
		this.hotspotService = hotspotService;
		this.auditService = auditService;
	}

	async execute({ routerId, resources = "all", dryRun = false, actorId = null }) {
		const router = await this.routerRepository.findById(routerId);
		if (!router) throw new NotFoundError("Router not found", ROUTER_ERROR_CODES.ROUTER_NOT_FOUND);

		const base = { routerId: router.id, router: router.code, dryRun };

		if (!router.supports("hotspot")) return { ...base, skipped: "router_does_not_support_hotspot" };
		if (router.credentialsMissing) return { ...base, error: "credentials_missing" };

		const wanted = (type) => resources === "all" || resources === type;
		const result = { ...base };

		if (wanted("profiles")) result.profiles = await this._run(router, RESOURCE_TYPES.HOTSPOT_PROFILE, dryRun, () => this._syncProfiles(router, dryRun));
		if (wanted("walled-garden")) result.walledGarden = await this._run(router, RESOURCE_TYPES.WALLED_GARDEN, dryRun, () => this._syncWalledGarden(router, dryRun));

		if (!dryRun) {
			await this.auditService?.log({
				actorId, actorType: actorId ? "user" : "system", action: "NETWORK_CONFIG_SYNCED", entity: "Router", entityId: router.id,
				newValue: { resources, profiles: this._counts(result.profiles), walledGarden: this._counts(result.walledGarden) }
			});
		}

		return result;
	}

	_counts(result) {
		if (!result || result.error) return null;
		return { created: result.created.length, updated: result.updated.length, removed: result.removed.length, failed: result.failed.length };
	}

	async _run(router, resourceType, dryRun, work) {
		const startedAt = new Date();

		try {
			const result = await work();
			const failed = result.failed.length;
			const touched = result.created.length + result.updated.length + result.removed.length + result.unchanged;

			if (!dryRun) {
				await this.networkConfigRepository.saveSyncState(router.id, resourceType, {
					status: failed ? (touched ? SYNC_STATUSES.PARTIAL : SYNC_STATUSES.FAILED) : SYNC_STATUSES.SYNCED,
					lastRunAt: startedAt,
					...(failed ? {} : { lastSuccessAt: startedAt }),
					error: null,
					counts: { created: result.created.length, updated: result.updated.length, removed: result.removed.length, unchanged: result.unchanged, skipped: result.skipped.length, failed },
					failures: result.failed.slice(0, 20)
				});
			}

			return result;
		} catch (error) {
			const message = error.errno || error.code || error.message || "router_unreachable";

			if (!dryRun) {
				await this.networkConfigRepository.saveSyncState(router.id, resourceType, { status: SYNC_STATUSES.FAILED, lastRunAt: startedAt, error: String(message), counts: {}, failures: [] });
			}

			return { ...emptyResult(), error: String(message) };
		}
	}

	async _syncProfiles(router, dryRun) {
		const result = emptyResult();
		const desired = await this.networkConfigRepository.listProfiles();
		const rows = await this.routerConfigDriver.listProfiles(router);
		const byName = new Map(rows.map((row) => [row.name, row]));

		for (const profile of desired) {
			const fields = profileFields(profile);
			const row = byName.get(profile.name);

			try {
				if (!row) {
					if (!dryRun) await this.routerConfigDriver.createProfile(router, profile.name, fields);
					result.created.push(profile.name);
					continue;
				}

				const changes = diffRouterFields(fields, row);
				if (!Object.keys(changes).length) {
					result.unchanged++;
					continue;
				}

				if (!dryRun) await this.routerConfigDriver.updateProfile(router, row[".id"], changes);
				result.updated.push({ name: profile.name, changes });
			} catch (error) {
				result.failed.push({ name: profile.name, error: error.message });
			}
		}

		const desiredNames = new Set(desired.map((profile) => profile.name));
		const removable = (await this.networkConfigRepository.deletedProfileNames()).filter((name) => !desiredNames.has(name) && !PROTECTED_PROFILE_NAMES.includes(name) && byName.has(name));

		if (removable.length) {
			const users = await this.hotspotService.getAllUsers(router);

			for (const name of removable) {
				const inUse = users.filter((user) => user.profile === name).length;
				if (inUse) {
					result.skipped.push({ name, reason: `still used by ${inUse} router user(s)` });
					continue;
				}

				try {
					if (!dryRun) await this.routerConfigDriver.removeProfile(router, byName.get(name)[".id"]);
					result.removed.push(name);
				} catch (error) {
					result.failed.push({ name, error: error.message });
				}
			}
		}

		return result;
	}

	async _syncWalledGarden(router, dryRun) {
		const result = emptyResult();
		const desiredAll = (await this.networkConfigRepository.listEntries()).filter((entry) => entry.enabled);

		for (const kind of ["host", "ip"]) {
			const desired = desiredAll.filter((entry) => entry.kind === kind);
			const rows = liveRows(await this.routerConfigDriver.listWalledGarden(router, kind));

			const markedById = new Map();
			const unmarkedByContent = new Map();

			for (const row of rows) {
				const markerId = markerIdOf(row);
				if (markerId) markedById.set(markerId, row);
				else unmarkedByContent.set(contentKeyOfRow(kind, row), row);
			}

			for (const entry of desired) {
				const label = entry.dstHost || entry.dstAddress;
				const fields = entryFields(entry);
				let row = markedById.get(entry.id);

				if (!row) {
					const adopted = unmarkedByContent.get(contentKeyOfEntry(entry));
					if (adopted) {
						row = adopted;
						unmarkedByContent.delete(contentKeyOfEntry(entry));
					}
				}

				try {
					if (!row) {
						if (!dryRun) await this.routerConfigDriver.createWalledGarden(router, kind, fields);
						result.created.push(label);
						continue;
					}

					const changes = diffFields(fields, row);

					if (!Object.keys(changes).length) {
						result.unchanged++;
						continue;
					}

					if (!dryRun) await this.routerConfigDriver.updateWalledGarden(router, kind, row[".id"], changes);
					result.updated.push({ name: label, changes });
				} catch (error) {
					result.failed.push({ name: label, error: error.message });
				}
			}

			const desiredIds = new Set(desired.map((entry) => entry.id));
			for (const [markerId, row] of markedById) {
				if (desiredIds.has(markerId)) continue;

				try {
					if (!dryRun) await this.routerConfigDriver.removeWalledGarden(router, kind, row[".id"]);
					result.removed.push(row["dst-host"] || row["dst-address"] || row[".id"]);
				} catch (error) {
					result.failed.push({ name: row["dst-host"] || row["dst-address"], error: error.message });
				}
			}
		}

		return result;
	}
}
