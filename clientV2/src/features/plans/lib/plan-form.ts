import { BYTES_PER_GB, DURATION_UNIT_OPTIONS, NO_ACCOUNT_TYPE, NO_DISCOUNT } from "../constants";
import type { PlanFormValues } from "../schemas/plans.schemas";
import type { Plan, PlanFields } from "../types/plans.types";

function matchUnit(unit: string) {
	const bare = unit.toLowerCase().replace(/s$/, "");
	return DURATION_UNIT_OPTIONS.find((o) => o.value.replace(/s$/, "") === bare)?.value ?? unit;
}

export function toFormValues(plan?: Plan): PlanFormValues {
	const limit = plan?.dataLimitBytes ?? 0;

	return {
		name: plan?.name ?? "",
		serviceType: plan?.serviceType ?? "hotspot",
		accountType: plan?.accountType ?? NO_ACCOUNT_TYPE,
		price: plan ? String(plan.price) : "",
		speedRate: plan?.speedRate ?? "",
		durationValue: plan ? String(plan.durationValue) : "1",
		durationUnit: plan ? matchUnit(plan.durationUnit) : "days",
		unlimitedData: limit <= 0,
		dataLimitGb: limit > 0 ? String(Math.round((limit / BYTES_PER_GB) * 100) / 100) : "",
		devicesAllowed: String(plan?.devicesAllowed ?? 1),
		gracePeriodDays: plan?.gracePeriodDays !== undefined ? String(plan.gracePeriodDays) : "",
		mikrotikProfile: plan?.mikrotikProfile ?? "",
		ipoeProfile: plan?.ipoeProfile ?? "",
		features: (plan?.features ?? []).join("\n"),
		discountType: plan?.discountType ?? NO_DISCOUNT,
		discountValue: plan?.discountValue != null ? String(plan.discountValue) : "",
		discountValidUntil: plan?.discountValidUntil ? plan.discountValidUntil.slice(0, 10) : "",
		bonusRules: (plan?.bonusRules ?? []).map((r) => ({ minCycles: String(r.minCycles), bonusDays: String(r.bonusDays) })),
	};
}

export function toPlanFields(values: PlanFormValues, previous?: Plan): PlanFields {
	const isPppoe = values.serviceType === "pppoe";

	const fields: PlanFields = {
		name: values.name.trim(),
		price: Number(values.price),
		speedRate: values.speedRate.trim(),
		durationValue: Number(values.durationValue),
		durationUnit: values.durationUnit,
		dataLimitBytes: values.unlimitedData ? 0 : Math.round(Number(values.dataLimitGb) * BYTES_PER_GB),
		devicesAllowed: Number(values.devicesAllowed),
		features: values.features
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean),
		mikrotikProfile: values.mikrotikProfile.trim(),
	};

	if (isPppoe) fields.ipoeProfile = values.ipoeProfile.trim() || null;

	if (isPppoe && values.accountType !== NO_ACCOUNT_TYPE) fields.accountType = values.accountType;

	if (isPppoe && values.gracePeriodDays.trim() !== "") fields.gracePeriodDays = Number(values.gracePeriodDays);

	if (values.discountType !== NO_DISCOUNT) {
		fields.discountType = values.discountType;
		fields.discountValue = Number(values.discountValue);
		if (values.discountValidUntil) {
			fields.discountValidUntil = new Date(`${values.discountValidUntil}T23:59:59`).toISOString();
		}
	} else if (previous?.discountType) {
		fields.discountValue = 0;
	}

	if (isPppoe) {
		fields.bonusRules = values.bonusRules.map((r) => ({ minCycles: Number(r.minCycles), bonusDays: Number(r.bonusDays) }));
	}

	return fields;
}
