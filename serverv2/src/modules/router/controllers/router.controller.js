import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class RouterController {
	constructor({
		createRouter, updateRouter, deleteRouter, getAllRouters, getRouterById,
		syncRouterInfo, syncAllRouters, rebootRouter, getRouterProfiles,
		listRouterHotspotUsers
	}) {
		this.createRouterUseCase = createRouter;
		this.updateRouterUseCase = updateRouter;
		this.deleteRouterUseCase = deleteRouter;
		this.getAllRoutersUseCase = getAllRouters;
		this.getRouterByIdUseCase = getRouterById;
		this.syncRouterInfoUseCase = syncRouterInfo;
		this.syncAllRoutersUseCase = syncAllRouters;
		this.rebootRouterUseCase = rebootRouter;
		this.getRouterProfilesUseCase = getRouterProfiles;
		this.listRouterHotspotUsersUseCase = listRouterHotspotUsers;
	}

	createRouter = async (req, res) => {
		const router = await this.createRouterUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: router.toJSON(), message: "Router created successfully", statusCode: 201 });
	};

	updateRouter = async (req, res) => {
		const router = await this.updateRouterUseCase.execute({ actorId: req.user.id, routerId: req.params.id, data: req.body, ip: req.ip });
		return successResponse({ res, data: router.toJSON(), message: "Router updated successfully" });
	};

	getAllRouters = async (req, res) => {
		const { data, meta } = await this.getAllRoutersUseCase.execute({ ...req.query });
		return paginatedResponse({ res, data: data.map((r) => r.toJSON()), meta, message: "Routers fetched successfully" });
	};

	getRouterById = async (req, res) => {
		const router = await this.getRouterByIdUseCase.execute({ routerId: req.params.id });
		return successResponse({ res, data: router.toJSON(), message: "Router fetched successfully" });
	};

	deleteRouter = async (req, res) => {
		const result = await this.deleteRouterUseCase.execute({ actorId: req.user.id, routerId: req.params.id, ip: req.ip });
		return successResponse({ res, message: result.message });
	};

	syncRouterInfo = async (req, res) => {
		const router = await this.syncRouterInfoUseCase.execute({ routerId: req.params.id });
		return successResponse({ res, data: router.toJSON(), message: "Router synced successfully" });
	};

	syncAllRouters = async (req, res) => {
		const result = await this.syncAllRoutersUseCase.execute();
		return successResponse({ res, data: result, message: "Router sync completed" });
	};

	rebootRouter = async (req, res) => {
		const result = await this.rebootRouterUseCase.execute({ actorId: req.user.id, routerId: req.params.id, ip: req.ip });
		return successResponse({ res, message: result.message });
	};

	getRouterProfiles = async (req, res) => {
		const profiles = await this.getRouterProfilesUseCase.execute({ routerId: req.params.id, serviceType: req.query.serviceType });
		return successResponse({ res, data: profiles, message: "Router profiles fetched successfully" });
	};

	listRouterHotspotUsers = async (req, res) => {
		const users = await this.listRouterHotspotUsersUseCase.execute({
			routerId: req.params.id
		});

		return successResponse({
			res,
			data: users,
			message: "Router hotspot users fetched successfully"
		});
	};
}