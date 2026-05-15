import { PaymentRepositoryMongo } from "./infrastructure/repositories/payment.repository.mongo.js";
import { UserRepositoryMongo } from "../user/infrastructure/repositories/user.repository.mongo.js";
import { SubscriptionRepositoryMongo } from "../subscription/infrastructure/repositories/subscription.respository.mongo.js";
import { PlanRepositoryMongo } from "../plan/infrastructure/repositories/plan.repository.mongo.js";

import { CreateSubscriptionUseCase } from "../subscription/usecases/account/create-subscription.js";

// =============================
// USER USECASES
// =============================
import { CreatePaymentUseCase } from "./usecases/user/create-payment.js";
import { ConfirmPaymentUseCase } from "./usecases/user/confirm-payment.js";

// =============================
// ADMIN USECASES
// =============================
import { AdminCreatePaymentUseCase } from "./usecases/admin/create-payment.js";
import { AdminUpdatePaymentStatusUseCase } from "./usecases/admin/update-payment-status.js";

// =============================
// SHARED
// =============================
import { GetPaymentsUseCase } from "./usecases/shared/get-payments.js";
import { GetPaymentByIdUseCase } from "./usecases/shared/get-payment.js";
import { HandleWebhookUseCase } from "./usecases/user/handle-webhook.js";


// =============================
// SERVICES
// =============================
import { PaystackPaymentService } from "./services/paystack.service.js";
import { PaystackGateway } from "./infrastructure/paystack/paystack.gateway.js";
// =============================
// CONTROLLERS
// =============================
import { PaymentController } from "./controllers/payment.controller.js";
import { PaymentAdminController } from "./controllers/admin.controller.js";

// =============================
// ROUTES
// =============================
import paymentRoutes from "./routes/payment.routes.js";

export function paymentModule({
	planRepository,
	accountRepository,
	mikrotikService,
	permissionService,
	paystackSecretKey
}) {
	// -----------------------------
	// REPOSITORY
	// -----------------------------
	const paymentRepository = new PaymentRepositoryMongo();
	const userRepository = new UserRepositoryMongo();
	const subscriptionRepository = new SubscriptionRepositoryMongo();
	// const planRepository = new PlanRepositoryMongo();

	const createSubscriptionUseCase = new CreateSubscriptionUseCase({
		subscriptionRepository,
		planRepository
	});


	// -----------------------------
	// PAYSTACK SERVICE
	// -----------------------------
	const paystackGateway = new PaystackGateway({
		secretKey: process.env.PAYSTACK_SECRET_KEY
	});

	const paystackPaymentService = new PaystackPaymentService({
		paystackGateway, // ✅ REQUIRED
		repository: paymentRepository,
		createSubscriptionUseCase
	});

	// -----------------------------
	// USECASES
	// -----------------------------
	const usecases = {
		// =========================
		// USER
		// =========================
		createPayment: new CreatePaymentUseCase({
			paystackPaymentService,
			planRepository,
			userRepository
		}),

		confirmPayment: new ConfirmPaymentUseCase({
			paymentRepository,
			paystackPaymentService,
			createSubscriptionUseCase,
			accountRepository
		}),

		// =========================
		// ADMIN
		// =========================
		adminCreatePayment: new AdminCreatePaymentUseCase({
			paymentRepository,
			planRepository
		}),

		getPayments: new GetPaymentsUseCase({
			paymentRepository,
			accountRepository
		}),

		adminUpdatePaymentStatus:
			new AdminUpdatePaymentStatusUseCase({
				paymentRepository,
				createSubscriptionUseCase,
				accountRepository
			}),

		// =========================
		// SHARED
		// =========================
		handleWebhook: new HandleWebhookUseCase({
			paystackPaymentService,
			ConfirmPaymentUseCase
		}),

		getPaymentById: new GetPaymentByIdUseCase({
			paymentRepository
		})
	};

	// -----------------------------
	// CONTROLLERS
	// -----------------------------
	const paymentController =
		new PaymentController(usecases);

	const paymentAdminController =
		new PaymentAdminController(usecases);

	// -----------------------------
	// ROUTES
	// -----------------------------
	const routes = paymentRoutes({
		paymentController,
		paymentAdminController,
		permissionService,
		userRepository
	});

	return { routes };
}