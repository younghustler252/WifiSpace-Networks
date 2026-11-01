"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { settleFailure } from "@/lib/api/failure";
import { ACCOUNT_ERROR_CODES } from "../constants";
import { useAdminAccountActions } from "../hooks/use-accounts";
import type { AdminAccount, ChangeAccessMethodResult } from "../types/accounts.types";
import { CredentialsBox } from "./account-credentials";

const MAC_PATTERN = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;
const LABEL = { ppp: "PPP (username and password)", ipoe: "IPoE (MAC address)" } as const;

export function ChangeAccessMethodDialog({ account, onClose }: { account: AdminAccount; onClose: () => void }) {
	const { changeAccessMethod } = useAdminAccountActions();
	const current = account.accessMethod ?? "ipoe";
	const target = current === "ipoe" ? "ppp" : "ipoe";
	const [mac, setMac] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<{ field: "mac" | "password"; message: string } | null>(null);
	const [result, setResult] = useState<ChangeAccessMethodResult | null>(null);
	const [confirming, setConfirming] = useState(false);

	async function submit() {
		if (target === "ipoe" && !MAC_PATTERN.test(mac.trim())) {
			setError({ field: "mac", message: "Enter a MAC address like AA:BB:CC:DD:EE:FF" });
			return;
		}
		const pass = password.trim();
		if (target === "ppp" && pass && (pass.length < 6 || pass.length > 64 || /\s/.test(pass))) {
			setError({ field: "password", message: "Use 6 to 64 characters with no spaces" });
			return;
		}

		const res = await changeAccessMethod.mutateAsync({
			id: account.id,
			body:
				target === "ipoe"
					? { accessMethod: "ipoe", macAddress: mac.trim().replace(/-/g, ":").toUpperCase() }
					: { accessMethod: "ppp", routerPassword: pass || undefined },
		});

		if (!res.success) {
			setConfirming(false);
			if (res.code === ACCOUNT_ERROR_CODES.MAC_ADDRESS_INVALID) {
				setError({ field: "mac", message: res.message });
				return;
			}
			if (res.code === ACCOUNT_ERROR_CODES.ROUTER_PASSWORD_INVALID) {
				setError({ field: "password", message: res.message });
				return;
			}
			if (
				res.code === ACCOUNT_ERROR_CODES.ACCESS_METHOD_UNCHANGED ||
				res.code === ACCOUNT_ERROR_CODES.ACCESS_METHOD_NOT_SUPPORTED ||
				res.code === ACCOUNT_ERROR_CODES.ACCOUNT_HAS_NO_ROUTER ||
				res.code === ACCOUNT_ERROR_CODES.IPOE_PROFILE_MISSING ||
				res.code === ACCOUNT_ERROR_CODES.PPP_PROFILE_MISSING
			) {
				toast.error(res.message);
				return;
			}
			if (settleFailure(res, "The change")) onClose();
			return;
		}

		setResult(res.data as ChangeAccessMethodResult);
	}

	if (result) {
		const pending = result.provisioning.status === "pending";

		return (
			<Dialog open onOpenChange={(open) => !open && onClose()}>
				<DialogContent className="max-h-[90svh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Now on {result.account.accessMethod === "ppp" ? "PPP" : "IPoE"}</DialogTitle>
						<DialogDescription>
							{pending ? "Updating the router. The subscription page shows when it's done." : "No active plan, so the router changes at the next activation."}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{result.routerCredentials && (
							<>
								<p className="text-sm font-medium">Router login for the engineer</p>
								<CredentialsBox username={result.routerCredentials.username} password={result.routerCredentials.password} generated={result.routerCredentials.generated} />
							</>
						)}
						{pending && <Notice tone="info" title="Updating router" text="The old router login is removed and the new one created in one background job." />}
						<Button size="lg" className="w-full" onClick={onClose}>
							Done
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open onOpenChange={(open) => !open && !changeAccessMethod.isPending && onClose()}>
			<DialogContent className="max-h-[90svh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Change access method</DialogTitle>
					<DialogDescription>
						Currently {LABEL[current]}. Switch to {LABEL[target]}.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					{target === "ipoe" ? (
						<Field label="Customer router MAC address" htmlFor="access-mac" error={error?.field === "mac" ? error.message : undefined}>
							<Input
								id="access-mac"
								placeholder="AA:BB:CC:DD:EE:FF"
								autoCapitalize="characters"
								autoComplete="off"
								value={mac}
								aria-invalid={error?.field === "mac"}
								onChange={(e) => {
									setMac(e.target.value);
									setError(null);
								}}
							/>
						</Field>
					) : (
						<Field label="Router password (optional)" htmlFor="access-password" error={error?.field === "password" ? error.message : undefined} hint="6 to 64 characters. Leave empty to reuse the saved one or generate one.">
							<Input
								id="access-password"
								autoComplete="off"
								value={password}
								aria-invalid={error?.field === "password"}
								onChange={(e) => {
									setPassword(e.target.value);
									setError(null);
								}}
							/>
						</Field>
					)}

					{confirming ? (
						<div className="space-y-3">
							<Notice tone="warning" title="This removes the customer's current router login and creates the new one." text="If they have an active plan, they may lose connection briefly while the router updates." />
							<div className="grid grid-cols-2 gap-2">
								<Button variant="outline" size="lg" className="bg-surface-2" disabled={changeAccessMethod.isPending} onClick={() => setConfirming(false)}>
									Back
								</Button>
								<Button size="lg" disabled={changeAccessMethod.isPending} onClick={submit}>
									{changeAccessMethod.isPending && <Loader2 className="animate-spin" />}
									Confirm
								</Button>
							</div>
						</div>
					) : (
						<Button
							size="lg"
							className="w-full"
							onClick={() => {
								if (target === "ipoe" && !MAC_PATTERN.test(mac.trim())) {
									setError({ field: "mac", message: "Enter a MAC address like AA:BB:CC:DD:EE:FF" });
									return;
								}
								setConfirming(true);
							}}
						>
							Switch to {target === "ppp" ? "PPP" : "IPoE"}
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
