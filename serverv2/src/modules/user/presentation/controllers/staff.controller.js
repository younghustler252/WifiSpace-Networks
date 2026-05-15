
import { successResponse } from "../../../../shared/utils/api-response.js";

export class StaffController {
	constructor(usecases) {
		this.usecases = usecases;
	}

	searchUser = async (req, res) => {
		const users = await this.usecases.searchUser.execute(req.query);

		return successResponse({
			res,
			data: users
		});
	};

	getAllUsers = async (req, res) => {
		const users = await this.usecases.getAllUsers.execute();

		return successResponse({
			res,
			data: users
		});
	};

	impersonateUser = async (req, res) => {
		const { userId } = req.params;

		const token = await this.usecases.impersonateUser.execute(req.user, userId);

		return successResponse({
			res,
			data: token,
			message: "Impersonation started"
		});
	};
}