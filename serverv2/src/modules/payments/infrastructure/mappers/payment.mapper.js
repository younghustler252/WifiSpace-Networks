import { Payment } from "../../domain/payment.entity.js";

export class PaymentMapper {
	// Converts the DB document to a Payment entity
	static toDomain(doc) {
		if (!doc) return null;

		return new Payment({
			id: doc._id,
			userId: doc.userId,
			accountId: doc.accountId,
			wsnId: doc.wsnId,
			planId: doc.planId,
			amount: doc.amount,
			cycles: doc.cycles, // Updated from monthsPaid to cycles
			bonusDays: doc.bonusDays,
			method: doc.method,
			status: doc.status,
			transactionId: doc.transactionId,
			paymentDate: doc.paymentDate,
			paymentDetails: doc.paymentDetails,
			processed: doc.processed // Ensure this flag is handled
		});
	}

	// Converts the Payment entity to a DB persistence document
	static toPersistence(payment) {
		return {
			userId: payment.userId,
			accountId: payment.accountId,
			wsnId: payment.wsnId,
			planId: payment.planId,
			amount: payment.amount,
			cycles: payment.cycles, // Updated from monthsPaid to cycles
			bonusDays: payment.bonusDays,
			method: payment.method,
			status: payment.status,
			transactionId: payment.transactionId,
			paymentDate: payment.paymentDate,
			paymentDetails: payment.paymentDetails,
			processed: payment.processed // Ensure this flag is saved
		};
	}
}