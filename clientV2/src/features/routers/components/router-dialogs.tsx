"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useRouterActions } from "../hooks/use-routers";
import type { NetworkRouter } from "../types/routers.types";

interface RouterDialogProps {
	router: NetworkRouter;
	onClose: () => void;
}

export function RebootRouterDialog({ router, onClose }: RouterDialogProps) {
	const { reboot } = useRouterActions();

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			destructive
			requireText={router.code}
			title={`Reboot ${router.name}?`}
			description="This disconnects every customer on this router until it comes back, usually a few minutes."
			confirmLabel="Reboot router"
			onConfirm={async () => {
				const res = await reboot.mutateAsync(router.id);
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("Reboot started");
			}}
		/>
	);
}

export function DeleteRouterDialog({ router, onClose }: RouterDialogProps) {
	const { remove } = useRouterActions();

	return (
		<ConfirmDialog
			open
			onOpenChange={(open) => !open && onClose()}
			destructive
			requireText={router.code}
			title={`Delete ${router.name}?`}
			description="This removes the router from WifiSpace. Make sure no accounts still depend on it."
			confirmLabel="Delete router"
			onConfirm={async () => {
				const res = await remove.mutateAsync(router.id);
				if (!res.success) {
					toast.error(res.message);
					return false;
				}
				toast.success("Router deleted");
			}}
		/>
	);
}