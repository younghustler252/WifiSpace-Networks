import { toNaira } from "../../../../shared/utils/money.js";

export function presentWallet(wallet) {
	return {
		id: wallet.id,
		balance: toNaira(wallet.balanceKobo),
		balanceKobo: wallet.balanceKobo,
		currency: wallet.currency,
		virtualAccount: wallet.virtualAccount
			? { accountNumber: wallet.virtualAccount.accountNumber, bankName: wallet.virtualAccount.bankName, accountName: wallet.virtualAccount.accountName }
			: null
	};
}

export class GetMyWallet {
	constructor({ walletRepository }) {
		this.walletRepository = walletRepository;
	}

	async execute({ userId }) {
		const wallet = await this.walletRepository.ensureWallet(userId);
		return presentWallet(wallet);
	}
}
