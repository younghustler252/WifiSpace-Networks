import { NotFoundError, ValidationError, AppError } from "../../../../shared/errors/domain.errors.js";
import { WALLET_ERROR_CODES } from "../../domain/wallet.enum.js";
import { presentWallet } from "./get-my-wallet.usecase.js";

export class EnsureVirtualAccount {
	constructor({ walletRepository, userRepository, paystackProvider, auditService }) {
		this.walletRepository = walletRepository;
		this.userRepository = userRepository;
		this.paystackProvider = paystackProvider;
		this.auditService = auditService;
	}

	async execute({ userId, phone = null }) {
		const wallet = await this.walletRepository.ensureWallet(userId);
		if (wallet.virtualAccount?.accountNumber) return presentWallet(wallet);

		const user = await this.userRepository.findById(userId);
		if (!user) throw new NotFoundError("User not found");

		const cleanedPhone = String(phone ?? user.phone ?? "").replace(/[\s-]/g, "");
		if (!/^\+?\d{10,15}$/.test(cleanedPhone)) {
			throw new ValidationError("A valid phone number is needed to create your dedicated account number", "PHONE_REQUIRED");
		}

		if (cleanedPhone !== user.phone) await this.userRepository.updatePhone(userId, cleanedPhone);

		let account;
		try {
			account = await this.paystackProvider.createVirtualAccount({
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				phone: cleanedPhone
			});
		} catch (error) {
			throw new AppError("Could not create your dedicated account number right now. Please try again shortly.", 502, WALLET_ERROR_CODES.VIRTUAL_ACCOUNT_FAILED, error.details ?? null);
		}

		const saved = await this.walletRepository.saveVirtualAccount(userId, account);

		await this.auditService?.log({
			actorId: userId, action: "WALLET_VIRTUAL_ACCOUNT_ASSIGNED", entity: "Wallet", entityId: saved.id,
			newValue: { accountNumber: account.accountNumber, bankName: account.bankName }
		});

		return presentWallet(saved);
	}
}
