// subscription.types.ts

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "suspended"
  | "expired"
  | "canceled";

export type RenewalStrategy =
  | "manual"
  | "auto_renew"
  | "invoice";

export type MikrotikSyncStatus =
  | "pending"
  | "synced"
  | "failed";

export interface Plan {
  _id: string;
  name: string;
  price: number;

  durationValue: number;
  durationUnit:
    | "minutes"
    | "hours"
    | "days"
    | "months";

  speedRate?: string;
  mikrotikProfile?: string;
  devicesAllowed?: number;
  gracePeriodDays?: number;
  dataLimitBytes?: number;
  features?: string[];
  status?: string;
  accountType?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  id: string;
  accountId: string;
  userId: string;
  planId: Plan;

  status: SubscriptionStatus;

  planSnapshot: {
    name: string;
    serviceType: "pppoe" | "hotspot";
    price: number;
    durationValue: number;
    durationUnit:
      | "minutes"
      | "hours"
      | "days"
      | "months";
    speedRate?: string;
    mikrotikProfile?: string;
    devicesAllowed?: number;
    gracePeriodDays?: number;
  };

  cycles: number;
  totalAmount: number;

  startsAt?: string;
  expiresAt: string;
  graceEndsAt?: string;
  activatedAt?: string;
  expiredAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;

  renewalStrategy: RenewalStrategy;
  autoRenewEnabled: boolean;
  nextRenewalDate?: string;
  lastRenewedAt?: string;

  lastPaymentId?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;

  suspendedAt?: string;
  totalSuspendedDuration: number;
  suspensionReason?: string;

  canceledAt?: string;
  cancellationReason?: string;

  bonusDays: number;
  manualAdjustmentDays: number;

  mikrotikStatus: MikrotikSyncStatus;
  mikrotikLastSyncAt?: string;
  mikrotikError?: string;

  events: {
    type:
      | "created"
      | "activated"
      | "renewed"
      | "suspended"
      | "resumed"
      | "expired"
      | "canceled"
      | "manual_adjustment";
    date: string;
    metadata?: Record<string, any>;
  }[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDto {
  accountId: string;
  planId: string;
  cycles?: number;
  reason?: string;
  userId: string;
  overrideExisting: boolean;
  autoRenewEnabled?: boolean;
  renewalStrategy?: RenewalStrategy;
}

export interface AdminCreateSubscriptionDto {
  accountId: string;
  planId: string;
  status?: SubscriptionStatus;
  cycles?: number;
  overrideExisting?: boolean;
  startsAt?: string;
  manualAdjustmentDays?: number;
  bonusDays?: number;
  autoRenewEnabled?: boolean;
  renewalStrategy?: RenewalStrategy;
  gracePeriodDays?: number;
  reason?: string;
}

export interface RenewSubscriptionDto {
  cycles?: number;
}

export interface UpgradeSubscriptionDto {
  planId: string;
  cycles?: number;
}

export interface ExtendSubscriptionDto {
  days: number;
  reason?: string;
}

export interface SubscriptionActionDto {
  reason?: string;
}
export interface AdminRenewSubscriptionDto {
  subscriptionId: string;
  cycles: number;
  reason?: string;
  reference?: string;
}


export interface AdminChangePlanDto {
  accountId: string;
  newPlanId: string;
  reason?: string;
  paymentAdjustment?: number;
}
