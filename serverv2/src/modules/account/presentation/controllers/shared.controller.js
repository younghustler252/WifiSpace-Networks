import { successResponse } from "../../../../shared/utils/api-response.js";

export class SharedAccountController {
	constructor({
		getAccountById,
		getAccountByWsnId
	}) {
		this.getAccountByIdUseCase = getAccountById;
		this.getAccountByWSNUseCase = getAccountByWsnId;
	}

	// ----------------------------------
	// Get Account by ID
	// ----------------------------------
	getAccountById = async (req, res) => {
		try {
			const { accountId  } = req.params;

			// Execute use case to get account by ID
			const account = await this.getAccountByIdUseCase.execute(accountId);

			// Return success response
			return successResponse({
				res,
				data: account,
				message: "Account fetched successfully",
				code: "ACCOUNT_FETCHED"
			});
		} catch (error) {
			// Log and return the error
			console.error("Error fetching account by ID:", error);
			return res.status(500).json({
				message: "An error occurred while fetching the account",
				error: error.message
			});
		}
	};

	// ----------------------------------
	// Get Account by WSN (Wireless Serial Number)
	// ----------------------------------
	getAccountByWsnId = async (req, res) => {
		try {
			const { wsn } = req.params;

			// Execute use case to get account by WSN
			const account = await this.getAccountByWSNUseCase.execute({
				wsn
			});

			// Return success response
			return successResponse({
				res,
				data: account,
				message: "Account fetched successfully by WSN",
				code: "ACCOUNT_FETCHED_BY_WSN"
			});
		} catch (error) {
			// Log and return the error
			console.error("Error fetching account by WSN:", error);
			return res.status(500).json({
				message: "An error occurred while fetching the account by WSN",
				error: error.message
			});
		}
	};
}