"use client";

import { useState } from "react";
import { Loader2, Router as RouterIcon, ShieldCheck, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { DetailList } from "@/components/shared/detail-list";
import { Field } from "@/components/shared/field";
import { OptionCard } from "@/components/shared/option-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouters } from "@/features/routers/hooks/use-routers";
import { UserPicker } from "@/features/users/components/user-picker";
import type { UserProfile } from "@/features/users/types/users.types";
import { featureFlags } from "@/lib/feature-flags";
import { formatNumber } from "@/lib/format";
import {
	COMPOSER_TYPE_OPTIONS,
	NOTIFICATION_CHANNEL_OPTIONS,
	NOTIFICATION_ERROR_CODES,
	NOTIFICATION_PRIORITY_OPTIONS,
} from "../constants";
import { useSendNotification } from "../hooks/use-notifications";
import { fetchActiveCustomerCount, fetchAudienceIds } from "../lib/audience";
import { routerNotice } from "../lib/presets";
import type { ComposePreset } from "../types/notifications.types";
import { RouterAudiencePicker } from "./router-audience-picker";

type Audience = "specific" | "customers" | "staff" | "routers";
type Step = "compose" | "review";

const DEFAULT_CHANNEL = "default";
const STAFF_ROLES = ["staff", "superadmin"];

const AUDIENCE_LABELS: Record<Audience, string> = {
	specific: "Selected people",
	customers: "All active customers",
	staff: "All active staff and admins",
	routers: "Customers on selected routers",
};

interface FormErrors {
	title?: string;
	message?: string;
	audience?: string;
}

interface ComposeNotificationDialogProps {
	preset?: ComposePreset;
	onClose: () => void;
}

export function ComposeNotificationDialog({ preset, onClose }: ComposeNotificationDialogProps) {
	const send = useSendNotification();
	const routers = useRouters({ limit: 100 }, featureFlags.routerBroadcast);
	const [step, setStep] = useState<Step>("compose");
	const [type, setType] = useState(preset?.type ?? "admin_broadcast");
	const [title, setTitle] = useState(preset?.title ?? "");
	const [message, setMessage] = useState(preset?.message ?? "");
	const [audience, setAudience] = useState<Audience>(preset?.routerIds?.length ? "routers" : "specific");
	const [picked, setPicked] = useState<UserProfile[]>([]);
	const [routerIds, setRouterIds] = useState<string[]>(preset?.routerIds ?? []);
	const [channel, setChannel] = useState(DEFAULT_CHANNEL);
	const [priority, setPriority] = useState(preset?.priority ?? "NORMAL");
	const [recipientIds, setRecipientIds] = useState<string[]>([]);
	const [recipientCount, setRecipientCount] = useState<number | null>(0);
	const [errors, setErrors] = useState<FormErrors>({});
	const [preparing, setPreparing] = useState(false);

	const selectedRouters = (routers.data?.items ?? []).filter((r) => routerIds.includes(r.id));
	const onlineEstimate = selectedRouters.reduce((sum, r) => sum + (r.currentSessions ?? 0), 0);

	function placeLabel() {
		const places = Array.from(new Set(selectedRouters.map((r) => r.location || r.name)));
		if (places.length === 0) return "your area";
		if (places.length === 1) return places[0];
		if (places.length <= 3) return `${places.slice(0, -1).join(", ")} and ${places[places.length - 1]}`;
		return "several areas";
	}

	function applyTemplate(kind: "outage" | "restored") {
		const notice = routerNotice(kind, placeLabel());
		setTitle(notice.title);
		setMessage(notice.message);
		setType("system_alert");
		setErrors({});
	}

	async function review() {
		const next: FormErrors = {};
		if (!title.trim()) next.title = "Enter a title";
		if (!message.trim()) next.message = "Enter a message";
		if (audience === "specific" && picked.length === 0) next.audience = "Choose at least one person";
		if (audience === "routers" && routerIds.length === 0) next.audience = "Choose at least one router";
		setErrors(next);
		if (Object.keys(next).length > 0) return;

		if (audience === "specific") {
			setRecipientIds(picked.map((u) => u.id));
			setRecipientCount(picked.length);
			setStep("review");
			return;
		}

		if (audience === "routers") {
			setRecipientIds([]);
			setRecipientCount(null);
			setStep("review");
			return;
		}

		setPreparing(true);

		if (audience === "customers") {
			const total = await fetchActiveCustomerCount();
			setPreparing(false);
			if (total === 0) {
				setErrors({ audience: "There are no active customers yet" });
				return;
			}
			setRecipientIds([]);
			setRecipientCount(total);
			setStep("review");
			return;
		}

		const ids = await fetchAudienceIds(STAFF_ROLES);
		setPreparing(false);

		if (!ids) {
			toast.error("We couldn't build that recipient list. Try again or pick people individually.");
			return;
		}
		if (ids.length === 0) {
			setErrors({ audience: "No active users in that group" });
			return;
		}

		setRecipientIds(ids);
		setRecipientCount(ids.length);
		setStep("review");
	}

	async function submit() {
		const recipients =
			audience === "customers"
				? { audience: "all_customers" as const }
				: audience === "routers"
					? { routerIds }
					: { userIds: recipientIds };

		const res = await send.mutateAsync({
			type,
			title: title.trim(),
			message: message.trim(),
			channel: channel === DEFAULT_CHANNEL ? undefined : channel,
			priority,
			...recipients,
		});

		if (!res.success) {
			if (res.code === NOTIFICATION_ERROR_CODES.UNSUPPORTED_CHANNEL) {
				toast.error("That channel isn't available yet. Choose another one.");
				setStep("compose");
				return;
			}
			toast.error(res.message);
			return;
		}

		toast.success(
			audience === "routers"
				? `Queued for customers on ${routerIds.length} router${routerIds.length === 1 ? "" : "s"}`
				: recipientCount === null
					? "Queued for all active customers"
					: `Queued for ${formatNumber(recipientCount)} recipient${recipientCount === 1 ? "" : "s"}`
		);
		onClose();
	}

	const channelLabel = NOTIFICATION_CHANNEL_OPTIONS.find((o) => o.value === channel)?.label ?? "Default";
	const priorityLabel = NOTIFICATION_PRIORITY_OPTIONS.find((o) => o.value === priority)?.label ?? priority;
	const typeLabel = COMPOSER_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;

	const recipientRows =
		audience === "routers"
			? [
					{ label: "Audience", value: AUDIENCE_LABELS.routers },
					{ label: "Routers", value: selectedRouters.map((r) => r.name).join(", ") || `${routerIds.length} selected` },
					{ label: "Online now", value: `≈ ${formatNumber(onlineEstimate)} live sessions (estimate)` },
				]
			: [
					{
						label: "Recipients",
						value: recipientCount === null ? AUDIENCE_LABELS[audience] : `${formatNumber(recipientCount)} · ${AUDIENCE_LABELS[audience]}`,
					},
				];

	const sendLabel =
		audience === "routers"
			? "Send to affected customers"
			: recipientCount === null
				? "Send to all customers"
				: `Send to ${formatNumber(recipientCount)}`;

	return (
		<Dialog open onOpenChange={(open) => !open && !send.isPending && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{step === "compose" ? "New notification" : "Review and send"}</DialogTitle>
					<DialogDescription>
						{step === "compose" ? "Write a message and choose who receives it." : "Check the details. Sent notifications can't be recalled."}
					</DialogDescription>
				</DialogHeader>

				{step === "compose" ? (
					<div className="space-y-5">
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="Type" htmlFor="notif-type">
								<Select value={type} onValueChange={setType}>
									<SelectTrigger id="notif-type" className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{COMPOSER_TYPE_OPTIONS.map((o) => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
							<Field label="Priority" htmlFor="notif-priority">
								<Select value={priority} onValueChange={setPriority}>
									<SelectTrigger id="notif-priority" className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{NOTIFICATION_PRIORITY_OPTIONS.map((o) => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</div>

						<Field label="Title" htmlFor="notif-title" error={errors.title}>
							<Input
								id="notif-title"
								value={title}
								aria-invalid={!!errors.title}
								onChange={(e) => {
									setTitle(e.target.value);
									setErrors((x) => ({ ...x, title: undefined }));
								}}
							/>
						</Field>

						<Field label="Message" htmlFor="notif-message" error={errors.message}>
							<Textarea
								id="notif-message"
								value={message}
								aria-invalid={!!errors.message}
								className="min-h-28"
								onChange={(e) => {
									setMessage(e.target.value);
									setErrors((x) => ({ ...x, message: undefined }));
								}}
							/>
						</Field>

						<div className="space-y-2">
							<p className="text-sm font-medium">Who should get it?</p>
							<div role="radiogroup" aria-label="Audience" className="grid gap-2 sm:grid-cols-2">
								<OptionCard
									icon={UserCheck}
									title="Specific people"
									description="Pick individuals."
									selected={audience === "specific"}
									onSelect={() => setAudience("specific")}
								/>
								<OptionCard
									icon={Users}
									title="All customers"
									description="Every active customer."
									selected={audience === "customers"}
									onSelect={() => setAudience("customers")}
								/>
								{featureFlags.routerBroadcast && (
									<OptionCard
										icon={RouterIcon}
										title="By router or area"
										description="Customers on the routers you choose."
										selected={audience === "routers"}
										onSelect={() => setAudience("routers")}
									/>
								)}
								<OptionCard
									icon={ShieldCheck}
									title="Staff & admins"
									description="Your own team."
									selected={audience === "staff"}
									onSelect={() => setAudience("staff")}
								/>
							</div>

							{audience === "specific" && <UserPicker selected={picked} onChange={setPicked} />}

							{audience === "routers" && (
								<div className="space-y-3">
									<RouterAudiencePicker
										selectedIds={routerIds}
										onChange={(ids) => {
											setRouterIds(ids);
											setErrors((x) => ({ ...x, audience: undefined }));
										}}
									/>
									<div className="flex flex-wrap items-center gap-2">
										<span className="text-[12px] text-muted-foreground">Fill in a template:</span>
										<Button type="button" variant="outline" size="sm" className="bg-surface-2" onClick={() => applyTemplate("outage")}>
											Outage notice
										</Button>
										<Button type="button" variant="outline" size="sm" className="bg-surface-2" onClick={() => applyTemplate("restored")}>
											Service restored
										</Button>
									</div>
								</div>
							)}

							{errors.audience && (
								<p role="alert" className="text-sm text-destructive">
									{errors.audience}
								</p>
							)}
						</div>

						<Field label="Channel" htmlFor="notif-channel">
							<Select value={channel} onValueChange={setChannel}>
								<SelectTrigger id="notif-channel" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={DEFAULT_CHANNEL}>Default channel</SelectItem>
									{NOTIFICATION_CHANNEL_OPTIONS.map((o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>

						<Button size="lg" className="w-full" disabled={preparing} onClick={review}>
							{preparing && <Loader2 className="animate-spin" />}
							Review
						</Button>
					</div>
				) : (
					<div className="space-y-5">
						<div className="card-elevated space-y-1 bg-surface-2 p-3">
							<p className="text-[13px] font-medium">{title}</p>
							<p className="whitespace-pre-line text-[12px] text-muted-foreground">{message}</p>
						</div>

						<DetailList
							rows={[
								...recipientRows,
								{ label: "Type", value: typeLabel },
								{ label: "Channel", value: channelLabel },
								{ label: "Priority", value: priorityLabel },
							]}
						/>

						<div className="flex flex-col gap-3 sm:flex-row-reverse">
							<Button size="lg" className="sm:flex-1" disabled={send.isPending} onClick={submit}>
								{send.isPending && <Loader2 className="animate-spin" />}
								{sendLabel}
							</Button>
							<Button size="lg" variant="outline" className="bg-surface-2 sm:flex-1" disabled={send.isPending} onClick={() => setStep("compose")}>
								Back
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}