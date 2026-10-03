import { asClass } from "awilix";
import { PaymentRepositoryMongo } from "./repositories/payment.repository.mongo.js";

import { InitiatePayment } from "./usecases/user/initiate-payment.usecase.js";
import { VerifyPayment } from "./usecases/user/verify-payment.usecase.js";
import { GetMyPayments } from "./usecases/user/get-my-payments.usecase.js";

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

		initiatePayment: asClass(InitiatePayment).scoped(),
		verifyPayment: asClass(VerifyPayment).scoped(),
		getMyPayments: asClass(GetMyPayments).scoped(),

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