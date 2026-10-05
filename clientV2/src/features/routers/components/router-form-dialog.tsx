"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CONNECTION_TYPE_OPTIONS } from "../constants";
import { useRouterActions } from "../hooks/use-routers";
import { RouterFormValues, SERVICE_OPTIONS, makeRouterSchema } from "../schemas/routers.schemas";
import type { NetworkRouter } from "../types/routers.types";

function toValues(router?: NetworkRouter): RouterFormValues {
	return {
		name: router?.name ?? "",
		host: router?.host ?? "",
		port: router?.port ? String(router.port) : "",
		username: router?.username ?? "",
		password: "",
		supportedServices: (router?.supportedServices ?? ["pppoe", "hotspot"]).filter(
			(s): s is "pppoe" | "hotspot" => s === "pppoe" || s === "hotspot"
		),
		location: router?.location ?? "",
		connectionType: router?.connectionType === "vpn" ? "vpn" : "direct",
		priority: router?.priority !== undefined ? String(router.priority) : "",
		maxSessions: router?.maxSessions !== undefined ? String(router.maxSessions) : "",
		isDefaultRouter: router?.isDefaultRouter ?? false,
		isEnabled: router?.isEnabled ?? true,
		apiEnabled: router?.apiEnabled ?? true,
	};
}

export function RouterFormDialog({ router, onClose }: { router?: NetworkRouter; onClose: () => void }) {
	const { create, update } = useRouterActions();
	const isEdit = !!router;

	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RouterFormValues>({
		resolver: zodResolver(makeRouterSchema(isEdit)),
		defaultValues: toValues(router),
	});

	async function onSubmit(values: RouterFormValues) {
		const base = {
			name: values.name,
			host: values.host,
			port: values.port ? Number(values.port) : undefined,
			username: values.username,
			supportedServices: values.supportedServices,
			connectionType: values.connectionType,
			isDefaultRouter: values.isDefaultRouter,
		};

		const res = router
			? await update.mutateAsync({
					id: router.id,
					body: {
						...base,
						location: values.location,
						isEnabled: values.isEnabled,
						apiEnabled: values.apiEnabled,
						...(values.password ? { password: values.password } : {}),
						...(values.priority ? { priority: Number(values.priority) } : {}),
						...(values.maxSessions ? { maxSessions: Number(values.maxSessions) } : {}),
					},
				})
			: await create.mutateAsync({ ...base, password: values.password, location: values.location || undefined });

		if (!res.success) {
			toast.error(res.message);
			return;
		}

		toast.success(isEdit ? "Router updated" : "Router added");
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !isSubmitting && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{isEdit ? `Edit ${router.name}` : "Add a router"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Changes apply straight away. Leave the password blank to keep the current one."
							: "Enter the MikroTik API details. The password is stored by the backend and never shown again."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
					<Field label="Name" htmlFor="router-name" error={errors.name?.message}>
						<Input id="router-name" autoComplete="off" aria-invalid={!!errors.name} {...register("name")} />
					</Field>

					<div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
						<Field label="Address" htmlFor="router-host" error={errors.host?.message} hint="IP or hostname">
							<Input id="router-host" autoComplete="off" aria-invalid={!!errors.host} {...register("host")} />
						</Field>
						<Field label="API port" htmlFor="router-port" error={errors.port?.message}>
							<Input id="router-port" inputMode="numeric" placeholder="8728" aria-invalid={!!errors.port} {...register("port")} />
						</Field>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="API username" htmlFor="router-username" error={errors.username?.message}>
							<Input id="router-username" autoComplete="off" aria-invalid={!!errors.username} {...register("username")} />
						</Field>
						<Field label="API password" htmlFor="router-password" error={errors.password?.message}>
							<PasswordInput
								id="router-password"
								autoComplete="new-password"
								placeholder={isEdit ? "Unchanged" : undefined}
								aria-invalid={!!errors.password}
								{...register("password")}
							/>
						</Field>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Location (optional)" htmlFor="router-location" error={errors.location?.message}>
							<Input id="router-location" autoComplete="off" aria-invalid={!!errors.location} {...register("location")} />
						</Field>
						<Field label="Connection type" htmlFor="router-connection">
							<Controller
								control={control}
								name="connectionType"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger id="router-connection" className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{CONNECTION_TYPE_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</Field>
					</div>

					{isEdit && (
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="Priority" htmlFor="router-priority" error={errors.priority?.message}>
								<Input id="router-priority" inputMode="numeric" aria-invalid={!!errors.priority} {...register("priority")} />
							</Field>
							<Field label="Session capacity" htmlFor="router-capacity" error={errors.maxSessions?.message}>
								<Input id="router-capacity" inputMode="numeric" aria-invalid={!!errors.maxSessions} {...register("maxSessions")} />
							</Field>
						</div>
					)}

					<div className="space-y-2">
						<p className="text-sm font-medium">Services</p>
						<Controller
							control={control}
							name="supportedServices"
							render={({ field }) => (
								<div className="flex flex-wrap gap-4">
									{SERVICE_OPTIONS.map((option) => (
										<label key={option.value} className="flex items-center gap-2 text-[13px]">
											<Checkbox
												checked={field.value.includes(option.value)}
												onCheckedChange={(checked) =>
													field.onChange(checked ? [...field.value, option.value] : field.value.filter((v) => v !== option.value))
												}
											/>
											{option.label}
										</label>
									))}
								</div>
							)}
						/>
						{errors.supportedServices && (
							<p role="alert" className="text-sm text-destructive">
								{errors.supportedServices.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Controller
							control={control}
							name="isDefaultRouter"
							render={({ field }) => (
								<label className="flex items-center gap-2 text-[13px]">
									<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
									Make this the default router
								</label>
							)}
						/>
						{isEdit && (
							<>
								<Controller
									control={control}
									name="isEnabled"
									render={({ field }) => (
										<label className="flex items-center gap-2 text-[13px]">
											<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
											Router is enabled
										</label>
									)}
								/>
								<Controller
									control={control}
									name="apiEnabled"
									render={({ field }) => (
										<label className="flex items-center gap-2 text-[13px]">
											<Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
											API access is enabled
										</label>
									)}
								/>
							</>
						)}
					</div>

					<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="animate-spin" />}
						{isEdit ? "Save changes" : "Add router"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}