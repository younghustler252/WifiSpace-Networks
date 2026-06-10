"use client";

import {
	AlertTriangle,
	PauseCircle,
	PlayCircle,
	Plus,
	XCircle,
} from "lucide-react";

import Card, {
	CardContent,
	CardHeader,
} from "@/components/ui/Card";

import Button from "@/components/ui/Button";

interface Props {
	isSuspended: boolean;

	onSuspend: () => void;

	onCancel: () => void;

	onResume: () => void;

	onExtend: () => void;

	onForceExpire: () => void;

	loadingStates: {
		resume: boolean;
		extend: boolean;
		forceExpire: boolean;
	};
}

export default function SubscriptionAdminActions({
	isSuspended,
	onSuspend,
	onCancel,
	onResume,
	onExtend,
	onForceExpire,
	loadingStates,
}: Props) {
	return (
		<Card>

			<CardHeader>
				<h3 className="font-semibold">
					Administrative Actions
				</h3>
			</CardHeader>

			<CardContent className="flex flex-wrap gap-3">

				{!isSuspended && (
					<Button
						variant="outline"
						leftIcon={
							<PauseCircle size={16} />
						}
						onClick={onSuspend}
					>
						Suspend
					</Button>
				)}

				{isSuspended && (
					<Button
						variant="accent"
						leftIcon={
							<PlayCircle size={16} />
						}
						isLoading={
							loadingStates.resume
						}
						onClick={onResume}
					>
						Resume
					</Button>
				)}

				<Button
					variant="soft"
					leftIcon={
						<Plus size={16} />
					}
					isLoading={
						loadingStates.extend
					}
					onClick={onExtend}
				>
					Extend 30 Days
				</Button>

				<Button
					variant="danger"
					leftIcon={
						<XCircle size={16} />
					}
					onClick={onCancel}
				>
					Cancel
				</Button>

				<Button
					variant="outline"
					leftIcon={
						<AlertTriangle size={16} />
					}
					isLoading={
						loadingStates.forceExpire
					}
					onClick={onForceExpire}
				>
					Force Expire
				</Button>

			</CardContent>

		</Card>
	);
}