import { WALLET_TX_TYPES, WALLET_TX_SOURCES } from "../../domain/wallet.enum.js";

export class FundWalletFromTransfer {
	constructor({ walletRepository, auditService }) {
		this.walletRepository = walletRepository;
		this.auditService = auditService;
	}

	async execute({ reference, amountKobo, accountNumber, customerCode, senderName = null }) {
		const wallet =
			(accountNumber && (await this.walletRepository.findByAccountNumber(accountNumber))) ||
			(customerCode && (await this.walletRepository.findByCustomerCode(customerCode))) ||
			null;

		if (!wallet) {
			console.error(`[FundWalletFromTransfer] No wallet for account ${accountNumber ?? "?"} / customer ${customerCode ?? "?"} (ref ${reference})`);
			return { handled: false, reason: "wallet_not_found" };
		}

		const result = await this.walletRepository.apply({
			userId: wallet.userId,
			type: WALLET_TX_TYPES.CREDIT,
			amountKobo,
			source: WALLET_TX_SOURCES.TRANSFER,
			reference: `paystack:${reference}`,
			description: senderName ? `Transfer from ${senderName}` : "Bank transfer",
			metadata: { gatewayReference: reference, accountNumber }
		});

		if (!result.duplicate) {
			await this.auditService?.log({
				actorId: null, actorType: "system", action: "WALLET_FUNDED", entity: "Wallet", entityId: wallet.id,
				newValue: { amountKobo, reference }
			});
		}

		return { handled: true, duplicate: result.duplicate, wallet: result.wallet };
	}
}
