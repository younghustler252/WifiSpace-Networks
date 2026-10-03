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
import { useRouterActions } from "../hooks/use-routers";
import { CreateRouterValues, SERVICE_OPTIONS, createRouterSchema } from "../schemas/routers.schemas";

export function RouterFormDialog({ onClose }: { onClose: () => void }) {
	const { create } = useRouterActions();

	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreateRouterValues>({
		resolver: zodResolver(createRouterSchema),
		defaultValues: { name: "", host: "", username: "", password: "", supportedServices: ["pppoe", "hotspot"], location: "", isDefaultRouter: false },
	});

	async function onSubmit(values: CreateRouterValues) {
		const res = await create.mutateAsync({
			name: values.name,
			host: values.host,
			port: values.port,
			username: values.username,
			password: values.password,
			supportedServices: values.supportedServices,
			location: values.location || undefined,
			isDefaultRouter: values.isDefaultRouter,
		});

		if (!res.success) {
			toast.error(res.message);
			return;
		}

		toast.success("Router added");
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add a router</DialogTitle>
					<DialogDescription>Enter the MikroTik API details. The password is stored by the backend and never shown again.</DialogDescription>
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
							<Input
								id="router-port"
								type="number"
								inputMode="numeric"
								placeholder="8728"
								aria-invalid={!!errors.port}
								{...register("port", { setValueAs: (v) => (v === "" || v === undefined ? undefined : Number(v)) })}
							/>
						</Field>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="API username" htmlFor="router-username" error={errors.username?.message}>
							<Input id="router-username" autoComplete="off" aria-invalid={!!errors.username} {...register("username")} />
						</Field>
						<Field label="API password" htmlFor="router-password" error={errors.password?.message}>
							<PasswordInput id="router-password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
						</Field>
					</div>

					<Field label="Location (optional)" htmlFor="router-location" error={errors.location?.message}>
						<Input id="router-location" autoComplete="off" aria-invalid={!!errors.location} {...register("location")} />
					</Field>

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

					<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="animate-spin" />}
						Add router
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}