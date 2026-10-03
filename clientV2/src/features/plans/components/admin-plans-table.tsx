import { MoreHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDataLimit, formatDuration } from "@/lib/format";
import type { Plan } from "../types/plans.types";

export type PlanAction = "edit" | "activate" | "deactivate" | "delete";

interface AdminPlansTableProps {
	items: Plan[];
	onAction: (action: PlanAction, plan: Plan) => void;
}

const serviceLabel = (plan: Plan) => (plan.serviceType === "hotspot" ? "Hotspot" : "Home");

function RowMenu({ plan, onAction }: { plan: Plan; onAction: (action: PlanAction) => void }) {
	const active = plan.status === "active";

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={`Actions for ${plan.name}`}>
					<MoreHorizontal className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				<DropdownMenuItem onSelect={() => onAction("edit")}>Edit</DropdownMenuItem>
				{active ? (
					<DropdownMenuItem onSelect={() => onAction("deactivate")}>Deactivate…</DropdownMenuItem>
				) : (
					<DropdownMenuItem onSelect={() => onAction("activate")}>Activate</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem
                    disabled={active}
                    className="text-destructive focus:text-destructive"
                    onSelect={() => onAction("delete")}
                >
                    {active ? "Delete (deactivate first)" : "Delete…"}
                </DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function AdminPlansTable({ items, onAction }: AdminPlansTableProps) {
	return (
		<>
			<div className="hidden md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Plan</TableHead>
							<TableHead className="text-right">Price</TableHead>
							<TableHead>Speed</TableHead>
							<TableHead>Lasts</TableHead>
							<TableHead>Data</TableHead>
							<TableHead className="text-right">Devices</TableHead>
							<TableHead className="text-right">Status</TableHead>
							<TableHead className="w-12" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((plan) => (
							<TableRow key={plan.id}>
								<TableCell>
									<p className="text-[13px] font-medium">{plan.name}</p>
									<p className="text-[11px] text-muted-foreground">{serviceLabel(plan)}</p>
								</TableCell>
								<TableCell className="text-mono text-right text-[13px]">{formatCurrency(plan.price)}</TableCell>
								<TableCell className="text-mono text-[13px]">{plan.speedRate}</TableCell>
								<TableCell className="whitespace-nowrap text-[13px]">{formatDuration(plan.durationValue, plan.durationUnit)}</TableCell>
								<TableCell className="whitespace-nowrap text-[13px]">{formatDataLimit(plan.dataLimitBytes)}</TableCell>
								<TableCell className="text-mono text-right text-[13px]">{plan.devicesAllowed}</TableCell>
								<TableCell className="text-right">
									<StatusBadge status={plan.status} />
								</TableCell>
								<TableCell className="text-right">
									<RowMenu plan={plan} onAction={(a) => onAction(a, plan)} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<ul className="divide-y md:hidden">
				{items.map((plan) => (
					<li key={plan.id} className="flex items-center gap-2 py-3 first:pt-0 last:pb-0">
						<div className="min-w-0 flex-1 space-y-1.5">
							<p className="text-[13px] font-medium">
								{plan.name} <span className="font-normal text-muted-foreground">· {serviceLabel(plan)}</span>
							</p>
							<p className="text-mono text-[13px]">{formatCurrency(plan.price)}</p>
							<p className="text-[11px] text-muted-foreground">
								{plan.speedRate} · {formatDuration(plan.durationValue, plan.durationUnit)} · {formatDataLimit(plan.dataLimitBytes)} · {plan.devicesAllowed} device
								{plan.devicesAllowed === 1 ? "" : "s"}
							</p>
							<StatusBadge status={plan.status} />
						</div>
						<RowMenu plan={plan} onAction={(a) => onAction(a, plan)} />
					</li>
				))}
			</ul>
		</>
	);
}