"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { company } from "@/config/company";
import { ProfilePicker } from "@/features/routers/components/profile-picker";
import { ManagedProfileSelect, useManagedProfiles } from "./managed-profile-select";
import { humanize } from "@/lib/format";
import { DISCOUNT_TYPE_OPTIONS, DURATION_UNIT_OPTIONS, NO_DISCOUNT, PLAN_SERVICE_OPTIONS } from "../constants";
import { useAdminPlanActions } from "../hooks/use-plans";
import { toFormValues, toPlanFields } from "../lib/plan-form";
import { PlanFormValues, planFormSchema } from "../schemas/plans.schemas";
import type { Plan } from "../types/plans.types";

function SectionTitle({ children }: { children: React.ReactNode }) {
	return <h3 className="border-b pb-2 text-[11px] uppercase tracking-wider text-muted-foreground">{children}</h3>;
}

export function PlanFormDialog({ plan, onClose }: { plan?: Plan; onClose: () => void }) {
	const { create, update } = useAdminPlanActions();

	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<PlanFormValues>({
		resolver: zodResolver(planFormSchema),
		defaultValues: toFormValues(plan),
	});
	const bonusRules = useFieldArray({ control, name: "bonusRules" });

	const serviceType = watch("serviceType");
	const unlimitedData = watch("unlimitedData");
	const discountType = watch("discountType");
	const isPppoe = serviceType === "pppoe";
	const managed = useManagedProfiles();

	const unitOptions: { value: string; label: string }[] = [...DURATION_UNIT_OPTIONS];
	const currentUnit = toFormValues(plan).durationUnit;
	if (plan && !unitOptions.some((o) => o.value === currentUnit)) {
		unitOptions.push({ value: currentUnit, label: humanize(currentUnit) });
	}

	async function onSubmit(values: PlanFormValues) {
		const fields = toPlanFields(values, plan);
		const res = plan
			? await update.mutateAsync({ id: plan.id, body: fields })
			: await create.mutateAsync({ serviceType: values.serviceType, ...fields });

		if (!res.success) {
			toast.error(res.message);
			return;
		}

		toast.success(plan ? "Plan updated" : "Plan created");
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !isSubmitting && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{plan ? `Edit ${plan.name}` : "New plan"}</DialogTitle>
					<DialogDescription>{plan ? "Update this plan's details." : "Create a plan customers can buy."}</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
					{plan && (
						<Notice
							tone="info"
							title="Changes apply to new purchases"
							text="Existing subscribers keep the price and speed they bought. A renewal uses the plan as it was when they subscribed."
						/>
					)}

					<section className="space-y-4">
						<SectionTitle>Basics</SectionTitle>
						<Field label="Plan name" htmlFor="plan-name" error={errors.name?.message}>
							<Input id="plan-name" autoComplete="off" aria-invalid={!!errors.name} {...register("name")} />
						</Field>
						<Field label="Service" htmlFor="plan-service" hint={plan ? "Can't be changed after a plan is created." : undefined}>
							<Controller
								control={control}
								name="serviceType"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange} disabled={!!plan}>
										<SelectTrigger id="plan-service" className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{PLAN_SERVICE_OPTIONS.map((o) => (
												<SelectItem key={o.value} value={o.value}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</Field>
					</section>

					<section className="space-y-4">
						<SectionTitle>Price and duration</SectionTitle>
						<div className="grid gap-4 sm:grid-cols-3">
							<Field label={`Price (${company.currency.symbol})`} htmlFor="plan-price" error={errors.price?.message}>
								<Input id="plan-price" inputMode="decimal" aria-invalid={!!errors.price} {...register("price")} />
							</Field>
							<Field label="Lasts" htmlFor="plan-duration" error={errors.durationValue?.message}>
								<Input id="plan-duration" inputMode="numeric" aria-invalid={!!errors.durationValue} {...register("durationValue")} />
							</Field>
							<Field label="Unit" htmlFor="plan-unit" error={errors.durationUnit?.message}>
								<Controller
									control={control}
									name="durationUnit"
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger id="plan-unit" className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{unitOptions.map((o) => (
													<SelectItem key={o.value} value={o.value}>
														{o.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
							</Field>
						</div>
					</section>

					<section className="space-y-4">
						<SectionTitle>Speed and limits</SectionTitle>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="Speed" htmlFor="plan-speed" error={errors.speedRate?.message} hint="For example 10Mbps">
								<Input id="plan-speed" autoComplete="off" aria-invalid={!!errors.speedRate} {...register("speedRate")} />
							</Field>
							<Field label="Devices allowed" htmlFor="plan-devices" error={errors.devicesAllowed?.message}>
								<Input id="plan-devices" inputMode="numeric" aria-invalid={!!errors.devicesAllowed} {...register("devicesAllowed")} />
							</Field>
						</div>

						<div className="space-y-2">
							<Controller
								control={control}
								name="unlimitedData"
								render={({ field }) => (
									<label className="flex items-center gap-2 text-[13px]">
										<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
										Unlimited data
									</label>
								)}
							/>
							{!unlimitedData && (
								<Field label="Data limit (GB)" htmlFor="plan-data" error={errors.dataLimitGb?.message}>
									<Input id="plan-data" inputMode="decimal" aria-invalid={!!errors.dataLimitGb} {...register("dataLimitGb")} />
								</Field>
							)}
						</div>

						{isPppoe && (
							<Field label="Grace period (days)" htmlFor="plan-grace" error={errors.gracePeriodDays?.message} hint="Extra days after expiry before service is cut.">
								<Input id="plan-grace" inputMode="numeric" aria-invalid={!!errors.gracePeriodDays} {...register("gracePeriodDays")} />
							</Field>
						)}
					</section>

					<section className="space-y-4">
						<SectionTitle>Router</SectionTitle>
						{!isPppoe && managed.hasAny ? (
							<Controller
								control={control}
								name="mikrotikProfile"
								render={({ field }) => (
									<ManagedProfileSelect
										id="plan-hotspot-profile"
										label="Speed profile"
										value={field.value}
										onChange={field.onChange}
										allowDefault
										hint="Set in Network config. Customers already online keep their old speed until they reconnect."
										error={errors.mikrotikProfile?.message}
									/>
								)}
							/>
						) : (
							<Controller
								control={control}
								name="mikrotikProfile"
								render={({ field }) => (
									<ProfilePicker value={field.value} onChange={field.onChange} serviceType={serviceType} error={errors.mikrotikProfile?.message} />
								)}
							/>
						)}
						{isPppoe && managed.hasAny && (
							<Controller
								control={control}
								name="ipoeProfile"
								render={({ field }) => (
									<ManagedProfileSelect
										id="plan-ipoe-profile"
										label="Speed profile (IPoE)"
										value={field.value}
										onChange={field.onChange}
										optional
										error={errors.ipoeProfile?.message}
									/>
								)}
							/>
						)}
					</section>

					<section className="space-y-4">
						<SectionTitle>Features</SectionTitle>
						<Field label="What's included" htmlFor="plan-features" hint="One per line. Shown on the plan card.">
							<Textarea id="plan-features" className="min-h-24" {...register("features")} />
						</Field>
					</section>

					<section className="space-y-4">
						<SectionTitle>Discount</SectionTitle>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="Type" htmlFor="plan-discount-type">
								<Controller
									control={control}
									name="discountType"
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger id="plan-discount-type" className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={NO_DISCOUNT}>No discount</SelectItem>
												{DISCOUNT_TYPE_OPTIONS.map((o) => (
													<SelectItem key={o.value} value={o.value}>
														{o.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
							</Field>
							{discountType !== NO_DISCOUNT && (
								<Field label="Amount" htmlFor="plan-discount-value" error={errors.discountValue?.message}>
									<Input id="plan-discount-value" inputMode="decimal" aria-invalid={!!errors.discountValue} {...register("discountValue")} />
								</Field>
							)}
						</div>
						{discountType !== NO_DISCOUNT && (
							<Field label="Valid until (optional)" htmlFor="plan-discount-until">
								<Input id="plan-discount-until" type="date" {...register("discountValidUntil")} />
							</Field>
						)}
					</section>

					{isPppoe && (
						<section className="space-y-4">
							<SectionTitle>Bonus days</SectionTitle>
							<p className="text-[12px] text-muted-foreground">Reward customers who pay for several cycles at once, for example 6 cycles earns 7 bonus days.</p>
							{bonusRules.fields.map((field, index) => (
								<div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-3">
									<Field label="Cycles" htmlFor={`bonus-cycles-${index}`} error={errors.bonusRules?.[index]?.minCycles?.message}>
										<Input id={`bonus-cycles-${index}`} inputMode="numeric" {...register(`bonusRules.${index}.minCycles`)} />
									</Field>
									<Field label="Bonus days" htmlFor={`bonus-days-${index}`} error={errors.bonusRules?.[index]?.bonusDays?.message}>
										<Input id={`bonus-days-${index}`} inputMode="numeric" {...register(`bonusRules.${index}.bonusDays`)} />
									</Field>
									<Button type="button" variant="ghost" size="icon" className="mt-7" aria-label="Remove rule" onClick={() => bonusRules.remove(index)}>
										<Trash2 className="size-4" />
									</Button>
								</div>
							))}
							<Button type="button" variant="outline" size="sm" className="bg-surface-2" onClick={() => bonusRules.append({ minCycles: "", bonusDays: "" })}>
								<Plus />
								Add rule
							</Button>
						</section>
					)}

					<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="animate-spin" />}
						{plan ? "Save changes" : "Create plan"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
