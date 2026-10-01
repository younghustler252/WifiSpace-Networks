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