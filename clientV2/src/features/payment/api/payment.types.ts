import { Account } from "@/lib/api/types";

// ===================================
// ENUM TYPES (MATCH BACKEND)
// ===================================

// CHANGED: was missing "downgrade" and "admin_bypass" — payment.enum.js's
// PAYMENT_ACTIONS has both. "downgrade" was added a while back alongside
// upgrade; "admin_bypass" was already on the backend but never reflected here.
export type PaymentActionType = "new_subscription" | "renewal" | "upgrade" | "downgrade" | "admin_bypass";

export type PaymentStatus = "initiated" | "pending" | "successful" | "failed" | "expired";

export type PaymentChannel = "card" | "bank_transfer" | "ussd" | "cash";

export type PaymentGateway = "paystack" | "manual";

// ===================================
// TYPES
// ===================================
export interface PlanRef {
	_id: string;
	name: string;
	price: number;
}

// REQUEST TYPES
export interface CreatePaymentDto {
	accountId: string;
	planId: string;
	subscriptionId?: string;
	cycles?: number;
	paymentChannel?: PaymentChannel;
	// NOTE: not adding callbackUrl here — this is the generic subscription
	// payment path, the default (/payments/callback) is the right landing
	// page for it. HotspotCheckoutFlow is the one that needs to override it.
}

export interface ConfirmPaymentDto {
	reference: string;
}

// RESPONSE TYPES
export interface PaymentAmount {
	total: number;
	base: number;
	discount: number;
}

export interface Payment {
	id: string;

	userId: string;
	accountId: Account;
	subscriptionId?: string | null;
	planId?: PlanRef;
	account?: Account;

	amount: PaymentAmount;
	cycles: number;

	status: PaymentStatus;

	paymentChannel?: PaymentChannel | null;
	actionType?: PaymentActionType;
	gateway: PaymentGateway;
	gatewayReference?: string;

	idempotencyKey?: string;

	// REMOVED: `processed?: boolean` — didn't correspond to anything on the
	// actual Payment schema (only businessProcessed and isWebhookProcessed
	// exist there). Confirm nothing on your side was actually reading this
	// before dropping it for good — it looked like a stale/confused
	// duplicate of businessProcessed rather than a real field.
	businessProcessed?: boolean;
	isWebhookProcessed?: boolean;

	paymentDate: string;
	processedAt?: string;
	failedAt?: string;
	failureReason?: string;

	createdAt: string;
	updatedAt: string;

	metadata?: Record<string, any>;
}

export interface PaystackInitResponse {
	status: boolean;
	message: string;
	data: {
		authorization_url: string;
		access_code: string;
		reference: string;
	};
}

export interface CreatePaymentResponse {
	payment: Payment;
	// CHANGED: was `paystack?: {...}` — paymentService.initiatePayment() now
	// returns { payment, gatewayResponse }, renamed to stop baking "Paystack"
	// into a field meant to survive a second gateway being added later.
	gatewayResponse?: PaystackInitResponse;
}

export interface ConfirmPaymentResponse {
	payment: Payment;
	gatewayResponse?: any;
	alreadyProcessed?: boolean;
	// NEW: ConfirmPaymentUseCase actually returns these now — success/
	// autoConnected weren't reflected here before. Relevant beyond hotspot
	// too, since PPPoE/renewal activation also goes through networkService
	// now and can genuinely fail even when the payment itself succeeded.
	success?: boolean;
	autoConnected?: boolean;
}

// pagination
export interface PaymentListData {
	data: Payment[];
	pagination: {
		total: number;
		skip: number;
		limit: number;
		totalPages: number;
	};
}

export interface ResolvePaymentDto {
	reference: string;
}

export interface ResolvePaymentResponse {
	reference: string;
	serviceType: string;
	redirectTo: string;
}