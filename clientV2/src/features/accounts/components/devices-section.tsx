"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Field } from "@/components/shared/field";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { useAddDevice, useRemoveDevice } from "../hooks/use-accounts";
import { AddDeviceValues, addDeviceSchema } from "../schemas/accounts.schemas";
import type { Account, AccountDevice } from "../types/accounts.types";

function normalizeMac(mac: string) {
	return mac.trim().replace(/-/g, ":").toUpperCase();
}

export function DevicesSection({ account }: { account: Account }) {
	const [open, setOpen] = useState(false);
	const removeDevice = useRemoveDevice(account.id);
	const [removing, setRemoving] = useState<AccountDevice | null>(null);
	const addDevice = useAddDevice(account.id);
	const devices = account.devices ?? [];
	const max = account.maxDevices;
	const full = max !== undefined && devices.length >= max;

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<AddDeviceValues>({
		resolver: zodResolver(addDeviceSchema),
		defaultValues: { macAddress: "", hostname: "" },
	});

	async function onSubmit(values: AddDeviceValues) {
		const res = await addDevice.mutateAsync({
			macAddress: normalizeMac(values.macAddress),
			hostname: values.hostname || undefined,
		});

		if (!res.success) {
			if (res.code === "CONFLICT") {
				setError("macAddress", { message: "This device is already on the account" });
				return;
			}
			toast.error(res.message);
			return;
		}

		toast.success("Device added");
		reset();
		setOpen(false);
	}

	return (
		<SectionCard
			title="Devices"
			actions={
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm" className="bg-surface-2" disabled={full}>
							<Plus />
							Add
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add a device</DialogTitle>
							<DialogDescription>
								Enter the device&apos;s MAC address. You can find it in your phone or laptop&apos;s wifi settings.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
							<Field label="MAC address" htmlFor="device-mac" error={errors.macAddress?.message}>
								<Input
									id="device-mac"
									placeholder="AA:BB:CC:DD:EE:FF"
									autoCapitalize="characters"
									autoComplete="off"
									aria-invalid={!!errors.macAddress}
									{...register("macAddress")}
								/>
							</Field>
							<Field label="Name (optional)" htmlFor="device-name" error={errors.hostname?.message}>
								<Input id="device-name" placeholder="Ada's phone" aria-invalid={!!errors.hostname} {...register("hostname")} />
							</Field>
							<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
								{isSubmitting && <Loader2 className="animate-spin" />}
								Add device
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			}
		>
			<div className="space-y-3">
				<p className="text-[12px] text-muted-foreground">
					{devices.length}
					{max !== undefined ? ` of ${max}` : ""} in use
					{full ? " · limit reached" : ""}
				</p>

				{devices.length === 0 ? (
					<p className="text-[13px] text-muted-foreground">No devices yet. They appear here once connected.</p>
				) : (
					<ul className="divide-y">
						{devices.map((d) => (
							<li key={d.macAddress} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
								<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
									<Smartphone className="size-4" />
								</div>
								<div className="min-w-0">
									<p className="truncate text-[13px] font-medium">{d.hostname ?? "Unknown device"}</p>
									<p className="text-mono truncate text-[11px] text-muted-foreground">{d.macAddress}</p>
								</div>
								<span className="ml-auto whitespace-nowrap text-[11px] text-muted-foreground">{formatDate(d.lastSeenAt)}</span>
								<Button
									variant="ghost"
									size="icon"
									className="size-8 shrink-0"
									aria-label="Remove device"
									onClick={() => setRemoving(d)}
								>
									<Trash2 className="size-4" />
								</Button>
							</li>
						))}
					</ul>
				)}
			</div>

			{removing && (
				<ConfirmDialog
					open
					onOpenChange={(open) => !open && setRemoving(null)}
					destructive
					title="Remove this device?"
					description={`${removing.hostname ?? removing.macAddress} will be removed from this account.`}
					confirmLabel="Remove"
					onConfirm={async () => {
						const res = await removeDevice.mutateAsync(removing.macAddress);
						if (!res.success) {
							toast.error(res.message);
							return false;
						}
						toast.success("Device removed");
					}}
				/>
			)}
		</SectionCard>
	);
}
