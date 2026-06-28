import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/Table";

import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";


export default function AccountsTable({ accounts, router }: any) {
	const resolveUser = (user: any) => {
		if (!user) return null;

		return {
			name: `${user.firstName} ${user.lastName}`,
			email: user.email,
			avatar: user?.avatar?.url || null,
		};
	};

	return (
		<div className="ui-card p-0 overflow-hidden">
			<Table>
				<TableHeader>
					<tr>
						<TableHead>WSNID</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Service</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>User</TableHead>
						<TableHead>Actions</TableHead>
					</tr>
				</TableHeader>

				<TableBody>
					{accounts.map((a: any) => {
						const user = resolveUser(a.user || a.userId);

						return (
							<TableRow
								key={a.id || a._id}
								className="cursor-pointer hover:bg-muted/50 transition-colors"
								onClick={() =>
									router.push(`/admin/accounts/${a.id || a._id}`)
								}
							>
								<TableCell>{a.wsnId}</TableCell>

								<TableCell>{a.accountType}</TableCell>

								<TableCell>{a.serviceType}</TableCell>
									<TableCell>
										<StatusBadge variant={a.profileStatus === "active" ? "successful" : a.profileStatus === "canceled" ? "failed" : a.profileStatus} size="md" withDot>
											{a.profileStatus}
										</StatusBadge>
									</TableCell>


								{/* ✅ FULL USER CELL RESTORED */}
								<TableCell>
									{user ? (
										<div className="flex items-center gap-2">
											<Avatar
												name={user.name}
												src={user.avatar}
											/>

											<div className="flex flex-col">
												<span className="font-medium">
													{user.name}
												</span>

												<span className="text-xs text-muted-foreground">
													{user.email}
												</span>
											</div>
										</div>
									) : (
										<span className="text-muted-foreground">
											Unknown user
										</span>
									)}
								</TableCell>

								<TableCell>
									<button
										onClick={(e) => {
											e.stopPropagation();
											router.push(
												`/admin/accounts/${a.id || a._id}`
											);
										}}
									>
										View
									</button>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}