"use client";

import Card, {
	CardHeader,
	CardContent,
} from "@/components/ui/Card";
import RouterStatusBadge from "./router-status-badge";
import type { Router } from "../api/router.types";


interface RouterCardProps {
	router: Router;
	selected?: boolean;
	onClick: () => void;
}


export default function RouterCard({
	router,
	selected,
	onClick,
}: RouterCardProps) {

	return (
		<Card
			onClick={onClick}
			className={`
				cursor-pointer
				transition-all
				hover:-translate-y-1
				${selected ? "ring-2 ring-primary" : ""}
			`}
		>

			<CardHeader>

				<div className="flex items-start justify-between">

					<div>
						<p className="font-semibold">
							{router.name}
						</p>

						<span className="text-xs text-muted-foreground">
							{router.code}
						</span>
					</div>


					<RouterStatusBadge
						status={router.status}
					/>

				</div>

			</CardHeader>


			<CardContent className="space-y-3">


				{/* HOST */}

				<div>

					<p className="text-sm font-medium">
						{router.host}:{router.port}
					</p>


					<p className="text-xs text-muted-foreground">
						{router.location || "No location"}

						{router.popName &&
							` • ${router.popName}`
						}
					</p>

				</div>



				{/* SERVICES */}

				<div className="flex flex-wrap gap-2">

					{router.supportedServices?.map(
						(service) => (
							<span
								key={service}
								className="px-2 py-1 text-xs rounded bg-muted"
							>
								{service}
							</span>
						)
					)}

				</div>



				{/* META */}

				<div className="flex items-center justify-between text-xs ">

					<span>
						Sessions:
						{" "}
						{router.currentSessions}
						/
						{router.maxSessions}
					</span>


					<span>
						{router.connectionType}
					</span>

				</div>



				{/* FLAGS */}

				<div className="flex items-center justify-between ">


					<div>

						{router.isDefaultRouter && (
							<span className="text-xs font-medium text-primary">
								Default Router
							</span>
						)}

					</div>



					{!router.isEnabled && (
						<span className="text-xs text-red-600 ">
							Disabled
						</span>
					)}


				</div>


			</CardContent>

		</Card>
	);
}