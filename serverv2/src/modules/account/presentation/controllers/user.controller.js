import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { successResponse } from "../../../shared/utils/api-response.js";

export class UserAccountController {

	constructor({
		getUserAccounts,
		requestAccount,
		updateUserAccount
	}) {
		this.getUserAccountsUseCase = getUserAccounts;
		this.requestAccountUseCase = requestAccount;
		this.updateUserAccountUseCase = updateUserAccount;
	}

	// ----------------------------------
	// Get My Accounts
	// ----------------------------------
	getAccounts = asyncHandler(async (req, res) => {

		const accounts = await this.getUserAccountsUseCase.execute(
			req.user,
			req.query
		);

		return successResponse({
			res,
			data: accounts,
			message: "Accounts fetched successfully",
			code: "ACCOUNTS_FETCHED"
		});
	});


	// ----------------------------------
	// Request New Account
	// ----------------------------------
	requestAccount = asyncHandler(async (req, res) => {

		const account = await this.requestAccountUseCase.execute(
			req.user,
			req.body,
			{
				ip: req.ip,
				userAgent: req.get("User-Agent")
			}
		);

		return successResponse({
			res,
			data: account,
			message: "Account request submitted",
			code: "ACCOUNT_REQUESTED",
			statusCode: 201
		});
	});


	// ----------------------------------
	// Update My Account
	// ----------------------------------
	updateAccount = asyncHandler(async (req, res) => {

		const account = await this.updateUserAccountUseCase.execute(
			req.user,
			req.params.accountId,
			req.body,
			{
				ip: req.ip,
				userAgent: req.get("User-Agent")
			}
		);

		return successResponse({
			res,
			data: account,
			message: "Account updated successfully",
			code: "ACCOUNT_UPDATED"
		});
	});

}