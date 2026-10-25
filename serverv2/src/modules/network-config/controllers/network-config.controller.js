import { successResponse } from "../../../shared/utils/api-response.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";
import { NETWORK_CONFIG_ERROR_CODES } from "../domain/network-config.enum.js";

export class NetworkConfigController {
	constructor({
		listHotspotProfiles, createHotspotProfile, updateHotspotProfile, deleteHotspotProfile,
		listWalledGardenEntries, createWalledGardenEntry, updateWalledGardenEntry, deleteWalledGardenEntry,
		importNetworkConfig, syncNetworkConfig, getNetworkConfigStatus, networkConfigDispatcher
	}) {
		this.listHotspotProfilesUseCase = listHotspotProfiles;
		this.createHotspotProfileUseCase = createHotspotProfile;
		this.updateHotspotProfileUseCase = updateHotspotProfile;
		this.deleteHotspotProfileUseCase = deleteHotspotProfile;
		this.listWalledGardenEntriesUseCase = listWalledGardenEntries;
		this.createWalledGardenEntryUseCase = createWalledGardenEntry;
		this.updateWalledGardenEntryUseCase = updateWalledGardenEntry;
		this.deleteWalledGardenEntryUseCase = deleteWalledGardenEntry;
		this.importNetworkConfigUseCase = importNetworkConfig;
		this.syncNetworkConfigUseCase = syncNetworkConfig;
		this.getNetworkConfigStatusUseCase = getNetworkConfigStatus;
		this.networkConfigDispatcher = networkConfigDispatcher;
	}

	listProfiles = async (req, res) => successResponse({ res, data: await this.listHotspotProfilesUseCase.execute(), message: "Hotspot profiles fetched successfully" });

	createProfile = async (req, res) => {
		const profile = await this.createHotspotProfileUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: profile, message: "Hotspot profile created. Syncing to routers.", statusCode: 201 });
	};

	updateProfile = async (req, res) => {
		const profile = await this.updateHotspotProfileUseCase.execute({ actorId: req.user.id, profileId: req.params.id, data: req.body, ip: req.ip });
		return successResponse({ res, data: profile, message: "Hotspot profile updated. Syncing to routers." });
	};

	deleteProfile = async (req, res) => {
		const result = await this.deleteHotspotProfileUseCase.execute({ actorId: req.user.id, profileId: req.params.id, ip: req.ip });
		return successResponse({ res, data: result, message: "Hotspot profile deleted. Removal from routers is queued." });
	};

	listWalledGarden = async (req, res) => successResponse({ res, data: await this.listWalledGardenEntriesUseCase.execute(), message: "Walled garden entries fetched successfully" });

	createWalledGarden = async (req, res) => {
		const entry = await this.createWalledGardenEntryUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: entry, message: "Walled garden entry created. Syncing to routers.", statusCode: 201 });
	};

	updateWalledGarden = async (req, res) => {
		const entry = await this.updateWalledGardenEntryUseCase.execute({ actorId: req.user.id, entryId: req.params.id, data: req.body, ip: req.ip });
		return successResponse({ res, data: entry, message: "Walled garden entry updated. Syncing to routers." });
	};

	deleteWalledGarden = async (req, res) => {
		const result = await this.deleteWalledGardenEntryUseCase.execute({ actorId: req.user.id, entryId: req.params.id, ip: req.ip });
		return successResponse({ res, data: result, message: "Walled garden entry deleted. Removal from routers is queued." });
	};

	importConfig = async (req, res) => {
		const report = await this.importNetworkConfigUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: report, message: report.mode === "applied" ? "Import completed. Syncing to routers." : "Import preview" });
	};

	sync = async (req, res) => {
		const { routerId, resources = "all", dryRun = false } = req.body;

		if (routerId) {
			const result = await this.syncNetworkConfigUseCase.execute({ actorId: req.user.id, routerId, resources, dryRun });
			return successResponse({ res, data: result, message: dryRun ? "Sync preview" : "Router synced" });
		}

		if (dryRun) throw new ValidationError("A preview needs a routerId", NETWORK_CONFIG_ERROR_CODES.SYNC_NEEDS_ROUTER);

		const queued = await this.networkConfigDispatcher.enqueueAll();
		return successResponse({ res, data: { queued }, message: `Sync queued for ${queued} router(s)`, statusCode: 202 });
	};

	status = async (req, res) => successResponse({ res, data: await this.getNetworkConfigStatusUseCase.execute(), message: "Network config status fetched successfully" });
}
