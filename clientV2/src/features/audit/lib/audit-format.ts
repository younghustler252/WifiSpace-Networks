import type { StatusTone } from "@/components/shared/status-badge";
import { humanize } from "@/lib/format";

const DANGER = /(DELETE|BAN|SUSPEND|TERMINATE|REJECT|FAIL|CANCEL|EXPIRE|REBOOT|DEACTIVAT)/;
const SUCCESS = /(CREATE|APPROVE|ACTIVAT|RESUME|SUCCESS|RENEW|LOGIN|UNBAN)/;

export function getActionTone(action: string): StatusTone {
	if (DANGER.test(action)) return "danger";
	if (SUCCESS.test(action)) return "success";
	return "info";
}

export const actionLabel = (action: string) => humanize(action.toLowerCase());

export function formatValue(value: unknown) {
	if (value === undefined || value === null || value === "") return "—";
	if (typeof value === "string") return value;
	return JSON.stringify(value);
}

export function changedKeys(oldValue: Record<string, unknown> | null, newValue: Record<string, unknown> | null) {
	return Array.from(new Set([...Object.keys(oldValue ?? {}), ...Object.keys(newValue ?? {})]));
}