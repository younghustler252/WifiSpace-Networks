import { company } from "@/config/company";

export function formatWalletAmount(amount: number) {
	const whole = Number.isInteger(amount);
	return new Intl.NumberFormat(company.currency.locale, {
		style: "currency",
		currency: company.currency.code,
		minimumFractionDigits: whole ? 0 : 2,
		maximumFractionDigits: 2,
	}).format(amount);
}
