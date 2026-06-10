"use client";

import { useState } from "react";
import {
	Settings,
	Fingerprint,
	Shield,
	Building2,
	Pencil,
} from "lucide-react";

import Info from "../components/info";

type Props = {
	account: any;
	role?: "customer" | "superAdmin" | "staff";
};

const allowedFields = [
	"businessName",
	"taxId",
	"companyRegistrationNumber",
] as const;

const AccountOverview = ({ account, role = "customer" }: Props) => {
	if (!account) return null;

	const [isEditing, setIsEditing] = useState(false);

	const [formData, setFormData] = useState({
		businessName: account.businessName || "",
		taxId: account.taxId || "",
		companyRegistrationNumber:
			account.companyRegistrationNumber || "",
	});

	const canEdit = role === "superAdmin" || account?.isOwner;

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const isFieldEditable = (field: string) =>
		isEditing && allowedFields.includes(field as any);

	return (
		<div className="w-full min-w-0 rounded-xl border border-border bg-card p-5">

			{/* HEADER */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
					<Settings size={16} />
					Account Details
				</div>

				{canEdit && (
					<button
						onClick={() => setIsEditing(!isEditing)}
						className="flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-muted transition"
					>
						<Pencil size={12} />
						{isEditing ? "Done" : "Edit"}
					</button>
				)}
			</div>

			{/* CONTENT */}
			<div className="space-y-2 text-sm">

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

				{/* Editable Example */}

				{/* BUSINESS SECTION */}
				{account.accountType === "business" && (
					<div className="pt-3 mt-3 border-t border-border space-y-2">

						<Info
							label="Business Name"
							value={formData.businessName}
							icon={<Building2 size={14} />}
							editable={isFieldEditable("businessName")}
							onChange={(value) =>
								handleChange("businessName", value)
							}
						/>

						<Info
							label="RC Number"
							value={formData.companyRegistrationNumber}
							editable={isFieldEditable(
								"companyRegistrationNumber"
							)}
							onChange={(value) =>
								handleChange(
									"companyRegistrationNumber",
									value
								)
							}
						/>

						<Info
							label="Tax ID"
							value={formData.taxId}
							editable={isFieldEditable("taxId")}
							onChange={(value) =>
								handleChange("taxId", value)
							}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default AccountOverview;