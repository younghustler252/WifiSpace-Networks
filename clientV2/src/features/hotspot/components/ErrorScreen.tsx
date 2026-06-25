"use client";

import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function HotspotErrorScreen({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => void;
}) {
	return (
		<div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">

			<Card
				className="
					w-full
					max-w-md
					border-2
					border-red-200
				"
				hover={false}
			>
				<CardContent>

					<div className="flex flex-col items-center text-center ui-stack">

						{/* ICON */}
						<div
							className="
								h-16
								w-16
								rounded-full
								bg-red-100
								text-red-600
								flex
								items-center
								justify-center
							"
						>
							<AlertTriangle size={32} />
						</div>


						{/* TITLE */}
						<div>
							<h2 className="text-2xl font-bold">
								Connection Error
							</h2>

							<p className="text-muted-foreground mt-2">
								We couldn't complete your hotspot request.
							</p>
						</div>


						{/* MESSAGE */}
						<div
							className="
								w-full
								bg-red-50
								border
								border-red-100
								rounded-xl
								p-4
								text-sm
								text-red-700
							"
						>
							{message || "Something went wrong"}
						</div>


						{/* ACTION */}
						<Button
							fullWidth
							variant="accent"
							onClick={onRetry}
						>
							<div className="flex items-center justify-center gap-2">
								<RefreshCw size={16} />
								Try Again
							</div>
						</Button>

					</div>

				</CardContent>
			</Card>

		</div>
	);
}