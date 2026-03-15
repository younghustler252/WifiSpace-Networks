// modules/payments/infrastructure/mappers/payment.mapper.js
import { Payment } from "../../domain/payment.entity.js";

export class PaymentMapper {
	static toDomain(doc) {
		if (!doc) return null;
		return new Payment({
			id: doc._id,
			userId: doc.userId,
			accountId: doc.accountId,
			wsnId: doc.wsnId,
			planId: doc.planId,
			amount: doc.amount,
			monthsPaid: doc.monthsPaid,
			bonusDays: doc.bonusDays,
			method: doc.method,
			status: doc.status,
			transactionId: doc.transactionId,
			paymentDate: doc.paymentDate,
			subscriptionStartDate: doc.subscriptionStartDate,
			subscriptionEndDate: doc.subscriptionEndDate,
			paymentDetails: doc.paymentDetails
		});
	}

	static toPersistence(payment) {
		return {
			userId: payment.userId,
			accountId: payment.accountId,
			wsnId: payment.wsnId,
			planId: payment.planId,
			amount: payment.amount,
			monthsPaid: payment.monthsPaid,
			bonusDays: payment.bonusDays,
			method: payment.method,
			status: payment.status,
			transactionId: payment.transactionId,
			paymentDate: payment.paymentDate,
			subscriptionStartDate: payment.subscriptionStartDate,
			subscriptionEndDate: payment.subscriptionEndDate,
			paymentDetails: payment.paymentDetails
		};
	}
}