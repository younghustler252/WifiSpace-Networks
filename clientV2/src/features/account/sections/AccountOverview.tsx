"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Settings,
	Fingerprint,
	Shield,
	Building2,
	Pencil,
	Cpu,
	Lock,
	Timer,
} from "lucide-react";

import Info from "../components/info";
import { accountApi } from "@/lib/api/account";

type Props = {
	account: any;
	role?: "customer" | "superAdmin" | "staff";
};

// Fields that standard customers are allowed to edit
const customerAllowedFields = [
	"businessName",
	"taxId",
	"companyRegistrationNumber",
] as const;

// Fields that superAdmin can edit (everything except immutable DB keys)
const adminAllowedFields = [
	"wsnId",
	"accountType",
	"serviceType",
	"routerProfile",
	"profileStatus",
	"routerPassword",
	"limitUptime",
	"businessName",
	"taxId",
	"companyRegistrationNumber",
] as const;

const AccountOverview = ({ account, role = "customer" }: Props) => {
	if (!account) return null;

	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);

	const [formData, setFormData] = useState({
		wsnId: account.wsnId || "",
		accountType: account.accountType || "personal",
		serviceType: account.serviceType || "pppoe",
		routerProfile: account.routerProfile || "default",
		profileStatus: account.profileStatus || "pending",
		routerPassword: account.routerPassword || "",
		limitUptime: account.limitUptime || "0",
		businessName: account.businessName || "",
		taxId: account.taxId || "",
		companyRegistrationNumber: account.companyRegistrationNumber || "",
	});

	const isAdmin = role === "superAdmin";
	const canEdit = isAdmin || account?.isOwner;

	const { mutate: updateAccountMutation, isPending } = useMutation({
		mutationFn: async (updatedData: typeof formData) => {
			const targetId = account.id || account._id;
			return accountApi.updateAccount(targetId, updatedData);
		},
		onSuccess: () => {
			setIsEditing(false);
			queryClient.invalidateQueries({ queryKey: ["account-details", account.id || account._id] });
			window.location.reload();
		},
		onError: (err: any) => {
			console.error("Account profile update failed:", err);
			alert(err?.message || "Failed to update account profile.");
		},
	});

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const isFieldEditable = (field: string) => {
		if (!isEditing) return false;
		if (isAdmin) return adminAllowedFields.includes(field as any);
		return customerAllowedFields.includes(field as any);
	};

	const handleSave = () => {
		updateAccountMutation(formData);
	};

	return (
		<div className="w-full min-w-0 rounded-xl border border-border bg-card p-5 relative">
			
			{isPending && (
				<div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-20 text-xs font-semibold text-neutral-500 animate-pulse">
					Saving configuration updates...
				</div>
			)}

			{/* HEADER */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
					<Settings size={16} />
					Account Details
				</div>

				{canEdit && (
					<button
						disabled={isPending}
						onClick={() => isEditing ? handleSave() : setIsEditing(true)}
						className="flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-muted transition disabled:opacity-50"
					>
						<Pencil size={12} />
						{isEditing ? (isPending ? "Saving..." : "Save") : "Edit"}
					</button>
				)}
			</div>

			{/* CONTENT */}
			<div className="space-y-2 text-sm">

				<Info
					label="WSN ID"
					value={formData.wsnId}
					icon={<Fingerprint size={14} />}
					editable={isFieldEditable("wsnId")}
					onChange={(value) => handleChange("wsnId", value)}
				/>

				{/* ✅ Account Type Dropdown */}
				<Info
					label="Account Type"
					value={formData.accountType}
					editable={isFieldEditable("accountType")}
					type="select"
					options={[
						{ label: "Personal Profile", value: "personal" },
						{ label: "Corporate Business", value: "business" }
					]}
					onChange={(value) => handleChange("accountType", value)}
				/>

				{/* ✅ Service Type Dropdown */}
				<Info
					label="Service Type"
					value={formData.serviceType}
					editable={isFieldEditable("serviceType")}
					type="select"
					options={[
						{ label: "PPPoE Connection", value: "pppoe" },
						{ label: "Captive Hotspot", value: "hotspot" }
					]}
					onChange={(value) => handleChange("serviceType", value)}
				/>

				<Info
					label="Router Profile"
					value={formData.routerProfile}
					icon={<Cpu size={14} />}
					editable={isFieldEditable("routerProfile")}
					onChange={(value) => handleChange("routerProfile", value)}
				/>

				{/* ✅ Status Dropdown */}
				<Info
					label="Status"
					value={formData.profileStatus}
					icon={<Shield size={14} />}
					editable={isFieldEditable("profileStatus")}
					type="select"
					options={[
						{ label: "Pending Verification", value: "pending" },
						{ label: "Synced / Active Profile", value: "synced" },
						{ label: "Failed Context Status", value: "failed" }
					]}
					onChange={(value) => handleChange("profileStatus", value)}
				/>

				{isAdmin && (
					<>
						<Info
							label="Router Password"
							value={formData.routerPassword}
							icon={<Lock size={14} />}
							editable={isFieldEditable("routerPassword")}
							onChange={(value) => handleChange("routerPassword", value)}
						/>

						<Info
							label="Limit Uptime"
							value={formData.limitUptime}
							icon={<Timer size={14} />}
							editable={isFieldEditable("limitUptime")}
							onChange={(value) => handleChange("limitUptime", value)}
						/>
					</>
				)}

				{/* BUSINESS SECTION */}
				{formData.accountType === "business" && (
					<div className="pt-3 mt-3 border-t border-border space-y-2">

						<Info
							label="Business Name"
							value={formData.businessName}
							icon={<Building2 size={14} />}
							editable={isFieldEditable("businessName")}
							onChange={(value) => handleChange("businessName", value)}
						/>

						<Info
							label="RC Number"
							value={formData.companyRegistrationNumber}
							editable={isFieldEditable("companyRegistrationNumber")}
							onChange={(value) => handleChange("companyRegistrationNumber", value)}
						/>

						<Info
							label="Tax ID"
							value={formData.taxId}
							editable={isFieldEditable("taxId")}
							onChange={(value) => handleChange("taxId", value)}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default AccountOverview;
