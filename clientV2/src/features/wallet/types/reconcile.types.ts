export type ReconcileRowStatus = "already_credited" | "would_credit" | "credited" | "unmatched";

export interface ReconcileRow {
	reference: string;
	amount: number;
	accountNumber: string | null;
	email: string | null;
	sender: string | null;
	paidAt: string | null;
	status: ReconcileRowStatus;
}

export interface ReconcileSummary {
	mode: string;
	from: string;
	to: string;
	found: number;
	alreadyCredited: number;
	wouldCredit: number;
	credited: number;
	unmatched: number;
	requeried: number;
}

export interface ReconcileResult {
	summary: ReconcileSummary;
	rows: ReconcileRow[];
	requeried: unknown[];
}

export interface ReconcileBody {
	days: number;
	apply: boolean;
	requery?: boolean;
}
