import { asClass, asValue } from "awilix";

// REPOSITORIES
import { PaymentRepositoryMongo } from "./infrastructure/repositories/payment.repository.mongo.js";

// SERVICES
import { PaymentService } from "./services/payment.service.js";
import { PaymentBusinessProcessor } from "./services/payment-business-processor.service.js";
// USECASES
import { CreatePaymentUseCase } from "./usecases/user/create-payment.js";
import { ConfirmPaymentUseCase } from "./usecases/user/confirm-payment.js";
import { ReprocessPaymentUseCase } from "./usecases/user/reprocess-payment.js";
import { ResolvePaymentUseCase } from "./usecases/user/resolve-paymnt.js";

import { AdminRecordPaymentUseCase } from "./usecases/admin/record-payment.js";
import { AdminUpdatePaymentStatusUseCase } from "./usecases/admin/update-payment-status.js";

import { GetPaymentsUseCase } from "./usecases/shared/get-payments.js";
import { GetPaymentByIdUseCase } from "./usecases/shared/get-payment.js";

import { HandleWebhookUseCase } from "./usecases/user/handle-webhook.js";

import { ExpirePendingPaymentsUseCase } from "./usecases/system/expire-pending-payment.js";

// CONTROLLERS
import { PaymentController } from "./controllers/payment.controller.js";
import { PaymentAdminController } from "./controllers/admin.controller.js";

export function registerPayment(container) {

	container.register({

		// -----------------------------
		// REPOSITORY
		// -----------------------------
		paymentRepository: asClass(PaymentRepositoryMongo).singleton(),

		// -----------------------------
		// SERVICES
		// -----------------------------
		paymentService: asClass(PaymentService).singleton(),
		paymentBusinessProcessor: asClass(PaymentBusinessProcessor).scoped(),
		// USECASES
		// -----------------------------
		createPayment: asClass(CreatePaymentUseCase).scoped(),
		confirmPayment: asClass(ConfirmPaymentUseCase).scoped(),
		reprocessPayment: asClass(ReprocessPaymentUseCase).scoped(),
		resolvePayment: asClass(ResolvePaymentUseCase).scoped(),
		

		adminRecordPayment: asClass(AdminRecordPaymentUseCase).scoped(),
		adminUpdatePaymentStatus: asClass(AdminUpdatePaymentStatusUseCase).scoped(),

		getPayments: asClass(GetPaymentsUseCase).scoped(),
		getPaymentById: asClass(GetPaymentByIdUseCase).scoped(),

		handleWebhook: asClass(HandleWebhookUseCase).scoped(),


		expirePendingPayments: asClass(ExpirePendingPaymentsUseCase).scoped(),


		// -----------------------------
		// CONTROLLERS (FULL AWILIX)
		// -----------------------------
		paymentController: asClass(PaymentController).scoped(),
		paymentAdminController: asClass(PaymentAdminController).scoped()
	});

	container.register({
		paystackSecretKey: asValue(process.env.PAYSTACK_SECRET_KEY)
	});
}