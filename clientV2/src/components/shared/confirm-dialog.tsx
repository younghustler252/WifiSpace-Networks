"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel: string;
	destructive?: boolean;
	confirmDisabled?: boolean;
	requireText?: string;
	onConfirm: () => Promise<boolean | void>;
	children?: React.ReactNode;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	destructive,
	confirmDisabled,
	requireText,
	onConfirm,
	children,
}: ConfirmDialogProps) {
	const [pending, setPending] = useState(false);
	const [typed, setTyped] = useState("");
	const blocked = !!requireText && typed.trim().toLowerCase() !== requireText.toLowerCase();

	function handleOpenChange(next: boolean) {
		if (pending) return;
		onOpenChange(next);
	}

	async function confirm() {
		setPending(true);
		const done = await onConfirm();
		setPending(false);
		if (done !== false) onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				{children}

				{requireText && (
					<div className="space-y-2">
						<Label htmlFor="confirm-text" className="text-[13px] font-normal">
							Type <span className="text-mono font-medium">{requireText}</span> to confirm
						</Label>
						<Input id="confirm-text" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} />
					</div>
				)}

				<DialogFooter className="gap-2 sm:gap-2">
					<Button type="button" variant="outline" disabled={pending} onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="button"
						variant={destructive ? "destructive" : "default"}
						disabled={pending || blocked || confirmDisabled}
						onClick={confirm}
					>
						{pending && <Loader2 className="animate-spin" />}
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}