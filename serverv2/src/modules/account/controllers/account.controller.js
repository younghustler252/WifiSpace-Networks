import { successResponse } from "../../../shared/utils/api-response.js";

export class AccountController {
	constructor({
		requestAccount,
		getMyAccount,
		getMyAccounts,
		updateMyAccount
	}) {
		this.requestAccountUseCase = requestAccount;
		this.getMyAccountUseCase = getMyAccount;
		this.getMyAccountsUseCase = getMyAccounts;
		this.updateMyAccountUseCase = updateMyAccount;
	}

	request = async (req, res, next) => {
		try {
			const account =
				await this.requestAccountUseCase.execute(
					req.user,
					req.body,
					{
						ip: req.ip,
						userAgent: req.headers["user-agent"]
					}
				);

			return successResponse({
				res,
				statusCode: 201,
				message: "Account request submitted successfully",
				data: account
			});
		} catch (error) {
			next(error);
		}
	};

	getMyAccounts = async (req, res, next) => {
		try {
			const accounts =
				await this.getMyAccountsUseCase.execute(
					req.user.id
				);

			return successResponse({
				res,
				message: "Accounts fetched successfully",
				data: accounts
			});
		} catch (error) {
			next(error);
		}
	};

	getMyAccount = async (req, res, next) => {
		try {
			const account =
				await this.getMyAccountUseCase.execute(
					req.user.id,
					req.params.accountId
				);

			return successResponse({
				res,
				message: "Account fetched successfully",
				data: account
			});
		} catch (error) {
			next(error);
		}
	};

	updateMyAccount = async (req, res, next) => {
		try {
			const account =
				await this.updateMyAccountUseCase.execute(
					req.user.id,
					req.params.accountId,
					req.body
				);

			return successResponse({
				res,
				message: "Account updated successfully",
				data: account
			});
		} catch (error) {
			next(error);
		}
	};
}