import { paginatedResponse } from "../../../shared/utils/api-response.js";

export class AuditController {
	constructor({ getMyAuditLogs, getAuditLogs }) {
		this.getMyAuditLogsUseCase = getMyAuditLogs;
		this.getAuditLogsUseCase = getAuditLogs;
	}

	getMyLogs = async (req, res) => {
		const { data, meta } = await this.getMyAuditLogsUseCase.execute({ userId: req.user.id, ...req.query });
		return paginatedResponse({ res, data, meta, message: "Audit logs fetched successfully" });
	};

	getAllLogs = async (req, res) => {
		const { data, meta } = await this.getAuditLogsUseCase.execute({ ...req.query });
		return paginatedResponse({ res, data, meta, message: "Audit logs fetched successfully" });
	};
}