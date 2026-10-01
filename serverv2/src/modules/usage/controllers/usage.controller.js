// controllers/usage.controller.js
import { successResponse } from "../../../shared/utils/api-response.js";

export class UsageController {
	constructor({ getMyUsage }) {
		this.getMyUsageUseCase = getMyUsage;
	}
	getMyUsage = async (req, res) => {
		const usage = await this.getMyUsageUseCase.execute({ userId: req.user.id, accountId: req.params.accountId });
		return successResponse({ res, data: usage, message: "Usage fetched successfully" });
	};
}