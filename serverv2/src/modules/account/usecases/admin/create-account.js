import { Account } from "../../domain/account.entity.js";
import { SERVICE_TYPES } from "../../domain/account.enum.js";

const DEFAULT_PASSWORDS = {
	[SERVICE_TYPES.HOTSPOT]: "Access123",
	[SERVICE_TYPES.PPPOE]: "C0NN3CT@pppoe123$"
};

export class CreateAccount {

	constructor({
		accountRepository,
		userRepository
	}) {
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
	}

	async execute(data) {
		const account = new Account(data);

		if (!account.routerPassword) {
			const user = await this.userRepository.findById(account.userId);

			account.routerPassword =
				user?.phone ||
				DEFAULT_PASSWORDS[account.serviceType];
		}

		const createdAccount = await this.accountRepository.create(account);

		return {
			account: createdAccount
		};
	}
}