"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouters } from "@/features/routers/hooks/use-routers";
import { UserSelect } from "@/features/users/components/user-select";
import type { UserProfile } from "@/features/users/types/users.types";
import { SERVICE_TYPE_OPTIONS } from "../constants";
import { useAdminAccountActions } from "../hooks/use-accounts";
import { AdminCreateAccountValues, adminCreateAccountSchema } from "../schemas/accounts.schemas";

export function AdminCreateAccountDialog({ user: presetUser, onClose }: { user?: UserProfile; onClose: () => void }) {
	const { create } = useAdminAccountActions();
	const [user, setUser] = useState<UserProfile | null>(presetUser ?? null);
	const [userError, setUserError] = useState<string | null>(null);

	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<AdminCreateAccountValues>({
		resolver: zodResolver(adminCreateAccountSchema),
		defaultValues: {
			serviceType: "pppoe",
			accountType: "personal",
			businessName: "",
			companyRegistrationNumber: "",
			taxId: "",
			routerId: "",
			accessMethod: "ipoe",
			macAddress: "",
			staticIp: "",
			maxDevices: "",
		},
	});

	const serviceType = watch("serviceType");
	const accountType = watch("accountType");
	const accessMethod = watch("accessMethod");
	const isPppoe = serviceType === "pppoe";

	const routers = useRouters({ limit: 100 }, isPppoe);
	const routerOptions = (routers.data?.items ?? [])
		.filter((r) => r.isEnabled !== false && (r.supportedServices ?? []).includes("pppoe"))
		.sort((a, b) => Number(!!b.isDefaultRouter) - Number(!!a.isDefaultRouter));

	async function onSubmit(values: AdminCreateAccountValues) {
		if (!user) {
			setUserError("Choose the customer this account is for");
			return;
		}

		const isBusiness = isPppoe && values.accountType === "business";
		const res = await create.mutateAsync({
			userId: user.id,
			serviceType: values.serviceType,
			accountType: isPppoe ? values.accountType : undefined,
			businessName: isBusiness ? values.businessName : undefined,
			companyRegistrationNumber: isBusiness && values.companyRegistrationNumber ? values.companyRegistrationNumber : undefined,
			taxId: isBusiness && values.taxId ? values.taxId : undefined,
			routerId: isPppoe ? values.routerId : undefined,
			accessMethod: isPppoe ? values.accessMethod : undefined,
			macAddress: isPppoe && values.accessMethod === "ipoe" ? values.macAddress.replace(/-/g, ":").toUpperCase() : undefined,
			staticIp: isPppoe && values.staticIp ? values.staticIp : undefined,
			maxDevices: !isPppoe && values.maxDevices ? Number(values.maxDevices) : undefined,
		});

		if (!res.success) {
			toast.error(res.message);
			return;
		}

		toast.success("Account created");
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !isSubmitting && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create an account</DialogTitle>
					<DialogDescription>Set up service for a customer directly. The account is approved straight away.</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
					{!presetUser && (
						<Field label="Customer" htmlFor="create-user" error={userError ?? undefined}>
							<UserSelect
								value={user}
								onChange={(next) => {
									setUser(next);
									setUserError(null);
								}}
							/>
						</Field>
					)}

					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Service" htmlFor="create-service">
							<Controller
								control={control}
								name="serviceType"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger id="create-service" className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{SERVICE_TYPE_OPTIONS.map((o) => (
												<SelectItem key={o.value} value={o.value}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</Field>

						{isPppoe && (
							<Field label="Customer type" htmlFor="create-type">
								<Controller
									control={control}
									name="accountType"
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger id="create-type" className="w-full">
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
						)}
					</div>

					{isPppoe && accountType === "business" && (
						<div className="space-y-4">
							<Field label="Business name" htmlFor="create-business" error={errors.businessName?.message}>
								<Input id="create-business" autoComplete="off" aria-invalid={!!errors.businessName} {...register("businessName")} />
							</Field>
							<div className="grid gap-4 sm:grid-cols-2">
								<Field label="Registration number (optional)" htmlFor="create-reg">
									<Input id="create-reg" autoComplete="off" {...register("companyRegistrationNumber")} />
								</Field>
								<Field label="Tax ID (optional)" htmlFor="create-tax">
									<Input id="create-tax" autoComplete="off" {...register("taxId")} />
								</Field>
							</div>
						</div>
					)}

					{isPppoe ? (
						<div className="space-y-4">
							<Field label="Router" htmlFor="create-router" error={errors.routerId?.message}>
								<Controller
									control={control}
									name="routerId"
									render={({ field }) => (
										<Select value={field.value || undefined} onValueChange={field.onChange}>
											<SelectTrigger id="create-router" className="w-full" aria-invalid={!!errors.routerId}>
												<SelectValue placeholder={routers.isLoading ? "Loading routers…" : "Select a router"} />
											</SelectTrigger>
											<SelectContent>
												{routerOptions.map((router) => (
													<SelectItem key={router.id} value={router.id}>
														{router.name} · {router.code}
														{router.isDefaultRouter ? " (default)" : ""}
														{router.status === "online" ? "" : ` · ${router.status ?? "offline"}`}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
							</Field>

							<Field label="Access method" htmlFor="create-access" hint="IPoE is the default for most customers.">
								<Controller
									control={control}
									name="accessMethod"
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger id="create-access" className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="ipoe">IPoE (default)</SelectItem>
												<SelectItem value="ppp">PPP</SelectItem>
											</SelectContent>
										</Select>
									)}
								/>
							</Field>

							{accessMethod === "ipoe" && (
								<Field label="Customer router MAC address" htmlFor="create-mac" error={errors.macAddress?.message}>
									<Input
										id="create-mac"
										placeholder="AA:BB:CC:DD:EE:FF"
										autoCapitalize="characters"
										autoComplete="off"
										aria-invalid={!!errors.macAddress}
										{...register("macAddress")}
									/>
								</Field>
							)}

							<Field label="Static IP (optional)" htmlFor="create-ip" error={errors.staticIp?.message} hint="For reference only.">
								<Input id="create-ip" autoComplete="off" aria-invalid={!!errors.staticIp} {...register("staticIp")} />
							</Field>
						</div>
					) : (
						<Field label="Max devices (optional)" htmlFor="create-devices" error={errors.maxDevices?.message}>
							<Input id="create-devices" inputMode="numeric" aria-invalid={!!errors.maxDevices} {...register("maxDevices")} />
						</Field>
					)}

					<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="animate-spin" />}
						Create account
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
