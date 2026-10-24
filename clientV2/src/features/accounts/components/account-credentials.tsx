"use client";

import { useState } from "react";
import { Copy, Eye, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { can } from "@/lib/rbac";
import { settleFailure } from "@/lib/api/failure";
import { useAuthStore } from "@/stores/auth.store";
import { ACCOUNT_ERROR_CODES } from "../constants";
import { useAdminAccountActions } from "../hooks/use-accounts";
import { WSN_ID_PATTERN } from "../schemas/accounts.schemas";
import type { AdminAccount, RouterCredentialsView, RouterPasswordResult } from "../types/accounts.types";

async function copyText(label: string, value: string) {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(`${label} copied`);
	} catch {
		toast.error("Couldn't copy. Select and copy it manually.");
	}
}

function CopyLine({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-3 py-2.5">
			<div className="min-w-0">
				<p className="text-[11px] text-muted-foreground">{label}</p>
				<p className="text-mono truncate text-base">{value}</p>
			</div>
			<Button variant="outline" size="icon" className="bg-surface-2" aria-label={`Copy ${label.toLowerCase()}`} onClick={() => copyText(label, value)}>
				<Copy className="size-4" />
			</Button>
		</div>
	);
}

interface CredentialsBoxProps {
	username: string;
	password: string;
	generated?: boolean;
}

export function CredentialsBox({ username, password, generated }: CredentialsBoxProps) {
	return (
		<div className="space-y-3">
			<div className="card-elevated divide-y bg-surface-2 px-4">
				<CopyLine label="Username" value={username} />
				<CopyLine label="Password" value={password} />
			</div>
			{generated && <p className="text-[12px] text-muted-foreground">The system generated this password.</p>}
			<Button variant="outline" className="w-full bg-surface-2" onClick={() => copyText("Login", `Username: ${username}\nPassword: ${password}`)}>
				<Copy />
				Copy both
			</Button>
		</div>
	);
}

function syncNotice(result: RouterPasswordResult) {
	switch (result.routerSync.status) {
		case "pending":
			return <Notice tone="info" title="Updating the router…" text="The new password is queued and is pushed to the router within seconds." />;
		case "failed":
			return <Notice tone="warning" title="Saved, but the router wasn't updated" text="Run Reset password again to retry the router update." />;
		default:
			return null;
	}
}

function ResetPasswordDialog({ account, onClose }: { account: AdminAccount; onClose: () => void }) {
	const { setRouterPassword } = useAdminAccountActions();
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<RouterPasswordResult | null>(null);

	async function submit() {
		const value = password.trim();
		if (value && (value.length < 6 || value.length > 64 || /\s/.test(value))) {
			setError("Use 6 to 64 characters with no spaces");
			return;
		}

		const res = await setRouterPassword.mutateAsync({ id: account.id, password: value || undefined });

		if (!res.success) {
			if (res.code === ACCOUNT_ERROR_CODES.ROUTER_PASSWORD_INVALID) {
				setError(res.message);
				return;
			}
			if (settleFailure(res, "The password reset")) onClose();
			return;
		}

		setResult(res.data as RouterPasswordResult);
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !setRouterPassword.isPending && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{result ? "Router password saved" : "Set or reset router password"}</DialogTitle>
					<DialogDescription>
						{result ? "Copy it now. You can also reveal it later from this card." : "Type a password, or leave it empty to generate a random one."}
					</DialogDescription>
				</DialogHeader>

				{result ? (
					<div className="space-y-4">
						<CredentialsBox username={result.username} password={result.password} generated={result.generated} />
						{syncNotice(result)}
						<Button size="lg" className="w-full" onClick={onClose}>
							Done
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						<Notice
							tone="warning"
							title="Be sure about the password"
							text="If this account is already on a router, the new password is pushed to it straight away. Customers already using the old one will need the new one."
						/>
						<Field label="New password (optional)" htmlFor="router-password" error={error ?? undefined} hint="6 to 64 characters, no spaces.">
							<Input
								id="router-password"
								autoComplete="off"
								value={password}
								aria-invalid={!!error}
								onChange={(e) => {
									setPassword(e.target.value);
									setError(null);
								}}
							/>
						</Field>
						<Button size="lg" className="w-full" disabled={setRouterPassword.isPending} onClick={submit}>
							{setRouterPassword.isPending && <Loader2 className="animate-spin" />}
							{password.trim() ? "Save password" : "Generate and save"}
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export function RouterCredentialsCard({ account }: { account: AdminAccount }) {
	const { revealCredentials } = useAdminAccountActions();
	const [creds, setCreds] = useState<RouterCredentialsView | null>(null);
	const [forbidden, setForbidden] = useState(false);
	const [resetting, setResetting] = useState(false);

	async function reveal() {
		const res = await revealCredentials.mutateAsync(account.id);

		if (!res.success) {
			if (res.status === 403) setForbidden(true);
			toast.error(res.message);
			return;
		}

		setCreds(res.data as RouterCredentialsView);
	}

	return (
		<SectionCard title="Router login" description="What the engineer types into the MikroTik.">
			<div className="space-y-4">
				{creds ? (
					creds.passwordSet && creds.password ? (
						<div className="space-y-3">
							<CredentialsBox username={creds.username} password={creds.password} />
							{creds.profile && <p className="text-[12px] text-muted-foreground">Profile: {creds.profile}</p>}
							{creds.router && (
								<p className="text-[12px] text-muted-foreground">
									Router: {creds.router.name} · <span className="text-mono">{creds.router.code}</span>
								</p>
							)}
							<Button variant="ghost" size="sm" onClick={() => setCreds(null)}>
								Hide
							</Button>
						</div>
					) : (
						<Notice tone="warning" title="No password stored" text="This is an older account. Set the real password once so it can be revealed later." />
					)
				) : (
					!forbidden && (
						<>
							<p className="text-[12px] text-muted-foreground">Viewing the password is recorded in the audit log with your name.</p>
							<Button variant="outline" className="w-full bg-surface-2" disabled={revealCredentials.isPending} onClick={reveal}>
								{revealCredentials.isPending ? <Loader2 className="animate-spin" /> : <Eye />}
								Reveal login
							</Button>
						</>
					)
				)}

				{forbidden && <Notice tone="warning" title="You can't view router passwords" text="Ask a superadmin." />}

				<Button variant="outline" className="w-full bg-surface-2" onClick={() => setResetting(true)}>
					<KeyRound />
					Set or reset password…
				</Button>
			</div>

			{resetting && (
				<ResetPasswordDialog
					account={account}
					onClose={() => {
						setResetting(false);
						setCreds(null);
					}}
				/>
			)}
		</SectionCard>
	);
}

export function ChangeWsnIdDialog({ account, onClose }: { account: AdminAccount; onClose: () => void }) {
	const { changeWsnId } = useAdminAccountActions();
	const role = useAuthStore((s) => s.user?.role);
	const [wsnId, setWsnId] = useState(account.wsnId);
	const [error, setError] = useState<string | null>(null);
	const [locked, setLocked] = useState(false);
	const [forcing, setForcing] = useState(false);
	const [warning, setWarning] = useState<string | null>(null);
	const canForce = can(role, "accounts:force-wsn-id");
	const next = wsnId.trim().toUpperCase();

	async function submit(force = false) {
		if (next === account.wsnId) {
			onClose();
			return;
		}
		if (!WSN_ID_PATTERN.test(next)) {
			setError("Use 3 to 20 characters. Start with a letter. Only letters, numbers and dashes");
			return false;
		}

		const res = await changeWsnId.mutateAsync({ id: account.id, body: { wsnId: next, force: force || undefined } });

		if (!res.success) {
			if (res.code === ACCOUNT_ERROR_CODES.WSN_ID_LOCKED) {
				setLocked(true);
				setError(res.message);
				return false;
			}
			if (res.code === ACCOUNT_ERROR_CODES.WSN_ID_CONFLICT || res.code === ACCOUNT_ERROR_CODES.WSN_ID_INVALID) {
				setError(res.message);
				return false;
			}
			return settleFailure(res, "The change");
		}

		const result = res.data as { warning: string | null };
		if (result.warning) {
			setWarning(result.warning);
			return;
		}

		toast.success(`WSN ID changed to ${next}`);
		onClose();
	}

	if (warning) {
		return (
			<Dialog open onOpenChange={(open) => !open && onClose()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>WSN ID changed to {next}</DialogTitle>
						<DialogDescription>One more step on the router.</DialogDescription>
					</DialogHeader>
					<Notice tone="warning" title="Rename the router user" text={warning} />
					<Button size="lg" className="w-full" onClick={onClose}>
						I understand
					</Button>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<>
			<Dialog open onOpenChange={(open) => !open && !changeWsnId.isPending && onClose()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change WSN ID</DialogTitle>
						<DialogDescription>The ID is also the router username. Currently {account.wsnId}.</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<Field label="New WSN ID" htmlFor="wsn-id" error={error ?? undefined} hint="3 to 20 characters. Starts with a letter. Letters, numbers and dashes only.">
							<Input
								id="wsn-id"
								autoCapitalize="characters"
								autoComplete="off"
								value={wsnId}
								aria-invalid={!!error}
								onChange={(e) => {
									setWsnId(e.target.value);
									setError(null);
									setLocked(false);
								}}
							/>
						</Field>

						{locked && canForce && (
							<Button variant="outline" className="w-full border-destructive/40 text-destructive" onClick={() => setForcing(true)}>
								<ShieldAlert />
								Force change…
							</Button>
						)}

						<Button size="lg" className="w-full" disabled={changeWsnId.isPending} onClick={() => submit()}>
							{changeWsnId.isPending && <Loader2 className="animate-spin" />}
							Change WSN ID
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{forcing && (
				<ConfirmDialog
					open
					destructive
					onOpenChange={(open) => !open && setForcing(false)}
					title={`Force change to ${next}?`}
					description="This will not rename the user on the router. You must rename it on the MikroTik yourself, or provisioning will create a duplicate."
					confirmLabel="Force change"
					onConfirm={async () => {
						const outcome = await submit(true);
						setForcing(false);
						return outcome;
					}}
				/>
			)}
		</>
	);
}
