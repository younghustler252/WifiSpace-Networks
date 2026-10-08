"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouters } from "@/features/routers/hooks/use-routers";
import { describeRouterProblem, routerStatusLabel } from "@/features/routers/lib/router-health";
import { toastWithProvisioning } from "@/features/subscriptions/lib/provisioning";
import { settleFailure } from "@/lib/api/failure";
import { useAdminAccountActions } from "../hooks/use-accounts";
import { buildAccountPatch, toAccountFormValues } from "../lib/account-form";
import { EditAccountValues, editAccountSchema } from "../schemas/accounts.schemas";
import type { AdminAccount } from "../types/accounts.types";

function SectionTitle({ children }: { children: React.ReactNode }) {
	return <h3 className="border-b pb-2 text-[11px] uppercase tracking-wider text-muted-foreground">{children}</h3>;
}

export function EditAccountDialog({ account, onClose }: { account: AdminAccount; onClose: () => void }) {
	const { update } = useAdminAccountActions();
	const isPppoe = account.serviceType === "pppoe";
	const routers = useRouters({ limit: 100 }, isPppoe);

	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting, dirtyFields },
	} = useForm<EditAccountValues>({
		resolver: zodResolver(editAccountSchema),
		defaultValues: toAccountFormValues(account),
	});

	const accountType = watch("accountType");
	const routerId = watch("routerId");
	const moving = isPppoe && !!account.routerId && routerId !== account.routerId;

	const options = (routers.data?.items ?? [])
		.filter((r) => r.id === account.routerId || (r.isEnabled !== false && (r.supportedServices ?? []).includes("pppoe")))
		.sort((a, b) => Number(!!b.isDefaultRouter) - Number(!!a.isDefaultRouter));
	const target = options.find((r) => r.id === routerId);
	const targetIssue = moving && target ? describeRouterProblem(target) : null;

	async function onSubmit(values: EditAccountValues) {
		const body = buildAccountPatch(values, dirtyFields);
		if (Object.keys(body).length === 0) {
			toast.info("Nothing to update");
			onClose();
			return;
		}

		const res = await update.mutateAsync({ id: account.id, body });
		if (!res.success) {
			if (settleFailure(res, "The update")) onClose();
			return;
		}

		toastWithProvisioning(body.routerId ? "Customer moved to the new router" : "Account updated", res.data);
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !isSubmitting && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit {account.wsnId}</DialogTitle>
					<DialogDescription>Only the fields you change are saved.</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
					{isPppoe ? (
						<>
							<section className="space-y-4">
								<SectionTitle>Router</SectionTitle>
								<Field label="Router" htmlFor="edit-router" error={errors.routerId?.message}>
									<Controller
										control={control}
										name="routerId"
										render={({ field }) => (
											<Select value={field.value || undefined} onValueChange={field.onChange}>
												<SelectTrigger id="edit-router" className="w-full" aria-invalid={!!errors.routerId}>
													<SelectValue placeholder={routers.isLoading ? "Loading routers…" : "Select a router"} />
												</SelectTrigger>
												<SelectContent>
													{options.map((router) => (
														<SelectItem key={router.id} value={router.id}>
															{router.name} · {router.code}
															{router.isDefaultRouter ? " (default)" : ""}
															{router.status === "online" ? "" : ` · ${routerStatusLabel(router) ?? router.status}`}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
								</Field>

								{moving && (
									<Notice
										tone="warning"
										title="This moves the customer to another router"
										text="The old router is cleaned up and the new one is set up automatically. The customer may lose connection briefly while that happens."
									/>
								)}
								{targetIssue && (
									<Notice
										tone={targetIssue.tone}
										title={`${target?.name}: ${targetIssue.title}`}
										text="The move is queued and retried automatically once the router's API is reachable."
									/>
								)}

								<Field label="Router profile" htmlFor="edit-profile" hint="Normally set from the plan. Change it only if you know it exists on the router.">
									<Input id="edit-profile" autoComplete="off" {...register("routerProfile")} />
								</Field>
							</section>

							<section className="space-y-4">
								<SectionTitle>Customer</SectionTitle>
								<Field label="Customer type" htmlFor="edit-type">
									<Controller
										control={control}
										name="accountType"
										render={({ field }) => (
											<Select value={field.value} onValueChange={field.onChange}>
												<SelectTrigger id="edit-type" className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="personal">Personal</SelectItem>
													<SelectItem value="business">Business</SelectItem>
												</SelectContent>
											</Select>
										)}
									/>
								</Field>

								{accountType === "business" && (
									<>
										<Field label="Business name" htmlFor="edit-business" error={errors.businessName?.message}>
											<Input id="edit-business" autoComplete="off" aria-invalid={!!errors.businessName} {...register("businessName")} />
										</Field>
										<div className="grid gap-4 sm:grid-cols-2">
											<Field label="Registration number" htmlFor="edit-reg">
												<Input id="edit-reg" autoComplete="off" {...register("companyRegistrationNumber")} />
											</Field>
											<Field label="Tax ID" htmlFor="edit-tax">
												<Input id="edit-tax" autoComplete="off" {...register("taxId")} />
											</Field>
										</div>
									</>
								)}

								<div className="grid gap-4 sm:grid-cols-2">
									<Field label="Static IP" htmlFor="edit-ip" error={errors.staticIp?.message} hint="For reference only.">
										<Input id="edit-ip" autoComplete="off" aria-invalid={!!errors.staticIp} {...register("staticIp")} />
									</Field>
									<Field label="Uptime limit" htmlFor="edit-uptime" error={errors.limitUptime?.message} hint="0 means no limit.">
										<Input id="edit-uptime" inputMode="numeric" aria-invalid={!!errors.limitUptime} {...register("limitUptime")} />
									</Field>
								</div>
							</section>

							<section className="space-y-4">
								<SectionTitle>Install location</SectionTitle>
								<Field label="Address" htmlFor="edit-address" error={errors.address?.message}>
									<Input id="edit-address" autoComplete="off" aria-invalid={!!errors.address} {...register("address")} />
								</Field>
								<Field label="Nearest landmark" htmlFor="edit-landmark">
									<Input id="edit-landmark" autoComplete="off" {...register("landmark")} />
								</Field>
								<div className="grid gap-4 sm:grid-cols-2">
									<Field label="City" htmlFor="edit-city">
										<Input id="edit-city" autoComplete="off" {...register("city")} />
									</Field>
									<Field label="State" htmlFor="edit-state">
										<Input id="edit-state" autoComplete="off" {...register("state")} />
									</Field>
								</div>
								<div className="grid gap-4 sm:grid-cols-2">
									<Field label="Latitude" htmlFor="edit-lat" error={errors.lat?.message}>
										<Input id="edit-lat" inputMode="decimal" placeholder="6.5244" aria-invalid={!!errors.lat} {...register("lat")} />
									</Field>
									<Field label="Longitude" htmlFor="edit-lng" error={errors.lng?.message}>
										<Input id="edit-lng" inputMode="decimal" placeholder="3.3792" aria-invalid={!!errors.lng} {...register("lng")} />
									</Field>
								</div>
							</section>
						</>
					) : (
						<Field label="Max devices" htmlFor="edit-devices" error={errors.maxDevices?.message}>
							<Input id="edit-devices" inputMode="numeric" aria-invalid={!!errors.maxDevices} {...register("maxDevices")} />
						</Field>
					)}

					<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="animate-spin" />}
						{moving ? "Save and move customer" : "Save changes"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}