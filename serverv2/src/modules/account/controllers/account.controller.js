import { successResponse } from "../../../shared/utils/api-response.js";

export class AccountController {
	constructor({ getMyAccount, getMyAccounts, requestAccount, addDevice, removeDevice }) {
		this.getMyAccountUseCase = getMyAccount;
		this.getMyAccountsUseCase = getMyAccounts;
		this.requestAccountUseCase = requestAccount;
		this.addDeviceUseCase = addDevice;
		this.removeDeviceUseCase = removeDevice;
	}

	getMyAccount = async (req, res) => {
		const account = await this.getMyAccountUseCase.execute({ userId: req.user.id, accountId: req.params.id });
		return successResponse({ res, data: account.toJSON(), message: "Account fetched successfully" });
	};

	getMyAccounts = async (req, res) => {
		const accounts = await this.getMyAccountsUseCase.execute({ userId: req.user.id });
		return successResponse({ res, data: accounts.map((a) => a.toJSON()), message: "Accounts fetched successfully" });
	};

	requestAccount = async (req, res) => {
		const account = await this.requestAccountUseCase.execute({ userId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Account request submitted successfully", statusCode: 201 });
	};

	addDevice = async (req, res) => {
		const account = await this.addDeviceUseCase.execute({ userId: req.user.id, accountId: req.params.id, ...req.body, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Device added successfully" });
	};

	removeDevice = async (req, res) => {
		const account = await this.removeDeviceUseCase.execute({ userId: req.user.id, accountId: req.params.id, macAddress: req.params.mac, ip: req.ip });
		return successResponse({ res, data: account.toJSON(), message: "Device removed successfully" });
	};
}