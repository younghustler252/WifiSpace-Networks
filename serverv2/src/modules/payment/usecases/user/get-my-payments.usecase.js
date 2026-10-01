export class GetMyPayments {
	constructor({ paymentRepository }) {
		this.paymentRepository = paymentRepository;
	}
	async execute({ userId }) {
		return this.paymentRepository.findByUser(userId);
	}
}