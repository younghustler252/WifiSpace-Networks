import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class AdminController {
	constructor({
		getAccountById, getAllAccounts, createAccount, approveAccount, rejectAccount,
		suspendAccount, pauseAccount, resumeAccount, terminateAccount, transferAccount, deleteAccount
	}) {
		this.getAccountByIdUseCase = getAccountById;
		this.getAllAccountsUseCase = getAllAccounts;
		this.createAccountUseCase = createAccount;
		this.approveAccountUseCase = approveAccount;
		this.rejectAccountUseCase = rejectAccount;
		this.suspendAccountUseCase = suspendAccount;
		this.pauseAccountUseCase = pauseAccount;
		this.resumeAccountUseCase = resumeAccount;
		this.terminateAccountUseCase = terminateAccount;
		this.transferAccountUseCase = transferAccount;
		this.deleteAccountUseCase = deleteAccount;
	}

	getAccountById = async (req, res) => {
		const account = await this.getAccountByIdUseCase.execute({ accountId: req.params.id });
		return successResponse({ res, data: account.toJSON(), message: "Account fetched successfully" });
	};

	getAllAccounts = async (req, res) => {
		const { data, meta } = await this.getAllAccountsUseCase.execute({ ...req.query });
		return paginatedResponse({ res, data: data.map((a) => a.toJSON()), meta, message: "Accounts fetched successfully" });
	};

	createAccount = async (req, res) => {
		const account = await this.createAccountUseCase.execute({ actorId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Account created successfully", statusCode: 201 });
	};

	approveAccount = async (req, res) => {
		const account = await this.approveAccountUseCase.execute({ actorId: req.user.id, accountId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Account approved successfully" });
	};

	rejectAccount = async (req, res) => {
		const account = await this.rejectAccountUseCase.execute({ actorId: req.user.id, accountId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Account rejected successfully" });
	};

	suspendAccount = async (req, res) => {
		const account = await this.suspendAccountUseCase.execute({ actorId: req.user.id, accountId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Account suspended successfully" });
	};

	pauseAccount = async (req, res) => {
		const account = await this.pauseAccountUseCase.execute({ actorId: req.user.id, accountId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Account paused successfully" });
	};

	resumeAccount = async (req, res) => {
		const account = await this.resumeAccountUseCase.execute({ actorId: req.user.id, accountId: req.params.id, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Account resumed successfully" });
	};

	terminateAccount = async (req, res) => {
		const account = await this.terminateAccountUseCase.execute({ actorId: req.user.id, accountId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Account terminated successfully" });
	};

	transferAccount = async (req, res) => {
		const account = await this.transferAccountUseCase.execute({ actorId: req.user.id, accountId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Account transferred successfully" });
	};

	deleteAccount = async (req, res) => {
		const result = await this.deleteAccountUseCase.execute({ actorId: req.user.id, accountId: req.params.id, ip: req.ip });
		return successResponse({ res, message: result.message });
	};
}