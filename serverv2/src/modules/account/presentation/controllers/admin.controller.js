import expressAsyncHandler from "express-async-handler";
import { successResponse } from "../../../../shared/utils/api-response.js";

export class AdminAccountController {

	constructor({ createAccount, updateAccount, deleteAccount, activateAccount, suspendAccount, transferAccount, getAllAccounts }) {
		this.createAccountUseCase = createAccount;
		this.updateAccountUseCase = updateAccount;
		this.deleteAccountUseCase = deleteAccount;
		this.activateAccountUseCase = activateAccount;
		this.suspendAccountUseCase = suspendAccount;
		this.transferAccountUseCase = transferAccount;
		this.getAllAccountsUseCase = getAllAccounts;
	}

	createAccount = expressAsyncHandler(async (req, res) => {

		const account = await this.createAccountUseCase.execute(
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
			message: "Account created",
			code: "ACCOUNT_CREATED",
			statusCode: 201
		});
	});


	updateAccount = expressAsyncHandler(async (req, res) => {

		const account = await this.updateAccountUseCase.execute(
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
			message: "Account updated",
			code: "ACCOUNT_UPDATED"
		});
	});


	deleteAccount = expressAsyncHandler(async (req, res) => {

		await this.deleteAccountUseCase.execute(
			req.user,
			req.params.accountId,
			{
				ip: req.ip,
				userAgent: req.get("User-Agent")
			}
		);

		return successResponse({
			res,
			message: "Account deleted",
			code: "ACCOUNT_DELETED"
		});
	});


	activateAccount = expressAsyncHandler(async (req, res) => {

		const account = await this.activateAccountUseCase.execute(
			req.user,
			req.params.accountId
		);

		return successResponse({
			res,
			data: account,
			message: "Account activated",
			code: "ACCOUNT_ACTIVATED"
		});
	});


	suspendAccount = expressAsyncHandler(async (req, res) => {

		const account = await this.suspendAccountUseCase.execute(
			req.user,
			req.params.accountId
		);

		return successResponse({
			res,
			data: account,
			message: "Account suspended",
			code: "ACCOUNT_SUSPENDED"
		});
	});


	transferAccount = expressAsyncHandler(async (req, res) => {

		const account = await this.transferAccountUseCase.execute(
			req.user,
			req.params.accountId,
			req.body.newUserId
		);

		return successResponse({
			res,
			data: account,
			message: "Account transferred",
			code: "ACCOUNT_TRANSFERRED"
		});
	});


	getAllAccounts = expressAsyncHandler(async (req, res) => {

		const accounts = await this.getAllAccountsUseCase.execute(
			req.user,
			req.query,
			{
				ip: req.ip,
				userAgent: req.get("User-Agent")
			}
		);
		console.log("accounts", accounts);
		

		return successResponse({
			res,
			data: accounts,
			message: "Accounts fetched",
			code: "ACCOUNTS_FETCHED"
		});
	});

}