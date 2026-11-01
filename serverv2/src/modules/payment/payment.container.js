import { asClass } from "awilix";
import { PaymentRepositoryMongo } from "./repositories/payment.repository.mongo.js";
import { SavedCardRepositoryMongo } from "./repositories/saved-card.repository.mongo.js";

import { InitiatePayment } from "./usecases/user/initiate-payment.usecase.js";
import { VerifyPayment } from "./usecases/user/verify-payment.usecase.js";
import { GetMyPayments } from "./usecases/user/get-my-payments.usecase.js";
import { ChargeSavedCard } from "./usecases/user/charge-saved-card.usecase.js";
import { GetMySavedCards, RemoveSavedCard, SetDefaultSavedCard } from "./usecases/user/saved-cards.usecases.js";

import { ProcessSuccessfulPayment } from "./usecases/system/process-successful-payment.usecase.js";
import { HandleWebhook } from "./usecases/system/handle-webhook.usecase.js";
import { ExpirePendingPayments } from "./usecases/system/expire-pending-payments.usecase.js";

import { RecordPayment } from "./usecases/admin/record-payment.usecase.js";
import {UpdatePaymentStatus } from "./usecases/admin/update-payment-status.usecase.js";
import { GetAllPayments } from "./usecases/admin/get-all-payments.usecase.js";
import { GetPaymentById } from "./usecases/admin/get-payment-by-id.usecase.js";

import { PaymentController } from "./controllers/payment.controller.js";
import { WebhookController } from "./controllers/webhook.controller.js";
import { AdminController } from "./controllers/admin.controller.js";

export function registerPayment(container) {
	container.register({
		paymentRepository: asClass(PaymentRepositoryMongo).singleton(),
		savedCardRepository: asClass(SavedCardRepositoryMongo).singleton(),

		initiatePayment: asClass(InitiatePayment).scoped(),
		verifyPayment: asClass(VerifyPayment).scoped(),
		getMyPayments: asClass(GetMyPayments).scoped(),
		chargeSavedCard: asClass(ChargeSavedCard).scoped(),
		getMySavedCards: asClass(GetMySavedCards).scoped(),
		removeSavedCard: asClass(RemoveSavedCard).scoped(),
		setDefaultSavedCard: asClass(SetDefaultSavedCard).scoped(),

		processSuccessfulPayment: asClass(ProcessSuccessfulPayment).scoped(),
		handleWebhook: asClass(HandleWebhook).scoped(),
		expirePendingPayments: asClass(ExpirePendingPayments).scoped(),

		recordPayment: asClass(RecordPayment).scoped(),
		updatePaymentStatus: asClass(UpdatePaymentStatus).scoped(),
		getAllPayments: asClass(GetAllPayments).scoped(),
		getPaymentById: asClass(GetPaymentById).scoped(),

		paymentController: asClass(PaymentController).scoped(),
		webhookController: asClass(WebhookController).scoped(),
		paymentAdminController: asClass(AdminController).scoped()
	});
}