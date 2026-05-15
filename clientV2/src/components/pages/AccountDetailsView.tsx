"use client";

import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import {
	Fingerprint,
	Settings,
	Shield,
	Building2,
	Wifi,
	Router,
	KeyRound,
	CheckCircle,
	Clock,
	XCircle,
	RefreshCw,
} from "lucide-react";

import Button from "../ui/Button";

type Props = {
	account: any;
	role?: "customer" | "admin" | "staff";
};

const AccountDetailsView = ({
	account,
	role = "customer",
}: Props) => {

	if (!account) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No account data found
			</div>
		);
	}

	return (
		<div className="space-y-8">

			{/* ================= HERO ================= */}
			<div className="ui-card flex flex-col md:flex-row items-center gap-6">

				<div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
					<Wifi className="text-accent" size={20} />
				</div>

				<div className="flex-1 text-center md:text-left">

					<h2 className="text-2xl font-semibold">
						{account?.wsnId}
					</h2>

					<p className="text-sm text-muted-foreground mt-1">
						{account?.accountType} • {account?.serviceType}
					</p>

					<p className="text-xs text-muted-foreground mt-1 capitalize">
						Status: {account?.profileStatus}
					</p>

				</div>

				{account?.profileStatus === "active" && (
					<span className="ui-badge ui-badge-success">Active</span>
				)}

				{account?.profileStatus === "pending" && (
					<span className="ui-badge bg-warning/20 text-warning">
						Pending
					</span>
				)}

				{account?.profileStatus === "suspended" && (
					<span className="ui-badge ui-badge-danger">
						Suspended
					</span>
				)}

			</div>

			{/* ================= GRID ================= */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

				{/* ================= LEFT ================= */}
				<Card>

					<CardHeader>
						<div className="flex items-center gap-2">
							<Settings size={18} className="text-accent" />
							Account Details
						</div>
					</CardHeader>

					<CardContent className="ui-stack">

						<Info
							label="WSN ID"
							value={account.wsnId}
							icon={<Fingerprint size={14} />}
						/>

						<Info
							label="Account Type"
							value={account.accountType}
						/>

						<Info
							label="Service Type"
							value={account.serviceType}
						/>

						<Info
							label="Router Profile"
							value={account.routerProfile}
						/>

						<Info
							label="Status"
							value={account.profileStatus}
							icon={<Shield size={14} />}
						/>

						{account.accountType === "business" && (
							<>
								<div className="pt-4 border-t border-border" />

								<Info
									label="Business Name"
									value={account.businessName || "Not set"}
									icon={<Building2 size={14} />}
								/>

								<Info
									label="RC Number"
									value={
										account.companyRegistrationNumber ||
										"Not set"
									}
								/>

								<Info
									label="Tax ID"
									value={account.taxId || "Not set"}
								/>
							</>
						)}

					</CardContent>

				</Card>

				{/* ================= RIGHT ================= */}
				<div className="ui-stack-lg">

					{/* ================= ROUTER MANAGEMENT ================= */}
					<Card>

						<CardHeader>
							<div className="flex items-center gap-2">
								<Router size={18} className="text-warning" />
								Router Management
							</div>
						</CardHeader>

						<CardContent className="space-y-4">

							<div className="ui-card bg-muted/40">

								<div className="flex items-start justify-between gap-4">

									<div>
										<h3 className="text-lg font-semibold">
											{account?.routerBrand || "MikroTik Router"}
										</h3>

										<p className="text-xs text-muted-foreground mt-1">
											Router IP: {account?.routerIp || "192.168.88.1"}
										</p>

										<p className="text-xs text-muted-foreground mt-1">
											Last synced: {account?.lastSync || "Just now"}
										</p>
									</div>

									<span className="ui-badge ui-badge-success flex items-center gap-1">
										<CheckCircle size={12} />
										Connected
									</span>

								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">

									<Button className="w-full flex items-center justify-center gap-2">
										<KeyRound size={15} />
										Change Password
									</Button>

									<Button
										variant="outline"
										className="w-full flex items-center justify-center gap-2"
									>
										<RefreshCw size={15} />
										Reboot Router
									</Button>

								</div>

							</div>

						</CardContent>

					</Card>

					{/* ================= NETWORK STATUS ================= */}
					<Card>

						<CardHeader>
							<div className="flex items-center gap-2">
								<Wifi size={18} className="text-success" />
								Network Status
							</div>
						</CardHeader>

						<CardContent className="ui-stack">

							<div className="ui-card flex items-center justify-between">

								<div>
									<p className="font-medium">
										Connection Status
									</p>

									<p className="text-xs text-muted-foreground">
										Current router connectivity state
									</p>
								</div>

								<span className="ui-badge ui-badge-success">
									Online
								</span>

							</div>

							<div className="ui-card flex items-center justify-between">

								<div>
									<p className="font-medium">
										Signal Strength
									</p>

									<p className="text-xs text-muted-foreground">
										Excellent connection quality
									</p>
								</div>

								<span className="ui-badge bg-primary/20 text-primary">
									92%
								</span>

							</div>

							<div className="ui-card flex items-center justify-between">

								<div>
									<p className="font-medium">
										Uptime
									</p>

									<p className="text-xs text-muted-foreground">
										Time since last reboot
									</p>
								</div>

								<span className="ui-badge">
									14 days
								</span>

							</div>

						</CardContent>

					</Card>

				</div>

			</div>

		</div>
	);
};

export default AccountDetailsView;

/* ================= INFO ================= */
const Info = ({
	label,
	value,
	icon,
}: {
	label: string;
	value?: string;
	icon?: React.ReactNode;
}) => (
	<div>
		<label className="text-xs text-muted-foreground uppercase">
			{label}
		</label>

		<div className="mt-1 flex items-center gap-2">
			{icon && (
				<span className="text-muted-foreground">
					{icon}
				</span>
			)}

			<p className="font-medium">
				{value || "—"}
			</p>
		</div>
	</div>
);