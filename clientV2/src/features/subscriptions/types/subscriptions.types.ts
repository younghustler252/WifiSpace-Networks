import type { AdminAccount } from "@/features/accounts/types/accounts.types";
import type { NetworkRouter } from "@/features/routers/types/routers.types";

export type AutoRenewMethod = "wallet" | "card" | "wallet_then_card";

export interface AutoRenewBody {
	enabled: boolean;
	method?: AutoRenewMethod;
	cardId?: string | null;
}

export interface AutoRenewResult {
	subscriptionId: string;
	autoRenewEnabled: boolean;
	method: AutoRenewMethod | null;
	cardId: string | null;
	nextRenewalDate: string | null;
	renewalPrice: number;
	walletBalance: number;
	walletShortfall: number;
	lastError: string | null;
}

export interface SubscriptionEvent {
	type: string;
	date: string;
	metadata?: Record<string, unknown> | null;
}

export interface AdminSubscriptionDetailRaw {
	subscription: Subscription;
	account: AdminAccount | null;
	router: NetworkRouter | null;
	routers: NetworkRouter[] | null;
}

export interface AdminSubscriptionDetail extends Omit<AdminSubscriptionDetailRaw, "routers"> {
	routers: NetworkRouter[];
}

export interface PlanSnapshot {
	name: string;
	serviceType?: string;
	price: number;
	durationValue: number;
	durationUnit: string;
	speedRate?: string;
	mikrotikProfile?: string;
	devicesAllowed?: number;
	gracePeriodDays?: number;
}

export interface Subscription {
	id: string;
	accountId: string;
	planId: string;
	status: string;
	planSnapshot: PlanSnapshot;
	cycles: number;
	totalAmount: number;
	startsAt: string | null;
	expiresAt: string | null;
	graceEndsAt: string | null;
	bonusDays: number;
	renewalStrategy: string;
	autoRenewEnabled: boolean;
	autoRenewMethod?: AutoRenewMethod | null;
	autoRenewCardId?: string | null;
	autoRenewAttempts?: number;
	lastAutoRenewAttemptAt?: string | null;
	lastAutoRenewError?: string | null;
	mikrotikStatus?: string;
	createdAt: string | null;
	expiredAt?: string | null;
	updatedAt?: string | null;

	// add inside interface Subscription
	userId?: string;
	activatedAt?: string | null;
	suspendedAt?: string | null;
	suspensionReason?: string | null;
	canceledAt?: string | null;
	cancellationReason?: string | null;
	manualAdjustmentDays?: number;
	mikrotikError?: string | null;
	mikrotikLastSyncAt?: string | null;
	events?: SubscriptionEvent[];
	currentPeriodStart?: string | null;
	currentPeriodEnd?: string | null;
	nextRenewalDate?: string | null;
	lastRenewedAt?: string | null;
	lastPaymentDate?: string | null;
	lastPaymentAmount?: number | null;
	totalSuspendedDuration?: number;
}

export interface AdminSubscriptionListParams {
	accountId?: string;
	mikrotikStatus?: string;
	userId?: string;
	status?: string;
	page?: number;
	limit?: number;
}

export interface AdminCreateSubscriptionBody {
	accountId: string;
	planId: string;
	cycles?: number;
	activateImmediately?: boolean;
	startDate?: string;
}

export interface UpgradeOption {
	id: string;
	name: string;
	price: number;
	serviceType?: string;
	durationValue: number;
	durationUnit: string;
	speedRate?: string;
	devicesAllowed?: number;
	gracePeriodDays?: number;
}