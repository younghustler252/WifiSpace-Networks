import { PAYMENT_STATUSES } from "../../../payment/domain/payment.enum.js";
import { WALLET_TX_TYPES, WALLET_TX_SOURCES } from "../../domain/wallet.enum.js";

export class FundWalletFromTransfer {
	constructor({ walletRepository, userRepository, auditService, autoRenewSubscriptions }) {
		this.autoRenewSubscriptions = autoRenewSubscriptions;
		this.userRepository = userRepository;
		this.walletRepository = walletRepository;
		this.auditService = auditService;
	}

	async execute({ reference, amountKobo, status, currency, accountNumber, customerCode, email = null, senderName = null }) {
		if (!reference || typeof reference !== "string") {
			console.error("[FundWalletFromTransfer] Rejected transfer without a provider reference");
			return { handled: false, reason: "invalid_reference" };
		}
		if (status !== PAYMENT_STATUSES.SUCCESSFUL) {
			console.error(`[FundWalletFromTransfer] Rejected ${reference}: provider status is not successful`);
			return { handled: false, reason: "transfer_not_successful" };
		}
		if (String(currency ?? "").toUpperCase() !== "NGN") {
			console.error(`[FundWalletFromTransfer] Rejected ${reference}: currency ${currency ?? "missing"} is not NGN`);
			return { handled: false, reason: "invalid_currency" };
		}
		if (!Number.isInteger(amountKobo) || amountKobo <= 0) {
			console.error(`[FundWalletFromTransfer] Rejected ${reference}: invalid amount ${amountKobo}`);
			return { handled: false, reason: "invalid_amount" };
		}

		let wallet =
			(accountNumber && (await this.walletRepository.findByAccountNumber(accountNumber))) ||
			(customerCode && (await this.walletRepository.findByCustomerCode(customerCode))) ||
			null;

		if (!wallet && email) {
			const user = await this.userRepository.findByEmail(email);
			wallet = user ? await this.walletRepository.findByUserId(user.id) : null;
		}

		if (!wallet) {
			console.error(`[FundWalletFromTransfer] No wallet for account ${accountNumber ?? "?"} / customer ${customerCode ?? "?"} / ${email ?? "?"} (ref ${reference})`);
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

		if (!result.duplicate) {
			this.autoRenewSubscriptions?.execute({ userId: wallet.userId, retryMs: 2 * 60 * 1000 })
				.catch((error) => console.error("[FundWalletFromTransfer] Auto-renew check failed:", error.message));
		}

		return { handled: true, duplicate: result.duplicate, wallet: result.wallet };
	}
}
