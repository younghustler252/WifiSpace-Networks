"use client";

import React from "react";
import { useForm } from "react-hook-form";

import {
	Building2,
	Hash,
	Server,
	Wifi,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

interface FormValues {
	wsnId?: string;
	accountType: "personal" | "business";
	serviceType: "pppoe" | "hotspot";
	routerProfile: string;
	profileStatus?: "pending" | "active" | "suspended";
	companyRegistrationNumber?: string;
	taxId?: string;
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
	} = useForm<FormValues>({
		defaultValues: {
			wsnId: "",
			accountType: "personal",
			serviceType: "pppoe",
			routerProfile: "",
			profileStatus: "pending",
			companyRegistrationNumber: "",
			taxId: "",
		},
	});

	const accountType = watch("accountType");

	const isBusiness = accountType === "business";

	const isStaff =
		role === "superadmin" ||
		role === "staff";

	const submit = (data: FormValues) => {
		onSubmit({
			...data,
			userId,
		});
	};

	return (
		<form
			onSubmit={handleSubmit(submit)}
			className="space-y-8 max-w-5xl"
		>

			{/* ================= ACCOUNT INFORMATION ================= */}
			<section className="ui-card space-y-6">

				<div className="space-y-1">

					<h3 className="text-base font-semibold">
						Account Information
					</h3>

					<p className="text-sm text-muted-foreground">
						Configure customer account identity and service settings.
					</p>

				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">

					{/* WSN ID */}
					{isStaff && (
						<InputField
							label="WSN ID"
							placeholder="Auto-generated if empty"
							leftIcon={
								<Hash className="w-4 h-4 text-muted-foreground" />
							}
							{...register("wsnId")}
						/>
					)}

					{/* ACCOUNT TYPE */}
					<SelectField
						label="Account Type"
						{...register("accountType")}
					>
						<option value="personal">
							Personal
						</option>

						<option value="business">
							Business
						</option>
					</SelectField>

					{/* SERVICE TYPE */}
					<SelectField
						label="Service Type"
						{...register("serviceType")}
					>
						<option value="pppoe">
							PPPoE
						</option>

						<option value="hotspot">
							Hotspot
						</option>
					</SelectField>

					{/* PROFILE STATUS */}
					{isStaff && (
						<SelectField
							label="Profile Status"
							{...register("profileStatus")}
						>
							<option value="pending">
								Pending
							</option>

							<option value="active">
								Active
							</option>

							<option value="suspended">
								Suspended
							</option>
						</SelectField>
					)}

				</div>

			</section>

			{/* ================= ROUTER CONFIG ================= */}
			<section className="ui-card space-y-6">

				<div className="space-y-1">

					<h3 className="text-base font-semibold">
						Router Configuration
					</h3>

					<p className="text-sm text-muted-foreground">
						Configure MikroTik and network profile settings.
					</p>

				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">

					<InputField
						label="Router Profile"
						placeholder="default"
						leftIcon={
							<Server className="w-4 h-4 text-muted-foreground" />
						}
						{...register("routerProfile")}
					/>

					<SelectField label="Connection Type">

						<option>
							Dynamic IP
						</option>

						<option>
							Static IP
						</option>

						<option>
							Bridge Mode
						</option>

					</SelectField>

				</div>

			</section>

			{/* ================= BUSINESS INFO ================= */}
			{isBusiness && (
				<section className="ui-card space-y-6">

					<div className="space-y-1">

						<h3 className="text-base font-semibold">
							Business Information
						</h3>

						<p className="text-sm text-muted-foreground">
							Additional verification details for business accounts.
						</p>

					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">

						<InputField
							label="Company Registration Number"
							placeholder="RC-XXXXXXX"
							leftIcon={
								<Building2 className="w-4 h-4 text-muted-foreground" />
							}
							{...register("companyRegistrationNumber")}
						/>

						<InputField
							label="Tax ID"
							placeholder="Enter tax identification number"
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
}

const SelectField = ({
	label,
	children,
	className,
	...props
}: SelectProps) => {
	return (
		<div className="space-y-2">

			<label className="text-sm font-medium text-foreground">
				{label}
			</label>

			<select
				className={`
					w-full h-11 px-4 rounded-xl
					bg-muted/50
					border border-border/60
					text-sm
					transition-all duration-200
					outline-none
					focus:ring-4 focus:ring-accent/10
					focus:border-accent
					hover:border-border
					${className || ""}
				`}
				{...props}
			>
				{children}
			</select>

		</div>
	);
};