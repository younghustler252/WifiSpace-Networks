import crypto from "crypto";
import { ValidationError } from "../../../../shared/errors/domain.errors.js";
import { toKobo } from "../../../../shared/utils/money.js";
import { WALLET_TX_TYPES, WALLET_TX_SOURCES } from "../../domain/wallet.enum.js";
import { presentWallet } from "../user/get-my-wallet.usecase.js";

export class AdjustWallet {
	constructor({ walletRepository, userRepository, auditService }) {
		this.walletRepository = walletRepository;
		this.userRepository = userRepository;
		this.auditService = auditService;
	}

	async execute({ actorId, userId, direction, amount, reason, ip = null }) {
		const user = await this.userRepository.findById(userId);
		if (!user) throw new ValidationError("User not found");

		const type = direction === "debit" ? WALLET_TX_TYPES.DEBIT : WALLET_TX_TYPES.CREDIT;
		const result = await this.walletRepository.apply({
			userId,
			type,
			amountKobo: toKobo(amount),
			source: WALLET_TX_SOURCES.ADMIN_ADJUSTMENT,
			reference: `admin:${crypto.randomUUID()}`,
			description: reason,
			metadata: { actorId }
		});

		await this.auditService?.log({
			actorId, action: "WALLET_ADJUSTED", entity: "Wallet", entityId: result.wallet.id,
			newValue: { direction: type, amount, reason }, ip
		});

		return presentWallet(result.wallet);
	}
}
