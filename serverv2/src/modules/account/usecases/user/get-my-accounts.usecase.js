export class GetMyAccounts {
	constructor({ accountRepository }) {
		this.accountRepository = accountRepository;
	}

	async execute({ userId }) {
		return this.accountRepository.findByUserId(userId);
	}
}