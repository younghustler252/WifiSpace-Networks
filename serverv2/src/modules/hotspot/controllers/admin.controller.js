// hotspot/controllers/admin.controller.js
import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class AdminController {
	constructor({ getAccountDevices, getAccountLocations }) {
		this.getAccountDevicesUseCase = getAccountDevices;
		this.getAccountLocationsUseCase = getAccountLocations;
	}

	getDevices = async (req, res) => {
		const { data, meta } = await this.getAccountDevicesUseCase.execute({ ...req.query });
		return paginatedResponse({ res, data: data.map((s) => s.toJSON()), meta, message: "Devices fetched successfully" });
	};

	getLocations = async (req, res) => {
		const locations = await this.getAccountLocationsUseCase.execute({ accountId: req.query.accountId });
		return successResponse({ res, data: locations, message: "Locations fetched successfully" });
	};
}