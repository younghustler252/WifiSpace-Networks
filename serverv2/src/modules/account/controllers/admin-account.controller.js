import expressAsyncHandler from "express-async-handler";
import {
	successResponse,
	paginatedResponse
} from "../../../shared/utils/api-response.js";

export class AdminAccountController {
	constructor({
		createAccount,
		getAccount,
		getAllAccounts,
		getAccountStats,
		approveAccount,
		rejectAccount,
		suspendAccount,
		deleteAccount,
		transferAccount,
		updateAccount,
		changeRouterPassword
	}) {
		this.createAccount = createAccount;
		this.getAccount = getAccount;
		this.getAllAccounts = getAllAccounts;
		this.getAccountStats = getAccountStats;
		this.approveAccount = approveAccount;
		this.rejectAccount = rejectAccount;
		this.suspendAccount = suspendAccount;
		this.deleteAccount = deleteAccount;
		this.transferAccount = transferAccount;
		this.updateAccount = updateAccount;
		this.changeRouterPasswordUseCase = changeRouterPassword;
	}

	// ================================
	// CREATE
	// ================================

	create = expressAsyncHandler(async (req, res) => {
		const account = await this.createAccount.execute(
			req.body
		);

		return successResponse({
			res,
			statusCode: 201,
			message: "Account created successfully",
			data: account
		});
	});

	// ================================
	// GET ALL
	// ================================

	getAll = expressAsyncHandler(async (req, res) => {
		const result = await this.getAllAccounts.execute(
			req.query
		);

		return paginatedResponse({
			res,
			data: result.data,
			meta: result.meta,
			message: "Accounts fetched successfully"
		});
	});

	// ================================
	// GET ONE
	// ================================

	getOne = expressAsyncHandler(async (req, res) => {
		const account = await this.getAccount.execute(
			req.params.accountId
		);

		return successResponse({
			res,
			message: "Account fetched successfully",
			data: account
		});
	});

	// ================================
	// STATS
	// ================================

	stats = expressAsyncHandler(async (req, res) => {
		const stats = await this.getAccountStats.execute();

		return successResponse({
			res,
			message: "Account statistics fetched successfully",
			data: stats
		});
	});

	// ================================
	// APPROVE
	// ================================

	approve = expressAsyncHandler(async (req, res) => {
		const account = await this.approveAccount.execute(
			req.params.accountId,
			req.user.id
		);

		return successResponse({
			res,
			message: "Account approved successfully",
			data: account
		});
	});

	// ================================
	// REJECT
	// ================================

	reject = expressAsyncHandler(async (req, res) => {
		const account = await this.rejectAccount.execute(
			req.params.accountId,
			req.body.note ?? null,
			req.user.id
		);

		return successResponse({
			res,
			message: "Account rejected successfully",
			data: account
		});
	});

	// ================================
	// SUSPEND
	// ================================

	suspend = expressAsyncHandler(async (req, res) => {
		const account = await this.suspendAccount.execute(
			req.params.accountId
		);

		return successResponse({
			res,
			message: "Account suspended successfully",
			data: account
		});
	});

	// ================================
	// DELETE
	// ================================

	remove = expressAsyncHandler(async (req, res) => {
		const result = await this.deleteAccount.execute(
			req.params.accountId
		);

		return successResponse({
			res,
			message: "Account deleted successfully",
			data: result
		});
	});

	// ================================
	// TRANSFER
	// ================================

	transfer = expressAsyncHandler(async (req, res) => {
		const account = await this.transferAccount.execute(
			req.params.accountId,
			req.body.newOwnerId
		);

		return successResponse({
			res,
			message: "Account transferred successfully",
			data: account
		});
	});

	// ================================
	// UPDATE
	// ================================

	update = expressAsyncHandler(async (req, res) => {
		const account = await this.updateAccount.execute(
			req.params.accountId,
			req.body
		);

		return successResponse({
			res,
			message: "Account updated successfully",
			data: account
		});
	});

	// ================================
	// ROUTER PASSWORD
	// ================================

	changeRouterPassword = expressAsyncHandler(async (req, res) => {
		const result = await this.changeRouterPasswordUseCase.execute(
			req.params.accountId,
			req.body.password
		);

		return successResponse({
			res,
			message: "Router password changed successfully",
			data: result
		});
	});
}