"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
	Building2,
	Hash,
	Server,
	Wifi,
	Router as RouterIcon,
	Lock,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useRouters } from "@/features/router/hooks/use-router";

interface FormValues {
	wsnId?: string;
	accountType?: "personal" | "business";
	serviceType: "pppoe" | "hotspot";
	routerProfile: string;
	routerId?: string;
	profileStatus?:
		| "pending"
		| "active"
		| "suspended"
		| "canceled";

	businessName?: string;
	companyRegistrationNumber?: string;
	taxId?: string;

	routerPassword?: string;

	macAddress?: string;
	limitUptime?: string;
}

interface Props {
	onSubmit: (data: any) => void;
	isLoading?: boolean;
	userId: string;
	role: "superadmin" | "staff" | "customer";
}

export default function AccountForm({
	onSubmit,
	isLoading,
	userId,
	role,
}: Props) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
	} = useForm<FormValues>({
		defaultValues: {
			wsnId: "",
			accountType: "personal",
			serviceType: "pppoe",
			routerProfile: "default",
			routerId: "",
			profileStatus: "pending",
			businessName: "",
			companyRegistrationNumber: "",
			taxId: "",
			routerPassword: "",
			macAddress: "",
			limitUptime: "",
		},
	});

	// ================= ROUTERS =================
	const { data: routerResponse, isLoading: routersLoading } = useRouters()

	const routers = routerResponse ?? [];

	// ================= WATCHERS =================
	const serviceType = watch("serviceType");
	const accountType = watch("accountType");
	const routerId = watch("routerId");

	const isPPPoE = serviceType === "pppoe";
	const isBusiness = isPPPoE && accountType === "business";
	const isStaff = role === "superadmin" || role === "staff";

	// ================= AUTO PROFILE =================
	React.useEffect(() => {
		const selectedRouter = routers.find(
			(router: any) => router.id === routerId
		);

		if (selectedRouter && !watch("routerProfile")) {
			setValue("routerProfile", "default");
		}
	}, [routerId, routers, setValue, watch]);

	// ================= SUBMIT =================
	const submit = (data: FormValues) => {
		onSubmit({
			...data,

			// normalize MAC to backend expectation
			macAddress: data.macAddress
				? data.macAddress.toUpperCase()
				: undefined,

			accountType:
				data.serviceType === "pppoe"
					? data.accountType
					: undefined,

			companyRegistrationNumber:
				data.serviceType === "pppoe" &&
				data.accountType === "business"
					? data.companyRegistrationNumber
					: undefined,

			taxId:
				data.serviceType === "pppoe" &&
				data.accountType === "business"
					? data.taxId
					: undefined,

			businessName:
				data.serviceType === "pppoe" &&
				data.accountType === "business"
					? data.businessName
					: undefined,

			routerPassword: data.routerPassword || undefined,

			userId,
		});
	};

	return (
		<form onSubmit={handleSubmit(submit)} className="max-w-5xl mx-auto space-y-8">

			{/* ================= ACCOUNT ================= */}
			<section className="p-6 space-y-6 ui-card rounded-2xl">
				<div>
					<h3 className="text-base font-semibold">Account Information</h3>
					<p className="text-sm text-muted-foreground">
						Configure identity and service settings.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-5 md:grid-cols-2">

					{isStaff && (
						<InputField
							label="WSN ID"
							placeholder="Auto-generated if empty"
							leftIcon={<Hash className="w-4 h-4" />}
							{...register("wsnId")}
						/>
					)}

					<SelectField label="Service Type" {...register("serviceType")}>
						<option value="pppoe">PPPoE</option>
						<option value="hotspot">Hotspot</option>
					</SelectField>

					{isPPPoE && (
						<SelectField label="Account Type" {...register("accountType")}>
							<option value="personal">Personal</option>
							<option value="business">Business</option>
						</SelectField>
					)}

					{isStaff && (
						<SelectField label="Profile Status" {...register("profileStatus")}>
							<option value="pending">Pending</option>
							<option value="active">Active</option>
							<option value="suspended">Suspended</option>
							<option value="canceled">Canceled</option>
						</SelectField>
					)}
				</div>
			</section>

			{/* ================= ROUTER ================= */}
			<section className="p-6 space-y-6 ui-card rounded-2xl">
				<div>
					<h3 className="text-base font-semibold">Router Configuration</h3>
					<p className="text-sm text-muted-foreground">
						Assign router and configure access settings.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-5 md:grid-cols-2">

					<SelectField
						label="Router"
						disabled={routersLoading}
						leftIcon={<RouterIcon className="w-4 h-4" />}
						{...register("routerId")}
					>
						<option value="">
							{routersLoading ? "Loading routers..." : "Select router"}
						</option>

						{routers.map((router: any) => (
							<option key={router.id} value={router.id}>
								{router.name} ({router.code})
							</option>
						))}
					</SelectField>

					<InputField
						label="Router Profile"
						placeholder="default"
						leftIcon={<Server className="w-4 h-4" />}
						{...register("routerProfile")}
					/>

					<InputField
						label="Router Password"
						type="password"
						placeholder="••••••••"
						leftIcon={<Lock className="w-4 h-4" />}
						{...register("routerPassword")}
					/>

					<InputField
						label="MAC Address"
						placeholder="00:1A:2B:3C:4D:5E"
						{...register("macAddress")}
					/>

					<InputField
						label="Uptime Limit"
						placeholder="e.g. 2h, 30m"
						{...register("limitUptime")}
					/>
				</div>
			</section>

			{/* ================= BUSINESS ================= */}
			{isBusiness && (
				<section className="p-6 space-y-6 ui-card rounded-2xl">
					<div>
						<h3 className="text-base font-semibold">
							Business Information
						</h3>
						<p className="text-sm text-muted-foreground">
							Verification details for business accounts.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-5 md:grid-cols-2">

						<InputField
							label="Business Name"
							placeholder="Company / Organization"
							leftIcon={<Building2 className="w-4 h-4" />}
							{...register("businessName")}
						/>

						<InputField
							label="Company Registration Number"
							placeholder="RC-XXXXXXX"
							leftIcon={<Building2 className="w-4 h-4" />}
							{...register("companyRegistrationNumber")}
						/>

						<InputField
							label="Tax ID"
							placeholder="Tax identification number"
							{...register("taxId")}
						/>
					</div>
				</section>
			)}

			{/* ================= ACTIONS ================= */}
			<div className="flex justify-end">
				<Button
					type="submit"
					size="lg"
					variant="accent"
					isLoading={isLoading}
					className="min-w-[220px]"
					leftIcon={<Wifi size={17} />}
				>
					Create Account
				</Button>
			</div>
		</form>
	);
}

/* ================= SELECT FIELD ================= */

interface SelectProps
	extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label: string;
	children: React.ReactNode;
	leftIcon?: React.ReactNode;
}

const SelectField = ({
	label,
	children,
	leftIcon,
	className,
	...props
}: SelectProps) => {
	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">{label}</label>

			<div className="relative">
				{leftIcon && (
					<div className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2">
						{leftIcon}
					</div>
				)}

				<select
					className={`w-full h-11 rounded-xl bg-muted/50 border border-border/60 text-sm
						focus:ring-4 focus:ring-accent/10 focus:border-accent
						transition
						${leftIcon ? "pl-10 pr-4" : "px-4"}
						${className || ""}`}
					{...props}
				>
					{children}
				</select>
			</div>
		</div>
	);
};