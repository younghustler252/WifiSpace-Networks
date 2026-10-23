import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class WalletController {
	constructor({ getMyWallet, getMyWalletTransactions, ensureVirtualAccount, payWithWallet }) {
		this.getMyWalletUseCase = getMyWallet;
		this.getMyWalletTransactionsUseCase = getMyWalletTransactions;
		this.ensureVirtualAccountUseCase = ensureVirtualAccount;
		this.payWithWalletUseCase = payWithWallet;
	}

	getMyWallet = async (req, res) => {
		const wallet = await this.getMyWalletUseCase.execute({ userId: req.user.id });
		return successResponse({ res, data: wallet, message: "Wallet fetched successfully" });
	};

	getMyTransactions = async (req, res) => {
		const result = await this.getMyWalletTransactionsUseCase.execute({ userId: req.user.id, page: req.query.page, limit: req.query.limit });
		return paginatedResponse({ res, data: result.data, meta: result.meta, message: "Wallet transactions fetched successfully" });
	};

	getVirtualAccount = async (req, res) => {
		const wallet = await this.ensureVirtualAccountUseCase.execute({ userId: req.user.id, phone: req.body?.phone });
		return successResponse({ res, data: wallet, message: "Dedicated account ready" });
	};

	pay = async (req, res) => {
		const result = await this.payWithWalletUseCase.execute({ userId: req.user.id, ...req.body, ip: req.ip });
		return successResponse({
			res,
			data: { payment: result.payment.toJSON(), balance: result.balance, provisioning: result.outcome?.provisioning ?? null },
			message: "Payment successful",
			statusCode: 201
		});
	};
}
