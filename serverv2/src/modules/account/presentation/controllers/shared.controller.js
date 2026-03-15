export class SharedAccountController {
	constructor({
		getAccountById,
		getAccountByWSN
	}) {
		this.getAccountByIdUseCase = getAccountById;
		this.getAccountByWSNUseCase = getAccountByWSN;

		this.getAccountById = this.getAccountById.bind(this);
		this.getAccountByWSN = this.getAccountByWSN.bind(this);
	}

	async getAccountById(req, res, next) {
		try {
			const { id } = req.params;

			const account = await this.getAccountByIdUseCase.execute({
				accountId: id
			});

			res.status(200).json({
				success: true,
				data: account
			});
		} catch (error) {
			next(error);
		}
	}

	async getAccountByWSN(req, res, next) {
		try {
			const { wsn } = req.params;

			const account = await this.getAccountByWSNUseCase.execute({
				wsn
			});

			res.status(200).json({
				success: true,
				data: account
			});
		} catch (error) {
			next(error);
		}
	}
}