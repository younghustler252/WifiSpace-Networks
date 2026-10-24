import { company } from "@/config/company";

function digits(value: string) {
	return value.replace(/\D/g, "");
}

export function getSupportNumber() {
	const raw = company.contact.whatsapp || process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "";
	const number = digits(raw);
	return number.length >= 8 ? number : null;
}

export function getSupportPhone() {
	const raw = company.contact.phone;
	return raw ? raw.replace(/[^\d+]/g, "") : null;
}

export function whatsappHref(message: string) {
	const number = getSupportNumber();
	if (!number) return null;
	return `whatsapp://send?phone=${number}&text=${encodeURIComponent(message)}`;
}

interface SupportContext {
	issue: string;
	location?: string | null;
	routerCode?: string | null;
	reference?: string | null;
	macAddress?: string | null;
}

export function buildSupportMessage({ issue, location, routerCode, reference, macAddress }: SupportContext) {
	const lines = [`Hi ${company.name}, I need help with the hotspot wifi.`, issue];
	if (location) lines.push(`Location: ${location}`);
	if (routerCode) lines.push(`Router: ${routerCode}`);
	if (reference) lines.push(`Payment reference: ${reference}`);
	if (macAddress) lines.push(`Device: ${macAddress}`);
	return lines.join("\n");
}
