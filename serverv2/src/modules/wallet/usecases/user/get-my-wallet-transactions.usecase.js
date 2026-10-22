import { toNaira } from "../../../../shared/utils/money.js";

export class GetMyWalletTransactions {
	constructor({ walletRepository }) {
		this.walletRepository = walletRepository;
	}

	async execute({ userId, page, limit }) {
		const result = await this.walletRepository.listTransactions(userId, { page, limit });

		return {
			...result,
			data: result.data.map((tx) => ({ ...tx, amount: toNaira(tx.amountKobo), balanceAfter: tx.balanceAfterKobo == null ? null : toNaira(tx.balanceAfterKobo) }))
		};
	}
}
