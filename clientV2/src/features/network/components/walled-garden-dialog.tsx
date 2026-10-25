"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { settleFailure } from "@/lib/api/failure";
import { HOST_ACTIONS, IP_ACTIONS, NETWORK_ERROR_CODES, PROTOCOL_OPTIONS } from "../constants";
import { useEntryActions } from "../hooks/use-network";
import type { WalledGardenEntry, WalledGardenKind } from "../types/network.types";

type Errors = Partial<Record<string, string>>;

const NO_PROTOCOL = "any";
const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;

function clean(value: string) {
	const trimmed = value.trim();
	return trimmed === "" ? null : trimmed;
}

export function WalledGardenDialog({ entry, onClose }: { entry?: WalledGardenEntry; onClose: () => void }) {
	const { create, update } = useEntryActions();
	const editing = !!entry;
	const [kind, setKind] = useState<WalledGardenKind>(entry?.kind ?? "host");
	const [dstHost, setDstHost] = useState(entry?.dstHost ?? "");
	const [dstAddress, setDstAddress] = useState(entry?.dstAddress ?? "");
	const [protocol, setProtocol] = useState(entry?.protocol ?? NO_PROTOCOL);
	const [dstPort, setDstPort] = useState(entry?.dstPort ?? "");
	const [path, setPath] = useState(entry?.path ?? "");
	const [action, setAction] = useState(entry?.action ?? (entry?.kind === "ip" ? "accept" : "allow"));
	const [description, setDescription] = useState(entry?.description ?? "");
	const [enabled, setEnabled] = useState(entry?.enabled ?? true);
	const [errors, setErrors] = useState<Errors>({});
	const pending = create.isPending || update.isPending;
	const actions = kind === "host" ? HOST_ACTIONS : IP_ACTIONS;

	function clear(key: string) {
		setErrors((prev) => ({ ...prev, [key]: undefined }));
	}

	function changeKind(next: WalledGardenKind) {
		setKind(next);
		setAction(next === "host" ? "allow" : "accept");
		setErrors({});
	}

	async function submit() {
		const next: Errors = {};
		const host = dstHost.trim();
		const address = dstAddress.trim();
		const port = dstPort.trim();

		if (kind === "host" && !host) next.dstHost = "Enter a host, for example *.paystack.com";
		if (kind === "ip") {
			if (!address && !host) next.dstAddress = "Enter an IP address or a host";
			if (address && !IPV4_PATTERN.test(address)) next.dstAddress = "Use an IPv4 address or CIDR, for example 10.0.0.0/24";
		}
		if (port && !/^\d{1,5}$/.test(port)) next.dstPort = "Use a port number";

		if (Object.keys(next).length > 0) {
			setErrors(next);
			return;
		}

		const fields =
			kind === "host"
				? { dstHost: host, dstPort: clean(dstPort), path: clean(path), action, description: clean(description), enabled }
				: {
						dstAddress: clean(dstAddress),
						dstHost: clean(dstHost),
						protocol: protocol === NO_PROTOCOL ? null : protocol,
						dstPort: clean(dstPort),
						action,
						description: clean(description),
						enabled,
					};

		const res = entry
			? await update.mutateAsync({ id: entry.id, body: fields })
			: await create.mutateAsync({ kind, ...fields });

		if (!res.success) {
			if (res.code === "VALIDATION_ERROR" && Array.isArray(res.details)) {
				const mapped: Errors = {};
				for (const item of res.details as { field?: string; message?: string }[]) {
					if (item.field) mapped[item.field] = item.message ?? "Invalid value";
				}
				if (Object.keys(mapped).length > 0) {
					setErrors(mapped);
					return;
				}
			}
			if (res.code === NETWORK_ERROR_CODES.WALLED_GARDEN_CONFLICT || res.code === "VALIDATION_ERROR") {
				toast.error(res.message);
				return;
			}
			if (settleFailure(res, "Saving the entry")) onClose();
			return;
		}

		toast.success(editing ? "Entry updated" : "Entry added", { description: "It's being pushed to every router now." });
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{editing ? "Edit walled garden entry" : "New walled garden entry"}</DialogTitle>
					<DialogDescription>Sites customers can reach before they pay or log in.</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					{!editing && (
						<div className="grid grid-cols-2 gap-2">
							{(
								[
									{ value: "host", label: "Website / host" },
									{ value: "ip", label: "IP address" },
								] as const
							).map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => changeKind(option.value)}
									className={
										kind === option.value
											? "min-h-11 rounded-lg border border-signal bg-info-soft text-sm font-medium"
											: "min-h-11 rounded-lg border bg-surface-2 text-sm text-muted-foreground"
									}
								>
									{option.label}
								</button>
							))}
						</div>
					)}

					{kind === "host" ? (
						<>
							<Field label="Host" htmlFor="wg-host" error={errors.dstHost} hint="Wildcards work, like *.paystack.com">
								<Input id="wg-host" autoComplete="off" value={dstHost} aria-invalid={!!errors.dstHost} onChange={(e) => { setDstHost(e.target.value); clear("dstHost"); }} />
							</Field>
							<div className="grid gap-4 sm:grid-cols-2">
								<Field label="Port (optional)" htmlFor="wg-port" error={errors.dstPort}>
									<Input id="wg-port" inputMode="numeric" value={dstPort} aria-invalid={!!errors.dstPort} onChange={(e) => { setDstPort(e.target.value); clear("dstPort"); }} />
								</Field>
								<Field label="Path (optional)" htmlFor="wg-path" error={errors.path}>
									<Input id="wg-path" value={path} onChange={(e) => { setPath(e.target.value); clear("path"); }} />
								</Field>
							</div>
						</>
					) : (
						<>
							<Field label="IP address" htmlFor="wg-address" error={errors.dstAddress} hint="IPv4 or CIDR, like 10.0.0.0/24">
								<Input id="wg-address" autoComplete="off" value={dstAddress} aria-invalid={!!errors.dstAddress} onChange={(e) => { setDstAddress(e.target.value); clear("dstAddress"); }} />
							</Field>
							<Field label="Host (optional)" htmlFor="wg-ip-host" error={errors.dstHost}>
								<Input id="wg-ip-host" autoComplete="off" value={dstHost} onChange={(e) => { setDstHost(e.target.value); clear("dstHost"); }} />
							</Field>
							<div className="grid gap-4 sm:grid-cols-2">
								<Field label="Protocol" htmlFor="wg-protocol">
									<Select value={protocol} onValueChange={setProtocol}>
										<SelectTrigger id="wg-protocol" className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={NO_PROTOCOL}>Any</SelectItem>
											{PROTOCOL_OPTIONS.map((o) => (
												<SelectItem key={o.value} value={o.value}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
								<Field label="Port (optional)" htmlFor="wg-ip-port" error={errors.dstPort}>
									<Input id="wg-ip-port" inputMode="numeric" value={dstPort} aria-invalid={!!errors.dstPort} onChange={(e) => { setDstPort(e.target.value); clear("dstPort"); }} />
								</Field>
							</div>
						</>
					)}

					<Field label="Action" htmlFor="wg-action">
						<Select value={action} onValueChange={setAction}>
							<SelectTrigger id="wg-action" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{actions.map((o) => (
									<SelectItem key={o.value} value={o.value}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>

					<Field label="Note (optional)" htmlFor="wg-description">
						<Input id="wg-description" value={description} onChange={(e) => setDescription(e.target.value)} />
					</Field>

					<label className="flex min-h-11 items-center justify-between gap-3 text-sm">
						<span>
							Turned on
							<span className="block text-[12px] text-muted-foreground">Switch off to keep the entry without applying it.</span>
						</span>
						<Switch checked={enabled} onCheckedChange={setEnabled} />
					</label>

					<Button size="lg" className="w-full" disabled={pending} onClick={submit}>
						{pending && <Loader2 className="animate-spin" />}
						{editing ? "Save changes" : "Add entry"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
