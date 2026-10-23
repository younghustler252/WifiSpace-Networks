import { successResponse, paginatedResponse } from "../../../shared/utils/api-response.js";

export class WalletAdminController {
	constructor({ getMyWallet, getMyWalletTransactions, adjustWallet, reconcileWalletFunding }) {
		this.reconcileWalletFundingUseCase = reconcileWalletFunding;
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

	reconcile = async (req, res) => {
		const days = Number(req.body.days ?? 7);
		const result = await this.reconcileWalletFundingUseCase.execute({
			from: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
			apply: Boolean(req.body.apply),
			requery: Boolean(req.body.requery)
		});
		return successResponse({ res, data: result, message: result.summary.mode === "applied" ? "Wallet funding reconciled" : "Reconciliation preview" });
	};

	adjust = async (req, res) => {
		const wallet = await this.adjustWalletUseCase.execute({ actorId: req.user.id, userId: req.params.userId, ...req.body, ip: req.ip });
		return successResponse({ res, data: wallet, message: "Wallet adjusted successfully" });
	};
}
