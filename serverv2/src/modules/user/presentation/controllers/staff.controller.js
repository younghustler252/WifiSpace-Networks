export class StaffController {

	constructor({
		searchUser,
		getAllUsers,
		impersonateUser
	}) {
		this.searchUserUseCase = searchUser;
		this.getAllUsersUseCase = getAllUsers;
		this.impersonateUserUseCase = impersonateUser;
	}

	searchUser = async (req, res) => {

		const users =
			await this.searchUserUseCase.execute({
				query: req.query,
				actor: req.user
			});

		return successResponse({
			res,
			data: users
		});
	};

	getAllUsers = async (req, res) => {

		const users =
			await this.getAllUsersUseCase.execute({
				actor: req.user
			});

		return successResponse({
			res,
			data: users
		});
	};

	impersonateUser = async (req, res) => {

		const { userId } = req.params;

		const token =
			await this.impersonateUserUseCase.execute(
				req.user,
				userId
			);

		return successResponse({
			res,
			data: token,
			message: "Impersonation started"
		});
	};
}