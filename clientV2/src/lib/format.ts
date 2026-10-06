import { company } from "@/config/company";

export function formatCurrency(amount: number) {
	return new Intl.NumberFormat(company.currency.locale, {
		style: "currency",
		currency: company.currency.code,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

const UNIT_DAYS: Record<string, number> = { minute: 1 / 1440, hour: 1 / 24, day: 1, week: 7, month: 30 };

function normalizeUnit(unit: string) {
	return unit.toLowerCase().replace(/s$/, "");
}

export function durationInDays(value: number, unit: string) {
	return value * (UNIT_DAYS[normalizeUnit(unit)] ?? 1);
}

export function formatDuration(value: number, unit: string) {
	return `${value} ${normalizeUnit(unit)}${value === 1 ? "" : "s"}`;
}

export function formatBytes(bytes: number) {
	const units = ["B", "KB", "MB", "GB", "TB"];
	const i = bytes > 0 ? Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1) : 0;
	const value = bytes / 1024 ** i;
	return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export function formatDataLimit(bytes: number) {
	return bytes <= 0 ? "Unlimited data" : formatBytes(bytes);
}

export function formatRemaining(seconds: number) {
	if (seconds <= 0) return "0m";
	const d = Math.floor(seconds / 86400);
	const h = Math.floor((seconds % 86400) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	if (d > 0) return `${d}d ${h}h`;
	if (h > 0) return `${h}h ${m}m`;
	return `${Math.max(m, 1)}m`;
}

export function formatDateTime(iso: string) {
	return new Intl.DateTimeFormat(company.currency.locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function formatDate(iso: string) {
	return new Intl.DateTimeFormat(company.currency.locale, { dateStyle: "medium" }).format(new Date(iso));
}


export function formatRelative(iso: string) {
	if (!iso) return "";
	const diff = (new Date(iso).getTime() - Date.now()) / 1000;
	const abs = Math.abs(diff);
	if (abs >= 7 * 86400) return formatDate(iso);

	const rtf = new Intl.RelativeTimeFormat(company.currency.locale, { numeric: "auto" });
	const steps: [Intl.RelativeTimeFormatUnit, number][] = [
		["day", 86400],
		["hour", 3600],
		["minute", 60],
	];
	for (const [unit, seconds] of steps) {
		if (abs >= seconds) return rtf.format(Math.round(diff / seconds), unit);
	}
	return "just now";
}

export function formatNumber(value: number) {
	return new Intl.NumberFormat(company.currency.locale).format(value);
}


export function humanize(value: string) {
	const text = value.replace(/_/g, " ");
	return text.charAt(0).toUpperCase() + text.slice(1);
}

function safeDecode(value: string) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export function formatMac(mac: string) {
	let value = mac.trim();
	for (let i = 0; i < 2; i += 1) value = safeDecode(value);
	return value.replace(/-/g, ":").toUpperCase();
}