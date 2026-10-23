import { UnauthorizedError } from "../../../../shared/errors/domain.errors.js";
import { HOTSPOT_ERROR_CODES } from "../../domain/hotspot-session.enum.js";
import { presentWallet } from "../../../wallet/usecases/user/get-my-wallet.usecase.js";

export class GetHotspotWallet {
	constructor({ userRepository, passwordService, walletRepository }) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.walletRepository = walletRepository;
	}

	async execute({ email, password }) {
		const user = await this.userRepository.findAuthByEmail(email);
		const valid = user ? await this.passwordService.compare(password, user.hashedPassword) : false;
		if (!valid) throw new UnauthorizedError("Invalid credentials", HOTSPOT_ERROR_CODES.INVALID_CREDENTIALS);

		const wallet = await this.walletRepository.ensureWallet(user.id);
		return presentWallet(wallet);
	}
}
