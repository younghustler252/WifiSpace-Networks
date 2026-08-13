export class GetAccountStats {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}

	async execute() {
		return this.accountRepository.getDashboardStats();
	}
}