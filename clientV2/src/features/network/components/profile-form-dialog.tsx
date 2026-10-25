"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { settleFailure } from "@/lib/api/failure";
import { DURATION_PATTERN, NETWORK_ERROR_CODES, OPEN_STATUS_PAGE_OPTIONS, PROFILE_NAME_PATTERN } from "../constants";
import { useProfileActions } from "../hooks/use-network";
import type { HotspotProfile, OpenStatusPage } from "../types/network.types";

type Errors = Partial<Record<string, string>>;

interface FormState {
	name: string;
	uploadMbps: string;
	downloadMbps: string;
	sharedUsers: string;
	macCookieTimeout: string;
	idleTimeout: string;
	statusAutorefresh: string;
	addMacCookie: boolean;
	transparentProxy: boolean;
	openStatusPage: OpenStatusPage;
	advertise: boolean;
	description: string;
}

function initialState(profile?: HotspotProfile): FormState {
	return {
		name: profile?.name ?? "",
		uploadMbps: profile ? String(profile.uploadMbps) : "",
		downloadMbps: profile ? String(profile.downloadMbps) : "",
		sharedUsers: String(profile?.sharedUsers ?? 1),
		macCookieTimeout: profile?.macCookieTimeout ?? "3d",
		idleTimeout: profile?.idleTimeout ?? "none",
		statusAutorefresh: profile?.statusAutorefresh ?? "1m",
		addMacCookie: profile?.addMacCookie ?? true,
		transparentProxy: profile?.transparentProxy ?? true,
		openStatusPage: profile?.openStatusPage ?? "always",
		advertise: profile?.advertise ?? false,
		description: profile?.description ?? "",
	};
}

function whole(value: string) {
	const n = Number(value);
	return Number.isInteger(n) && n >= 1 ? n : null;
}

export function ProfileFormDialog({ profile, onClose }: { profile?: HotspotProfile; onClose: () => void }) {
	const { create, update } = useProfileActions();
	const [form, setForm] = useState<FormState>(() => initialState(profile));
	const [errors, setErrors] = useState<Errors>({});
	const [advanced, setAdvanced] = useState(false);
	const pending = create.isPending || update.isPending;
	const editing = !!profile;

	function set<K extends keyof FormState>(key: K, value: FormState[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
		setErrors((prev) => ({ ...prev, [key]: undefined }));
	}

	const up = whole(form.uploadMbps);
	const down = whole(form.downloadMbps);

	async function submit() {
		const next: Errors = {};
		const name = form.name.trim();

		if (!editing) {
			if (!PROFILE_NAME_PATTERN.test(name)) next.name = "Use letters, numbers, spaces, dots, dashes or underscores, up to 40 characters";
			else if (name.toLowerCase() === "default") next.name = "\"default\" is reserved";
		}
		if (up === null) next.uploadMbps = "Enter a whole number of Mbps";
		if (down === null) next.downloadMbps = "Enter a whole number of Mbps";
		if (whole(form.sharedUsers) === null) next.sharedUsers = "Enter a whole number, 1 or more";
		if (!DURATION_PATTERN.test(form.macCookieTimeout.trim())) next.macCookieTimeout = "Use a duration like 30m, 12h, 3d or 1w";
		if (form.idleTimeout.trim() !== "none" && !DURATION_PATTERN.test(form.idleTimeout.trim())) next.idleTimeout = "Use none or a duration like 30m";
		if (!DURATION_PATTERN.test(form.statusAutorefresh.trim())) next.statusAutorefresh = "Use a duration like 1m";

		if (Object.keys(next).length > 0) {
			setErrors(next);
			if (next.sharedUsers || next.macCookieTimeout || next.idleTimeout || next.statusAutorefresh) setAdvanced(true);
			return;
		}

		const fields = {
			uploadMbps: up!,
			downloadMbps: down!,
			sharedUsers: whole(form.sharedUsers)!,
			macCookieTimeout: form.macCookieTimeout.trim(),
			idleTimeout: form.idleTimeout.trim(),
			statusAutorefresh: form.statusAutorefresh.trim(),
			addMacCookie: form.addMacCookie,
			transparentProxy: form.transparentProxy,
			openStatusPage: form.openStatusPage,
			advertise: form.advertise,
			description: form.description.trim() || null,
		};

		const res = profile
			? await update.mutateAsync({ id: profile.id, body: fields })
			: await create.mutateAsync({ name, ...fields, description: fields.description ?? undefined });

		if (!res.success) {
			if (res.code === NETWORK_ERROR_CODES.HOTSPOT_PROFILE_NAME_CONFLICT) {
				setErrors({ name: res.message });
				return;
			}
			if (res.code === "VALIDATION_ERROR") {
				const mapped: Errors = {};
				if (Array.isArray(res.details)) {
					for (const item of res.details as { field?: string; message?: string }[]) {
						if (item.field) mapped[item.field] = item.message ?? "Invalid value";
					}
				}
				if (Object.keys(mapped).length > 0) {
					setErrors(mapped);
					return;
				}
				toast.error(res.message);
				return;
			}
			if (settleFailure(res, "Saving the profile")) onClose();
			return;
		}

		toast.success(editing ? "Profile updated" : "Profile created", { description: "It's being pushed to every router now." });
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{editing ? `Edit ${profile.name}` : "New speed profile"}</DialogTitle>
					<DialogDescription>Plans use profiles to set a customer&apos;s speed on the router.</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					{editing ? (
						<Notice tone="info" title="Speed changes apply to new sessions" text="People already online keep their old speed until they reconnect. The name can't be changed. Create a new profile and move plans to it instead." />
					) : (
						<Field label="Name" htmlFor="profile-name" error={errors.name} hint="For example 40Mbps-userprofile.">
							<Input id="profile-name" autoComplete="off" value={form.name} aria-invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
						</Field>
					)}

					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Upload (Mbps)" htmlFor="profile-up" error={errors.uploadMbps}>
							<Input id="profile-up" inputMode="numeric" value={form.uploadMbps} aria-invalid={!!errors.uploadMbps} onChange={(e) => set("uploadMbps", e.target.value)} />
						</Field>
						<Field label="Download (Mbps)" htmlFor="profile-down" error={errors.downloadMbps}>
							<Input id="profile-down" inputMode="numeric" value={form.downloadMbps} aria-invalid={!!errors.downloadMbps} onChange={(e) => set("downloadMbps", e.target.value)} />
						</Field>
					</div>

					<p className="text-[12px] text-muted-foreground">
						Router rate limit: <span className="text-mono">{up && down ? `${up}M/${down}M` : "—"}</span>
					</p>

					<button type="button" onClick={() => setAdvanced((v) => !v)} className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-signal">
						<ChevronDown className={advanced ? "size-4 rotate-180 transition" : "size-4 transition"} />
						Advanced settings
					</button>

					{advanced && (
						<div className="space-y-4 rounded-lg border p-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<Field label="Devices per login" htmlFor="profile-shared" error={errors.sharedUsers}>
									<Input id="profile-shared" inputMode="numeric" value={form.sharedUsers} aria-invalid={!!errors.sharedUsers} onChange={(e) => set("sharedUsers", e.target.value)} />
								</Field>
								<Field label="Remember device for" htmlFor="profile-cookie" error={errors.macCookieTimeout} hint="30m, 12h, 3d, 1w">
									<Input id="profile-cookie" value={form.macCookieTimeout} aria-invalid={!!errors.macCookieTimeout} onChange={(e) => set("macCookieTimeout", e.target.value)} />
								</Field>
								<Field label="Idle timeout" htmlFor="profile-idle" error={errors.idleTimeout} hint="none or a duration">
									<Input id="profile-idle" value={form.idleTimeout} aria-invalid={!!errors.idleTimeout} onChange={(e) => set("idleTimeout", e.target.value)} />
								</Field>
								<Field label="Status page refresh" htmlFor="profile-refresh" error={errors.statusAutorefresh}>
									<Input id="profile-refresh" value={form.statusAutorefresh} aria-invalid={!!errors.statusAutorefresh} onChange={(e) => set("statusAutorefresh", e.target.value)} />
								</Field>
							</div>

							<Field label="Open status page" htmlFor="profile-status-page">
								<Select value={form.openStatusPage} onValueChange={(v) => set("openStatusPage", v as OpenStatusPage)}>
									<SelectTrigger id="profile-status-page" className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{OPEN_STATUS_PAGE_OPTIONS.map((o) => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>

							{(
								[
									{ key: "addMacCookie", label: "Remember device (MAC cookie)" },
									{ key: "transparentProxy", label: "Transparent proxy" },
									{ key: "advertise", label: "Advertise" },
								] as const
							).map((item) => (
								<label key={item.key} className="flex min-h-9 items-center justify-between gap-3 text-sm">
									{item.label}
									<Switch checked={form[item.key]} onCheckedChange={(checked) => set(item.key, checked)} />
								</label>
							))}

							<Field label="Description (optional)" htmlFor="profile-description">
								<Textarea id="profile-description" value={form.description} onChange={(e) => set("description", e.target.value)} />
							</Field>
						</div>
					)}

					<Button size="lg" className="w-full" disabled={pending} onClick={submit}>
						{pending && <Loader2 className="animate-spin" />}
						{editing ? "Save changes" : "Create profile"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
