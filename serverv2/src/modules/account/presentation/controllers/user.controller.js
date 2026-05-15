import { successResponse } from "../../../../shared/utils/api-response.js";

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
	getUserAccounts = async (req, res) => {
		try {
			// Execute the use case to get user accounts
			const accounts = await this.getUserAccountsUseCase.execute(
				req.user,
				req.query
			);

			// Return the success response
			return successResponse({
				res,
				data: accounts,
				message: "Accounts fetched successfully",
				code: "ACCOUNTS_FETCHED"
			});
		} catch (error) {
			// Handle errors and send a response
			console.error("Error fetching accounts:", error);
			return res.status(500).json({
				message: "An error occurred while fetching accounts",
				error: error.message
			});
		}
	};

	// ----------------------------------
	// Request New Account
	// ----------------------------------
	requestAccount = async (req, res) => {
		try {
			// Execute the use case to request a new account
			const account = await this.requestAccountUseCase.execute(
				req.user,
				req.body,
				{
					ip: req.ip,
					userAgent: req.get("User-Agent")
				}
			);

			// Return the success response
			return successResponse({
				res,
				data: account,
				message: "Account request submitted",
				code: "ACCOUNT_REQUESTED",
				statusCode: 201
			});
		} catch (error) {
			// Handle errors and send a response
			console.error("Error requesting account:", error);
			return res.status(500).json({
				message: "An error occurred while requesting account",
				error: error.message
			});
		}
	};

	// ----------------------------------
	// Update My Account
	// ----------------------------------
	updateUserAccount = async (req, res) => {
		try {
			// Execute the use case to update user account
			const account = await this.updateUserAccountUseCase.execute(
				req.user,
				req.params.accountId,
				req.body,
				{
					ip: req.ip,
					userAgent: req.get("User-Agent")
				}
			);

			// Return the success response
			return successResponse({
				res,
				data: account,
				message: "Account updated successfully",
				code: "ACCOUNT_UPDATED"
			});
		} catch (error) {
			// Handle errors and send a response
			console.error("Error updating account:", error);
			return res.status(500).json({
				message: "An error occurred while updating account",
				error: error.message
			});
		}
	};
}