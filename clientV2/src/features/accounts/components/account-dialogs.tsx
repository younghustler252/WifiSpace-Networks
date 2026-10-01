"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useRouters } from "@/features/routers/hooks/use-routers";
import { useAdminAccountActions } from "../hooks/use-accounts";
import type { AdminAccount } from "../types/accounts.types";
import type { AccountAction } from "./account-actions-menu";

interface DialogProps {
	account: AdminAccount;
	onClose: () => void;
}

function ApproveDialog({ account, onClose }: DialogProps) {
	const { approve } = useAdminAccountActions();
	const needsRouter = account.serviceType === "pppoe";
	const routers = useRouters(needsRouter);
	const [routerId, setRouterId] = useState("");

	function renderRouterPicker() {
		if (routers.isLoading) return <Skeleton className="h-11 rounded-lg" />;
		if (routers.isError) return <p className="text-sm text-destructive">We couldn&apos;t load routers. Close this and try again.</p>;
		if (!routers.data || routers.data.length === 0) {
			return <p className="text-sm text-muted-foreground">No routers found. Add a router before approving.</p>;
		}

		return (
			<Select value={routerId} onValueChange={setRouterId}>
				<SelectTrigger className="w-full" aria-label="Router">
					<SelectValue placeholder="Select a router" />
				</SelectTrigger>
				<SelectContent>
					{routers.data.map((router) => (
						<SelectItem key={router.id} value={router.id}>
							{router.name} · {router.code}
							{router.location ? ` · ${router.location}` : ""}
							{router.status === "offline" ? " (offline)" : ""}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			title={`Approve ${account.wsnId}?`}
			description={
				needsRouter
					? "Choose the router this customer will connect through. Only approve once the installation is arranged."
					: "This activates the account."
			}
			confirmLabel="Approve"
			confirmDisabled={needsRouter && !routerId}
			onConfirm={async () => {
				const res = await approve.mutateAsync({ id: account.id, routerId: routerId || undefined });
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("Account approved");
			}}
		>
			{needsRouter && renderRouterPicker()}
		</ConfirmDialog>
	);
}

function RejectDialog({ account, onClose }: DialogProps) {
	const { reject } = useAdminAccountActions();
	const [note, setNote] = useState("");
	const [error, setError] = useState<string | null>(null);

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			destructive
			title={`Reject ${account.wsnId}?`}
			description="The customer will be told their request wasn't approved. A reason is required."
			confirmLabel="Reject request"
			onConfirm={async () => {
				if (!note.trim()) {
					setError("A rejection reason is required");
					return false;
				}
				const res = await reject.mutateAsync({ id: account.id, note: note.trim() });
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("Request rejected");
			}}
		>
			<div className="space-y-2">
				<Textarea
					value={note}
					onChange={(e) => {
						setNote(e.target.value);
						setError(null);
					}}
					placeholder="Reason for rejection"
					aria-label="Reason for rejection"
					aria-invalid={!!error}
				/>
				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}
			</div>
		</ConfirmDialog>
	);
}

function NoteActionDialog({ account, action, onClose }: DialogProps & { action: "pause" | "terminate" }) {
	const { pause, terminate } = useAdminAccountActions();
	const [note, setNote] = useState("");
	const isTerminate = action === "terminate";

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			destructive={isTerminate}
			requireText={isTerminate ? account.wsnId : undefined}
			title={isTerminate ? `Terminate ${account.wsnId}?` : `Pause ${account.wsnId}?`}
			description={
				isTerminate
					? "This ends the service permanently. The customer goes offline and the account can't be resumed."
					: "The customer goes offline until you resume the account. Use this for maintenance or temporary holds."
			}
			confirmLabel={isTerminate ? "Terminate account" : "Pause account"}
			onConfirm={async () => {
				const mutation = isTerminate ? terminate : pause;
				const res = await mutation.mutateAsync({ id: account.id, note: note.trim() || undefined });
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success(isTerminate ? "Account terminated" : "Account paused");
			}}
		>
			<Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" aria-label="Note" />
		</ConfirmDialog>
	);
}

function SuspendResumeDialog({ account, action, onClose }: DialogProps & { action: "suspend" | "resume" }) {
	const { suspend, resume } = useAdminAccountActions();
	const isSuspend = action === "suspend";

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			destructive={isSuspend}
			title={isSuspend ? `Suspend ${account.wsnId}?` : `Resume ${account.wsnId}?`}
			description={
				isSuspend
					? "The customer loses service until you resume the account."
					: "Service is restored and the customer can go back online."
			}
			confirmLabel={isSuspend ? "Suspend account" : "Resume account"}
			onConfirm={async () => {
				const res = await (isSuspend ? suspend : resume).mutateAsync(account.id);
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success(isSuspend ? "Account suspended" : "Account resumed");
			}}
		/>
	);
}

interface AccountActionDialogProps extends DialogProps {
	action: AccountAction;
}

export function AccountActionDialog({ action, account, onClose }: AccountActionDialogProps) {
	switch (action) {
		case "approve":
			return <ApproveDialog account={account} onClose={onClose} />;
		case "reject":
			return <RejectDialog account={account} onClose={onClose} />;
		case "pause":
		case "terminate":
			return <NoteActionDialog account={account} action={action} onClose={onClose} />;
		case "suspend":
		case "resume":
			return <SuspendResumeDialog account={account} action={action} onClose={onClose} />;
	}
}