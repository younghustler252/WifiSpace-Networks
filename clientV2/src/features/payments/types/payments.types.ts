import { NetworkRouter } from "@/features/routers/types/routers.types";

export type PaymentStatus = "initiated" | "pending" | "successful" | "failed" | (string & {});

export interface InitPaymentBody {
	accountId: string;
	planId: string;
	cycles?: number;
	callbackUrl: string;
}

export interface InitPaymentResult {
	authorizationUrl: string;
}

export interface VerifyPaymentResult {
	status: PaymentStatus;
}

export interface Payment {
	id: string;
	amount: { total: number; base: number; discount: number };
	status: PaymentStatus;
	gateway: string;
	gatewayReference: string;
	processedAt: string | null;
	createdAt?: string;
}

export interface AdminPayment extends Omit<Payment, "amount"> {
	amount: Payment["amount"] | number;
	userId?: string;
	accountId?: string;
	subscriptionId?: string | null;
	planId?: string;
	actionType?: string;
	cycles?: number;
	currency?: string;
	paymentChannel?: string | null;
	businessProcessed?: boolean;
	failedAt?: string | null;
	failureReason?: string | null;
	paymentDate?: string | null;
	metadata?: Record<string, unknown> | null;
	user?: PaymentPerson | null;
	account?: {
		id?: string;
		wsnId?: string;
		serviceType?: string;
	} | null;
	plan?: {
		id?: string;
		name?: string;
	} | null;
}

export interface AdminPaymentListParams {
	status?: string;
	search?: string;
	page?: number;
	limit?: number;
	userId?: string;
	accountId?: string;
	subscriptionId?: string;
}

export interface RecordPaymentBody {
	accountId: string;
	planId: string;
	cycles?: number;
	paymentChannel?: string;
	note?: string;
}

export type SettablePaymentStatus = "successful" | "failed" | "expired";

export interface UpdatePaymentStatusBody {
	status: SettablePaymentStatus;
	reason?: string;
}

export interface PaymentPerson {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string | null;
}

export interface AdminPaymentDetail {
	payment: AdminPayment;
	router: NetworkRouter | null;
}
