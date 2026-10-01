export class GetAllPayments {
	constructor({ paymentRepository }) {
		this.paymentRepository = paymentRepository;
	}
	async execute({ status, gateway, accountId, startDate, endDate, page = 1, limit = 20 } = {}) {
		return this.paymentRepository.paginate({ filter: { status, gateway, accountId, startDate, endDate }, page, limit });
	}
}