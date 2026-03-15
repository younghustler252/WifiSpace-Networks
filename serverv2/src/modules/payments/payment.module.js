// payment.module.js
import { PaymentRepositoryMongo } from "./infrastructure/repositories/payment.repository.mongo.js";

// Usecases - User
import { CreatePaymentUseCase } from "./usecases/user/create-payment.js";
import { ConfirmPaymentUseCase } from "./usecases/user/confirm-payment.js";
import { GetMyPaymentsUseCase } from "./usecases/user/get-my-payments.js";

// Usecases - Admin
import { CreatePaymentUseCase as AdminCreatePaymentUseCase } from "./usecases/admin/create-payment.js";
import { GetPaymentsUseCase } from "./usecases/admin/get-payments.js";
import { AdminUpdatePaymentStatusUseCase } from "./usecases/admin/update-payment-status.js";

// Usecases - Shared
import { GetPaymentByIdUseCase } from "./usecases/shared/get-payment.js";

// Services
import { PaystackPaymentService } from "./services/paystack.service.js";

// Controllers
import { PaymentController } from "./controllers/payment.controller.js";
import { PaymentAdminController } from "./controllers/admin.controller.js";

// Routes
import paymentRoutes from "./routes/payment.routes.js";

export function paymentModule({ planRepository, permissionService, paystackSecretKey }) {

	const paymentRepository = new PaymentRepositoryMongo();

	const paystackService = new PaystackPaymentService({
		repository: paymentRepository,
		secretKey: paystackSecretKey
	});

	const usecases = {
		// ----------------------------
		// User
		// ----------------------------
		createPayment: new CreatePaymentUseCase({
			paymentRepository,
			planRepository
		}),
		confirmPayment: new ConfirmPaymentUseCase({
			paymentRepository,
			paystackService
		}),
		getMyPayments: new GetMyPaymentsUseCase({
			paymentRepository
		}),

		// ----------------------------
		// Admin
		// ----------------------------
		adminCreatePayment: new AdminCreatePaymentUseCase({
			paymentRepository,
			planRepository
		}),
		getPayments: new GetPaymentsUseCase({
			paymentRepository
		}),
		adminUpdatePaymentStatus: new AdminUpdatePaymentStatusUseCase({
			paymentRepository
		}),

		// ----------------------------
		// Shared
		// ----------------------------
		getPaymentById: new GetPaymentByIdUseCase({
			paymentRepository
		})
	};

	const paymentController = new PaymentController(usecases);
	const paymentAdminController = new PaymentAdminController(usecases);

	const routes = paymentRoutes({
		paymentController,
		paymentAdminController,
		permissionService
	});

	return { routes };
}