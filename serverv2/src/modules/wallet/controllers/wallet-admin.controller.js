import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class WalletAdminController {
	constructor({ getMyWallet, getMyWalletTransactions, adjustWallet }) {
		this.getWalletUseCase = getMyWallet;
		this.getTransactionsUseCase = getMyWalletTransactions;
		this.adjustWalletUseCase = adjustWallet;
	}

	getWallet = async (req, res) => {
		const wallet = await this.getWalletUseCase.execute({ userId: req.params.userId });
		return successResponse({ res, data: wallet, message: "Wallet fetched successfully" });
	};

	getTransactions = async (req, res) => {
		const result = await this.getTransactionsUseCase.execute({ userId: req.params.userId, page: req.query.page, limit: req.query.limit });
		return paginatedResponse({ res, data: result.data, meta: result.meta, message: "Wallet transactions fetched successfully" });
	};

	adjust = async (req, res) => {
		const wallet = await this.adjustWalletUseCase.execute({ actorId: req.user.id, userId: req.params.userId, ...req.body, ip: req.ip });
		return successResponse({ res, data: wallet, message: "Wallet adjusted successfully" });
	};
}
