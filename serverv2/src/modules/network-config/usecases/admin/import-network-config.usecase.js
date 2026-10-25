import { PROTECTED_PROFILE_NAMES } from "../../domain/network-config.enum.js";
import { fromRouterRow } from "../../domain/hotspot-profile.js";
import { entryFromRow, markerIdOf, contentKeyOfEntry } from "../../domain/walled-garden.js";

export class ImportNetworkConfig {
	constructor({ routerRepository, networkConfigRepository, routerConfigDriver, networkConfigDispatcher, auditService }) {
		this.routerRepository = routerRepository;
		this.networkConfigRepository = networkConfigRepository;
		this.routerConfigDriver = routerConfigDriver;
		this.networkConfigDispatcher = networkConfigDispatcher;
		this.auditService = auditService;
	}

	async execute({ actorId, resources = "all", routerId = null, apply = false, ip = null }) {
		const routers = await this._routers(routerId);
		const report = { mode: apply ? "applied" : "preview", routers: routers.map((router) => router.code), unreachable: [] };

		const reachable = [];
		const profileRows = [];
		const walledRows = [];

		for (const router of routers) {
			try {
				if (resources === "all" || resources === "profiles") {
					for (const row of await this.routerConfigDriver.listProfiles(router)) profileRows.push({ router: router.code, row });
				}

				if (resources === "all" || resources === "walled-garden") {
					for (const kind of ["host", "ip"]) {
						for (const row of await this.routerConfigDriver.listWalledGarden(router, kind)) {
							if (row.dynamic !== "true" && !markerIdOf(row)) walledRows.push({ router: router.code, kind, row });
						}
					}
				}

				reachable.push(router.code);
			} catch (error) {
				report.unreachable.push({ router: router.code, error: String(error.errno || error.code || error.message) });
			}
		}

		if (resources === "all" || resources === "profiles") report.profiles = await this._importProfiles(profileRows, apply, actorId);
		if (resources === "all" || resources === "walled-garden") report.walledGarden = await this._importEntries(walledRows, apply, actorId);

		if (apply) {
			await this.networkConfigDispatcher.enqueueAll();
			await this.auditService?.log({ actorId, action: "NETWORK_CONFIG_IMPORTED", entity: "Router", entityId: null, newValue: { resources, profiles: report.profiles?.imported.length, walledGarden: report.walledGarden?.imported.length }, ip });
		}

		return report;
	}

	async _routers(routerId) {
		const { data } = await this.routerRepository.paginate({ filter: { isEnabled: true }, limit: 100 });
		const selected = data.filter((router) => (routerId ? router.id === routerId || router.code === routerId : router.supports?.("hotspot")));
		const withCredentials = await Promise.all(selected.map((router) => this.routerRepository.findById(router.id)));
		return withCredentials.filter((router) => router && !router.credentialsMissing);
	}

	async _importProfiles(rows, apply, actorId) {
		const known = new Set((await this.networkConfigRepository.listProfiles()).map((profile) => profile.name.toLowerCase()));
		const seen = new Map();
		const report = { imported: [], alreadyManaged: 0, skipped: [], conflicts: [] };

		for (const { router, row } of rows) {
			if (PROTECTED_PROFILE_NAMES.includes(row.name)) continue;
			if (known.has(row.name.toLowerCase())) {
				report.alreadyManaged++;
				continue;
			}

			const parsed = fromRouterRow(row);
			if (!parsed) {
				report.skipped.push({ name: row.name, router, reason: `rate-limit "${row["rate-limit"] ?? ""}" cannot be read as whole Mbps upload/download` });
				continue;
			}

			const earlier = seen.get(row.name);
			if (earlier) {
				if (earlier.uploadMbps !== parsed.uploadMbps || earlier.downloadMbps !== parsed.downloadMbps) {
					report.conflicts.push({ name: row.name, router, note: `differs from the version on ${earlier.router}, kept ${earlier.router}'s` });
				}
				continue;
			}

			seen.set(row.name, { ...parsed, router });
		}

		for (const [name, parsed] of seen) {
			const { router, ...data } = parsed;
			report.imported.push({ name, rateLimit: `${data.uploadMbps}M/${data.downloadMbps}M`, from: router });
			if (apply) await this.networkConfigRepository.createProfile({ ...data, createdBy: actorId });
		}

		return report;
	}

	async _importEntries(rows, apply, actorId) {
		const known = new Set((await this.networkConfigRepository.listEntries()).map(contentKeyOfEntry));
		const seen = new Map();
		const report = { imported: [], alreadyManaged: 0 };

		for (const { kind, row } of rows) {
			const entry = entryFromRow(kind, row);
			const key = contentKeyOfEntry(entry);

			if (known.has(key)) {
				report.alreadyManaged++;
				continue;
			}

			if (!seen.has(key)) seen.set(key, entry);
		}

		for (const entry of seen.values()) {
			report.imported.push({ kind: entry.kind, target: entry.dstHost || entry.dstAddress, port: entry.dstPort, action: entry.action });
			if (apply) await this.networkConfigRepository.createEntry({ ...entry, createdBy: actorId });
		}

		return report;
	}
}
