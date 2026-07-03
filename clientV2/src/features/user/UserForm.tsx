"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

import {
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	IdCard,
	ShieldCheck,
} from "lucide-react";

type UserFormData = {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	address?: string;
	status: "active" | "banned";
	gender?: "male" | "female" | "other";
	dateOfBirth?: string;
	nin?: string;
	theme?: "light" | "dark" | "system";
	password?: string;
	isVerified?: boolean;
};

interface Props {
	defaultValues?: Partial<UserFormData>;
	onSubmit: (data: UserFormData) => Promise<void>;
	loading?: boolean;
	isEdit?: boolean;

	// 🔥 IMPORTANT: backend error passthrough
	apiError?: any;
}

export default function UserForm({
	defaultValues,
	onSubmit,
	loading,
	isEdit = false,
	apiError,
}: Props) {
	const [error, setError] = React.useState<string | null>(null);

	const {
		register,
		handleSubmit,
		setError: setFieldError,
		formState: { errors },
	} = useForm<UserFormData>({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			address: "",
			status: "active",
			gender: "other",
			dateOfBirth: "",
			nin: "",
			theme: "light",
			isVerified: false,
			...defaultValues,
		},
	});

	/* =====================================================
		🔥 MAP BACKEND ERRORS → FORM FIELDS
	===================================================== */
	useEffect(() => {
	if (!apiError) return;

	const err =
		apiError?.response?.data ||
		apiError?.data ||
		apiError;

	// CASE 1: backend field errors (future-proof)
	if (Array.isArray(err?.errors)) {
		err.errors.forEach((e: any) => {
			if (e.field) {
				setFieldError(e.field as any, {
					type: "server",
					message: e.message,
				});
			}
		});
		return;
	}

	// CASE 2: single field error (future-proof)
	if (err?.field) {
		setFieldError(err.field as any, {
			type: "server",
			message: err.message,
		});
		return;
	}

	// CASE 3: YOUR CURRENT BACKEND FORMAT (THIS IS THE KEY FIX)
	if (err?.message) {
		setError(err.message);
		return;
	}

	setError("Something went wrong");
}, [apiError]);
	/* =====================================================
		SUBMIT HANDLER
	===================================================== */
	const submit = async (data: UserFormData) => {
		try {
			setError(null);

			// remove password in edit mode
			if (isEdit && !data.password) {
				delete data.password;
			}

			await onSubmit(data);
		} catch (err: any) {
			// fallback ONLY if parent doesn't pass apiError
			setError(
				err?.response?.data?.message ||
					err?.message ||
					"Failed to process user request"
			);
		}
	};

	return (
		<form onSubmit={handleSubmit(submit)} className="ui-stack">

			{/* 🔴 GLOBAL ERROR */}
			{error && (
				<div className="rounded-md bg-red-500/10 text-red-500 px-3 py-2 text-sm">
					{error}
				</div>
			)}

			{/* ================= NAME ================= */}
			<div className="grid grid-cols-2 gap-4">
				<InputField
					label="First Name"
					leftIcon={<User className="w-4 h-4" />}
					errorMessage={errors.firstName?.message}
					{...register("firstName", {
						required: "First name is required",
					})}
				/>

				<InputField
					label="Last Name"
					leftIcon={<User className="w-4 h-4" />}
					errorMessage={errors.lastName?.message}
					{...register("lastName", {
						required: "Last name is required",
					})}
				/>
			</div>

			{/* ================= EMAIL ================= */}
			<InputField
				label="Email"
				type="email"
				leftIcon={<Mail className="w-4 h-4" />}
				errorMessage={errors.email?.message}
				{...register("email", {
					required: "Email is required",
				})}
			/>

			{/* ================= PASSWORD ================= */}
			{!isEdit && (
				<InputField
					label="Password"
					type="password"
					leftIcon={<ShieldCheck className="w-4 h-4" />}
					errorMessage={errors.password?.message}
					{...register("password", {
						required: "Password is required",
					})}
				/>
			)}

			{/* ================= STATUS ================= */}
			<div>
				<label className="text-xs uppercase text-muted-foreground">
					Status
				</label>
				<select {...register("status")} className="ui-input mt-1">
					<option value="active">Active</option>
					<option value="banned">Banned</option>
				</select>
			</div>

			{/* ================= CONTACT ================= */}
			<div className="grid grid-cols-2 gap-4">
				<InputField
					label="Phone"
					leftIcon={<Phone className="w-4 h-4" />}
					errorMessage={errors.phone?.message}
					{...register("phone")}
				/>

				<InputField
					label="Address"
					leftIcon={<MapPin className="w-4 h-4" />}
					errorMessage={errors.address?.message}
					{...register("address")}
				/>
			</div>

			{/* ================= EXTRA INFO ================= */}
			<div className="grid grid-cols-2 gap-4">

				<div>
					<label className="text-xs uppercase text-muted-foreground">
						Gender
					</label>
					<select {...register("gender")} className="ui-input mt-1">
						<option value="male">Male</option>
						<option value="female">Female</option>
						<option value="other">Other</option>
					</select>
				</div>

				<InputField
					label="Date of Birth"
					type="date"
					leftIcon={<Calendar className="w-4 h-4" />}
					errorMessage={errors.dateOfBirth?.message}
					{...register("dateOfBirth")}
				/>

			</div>

			<div className="grid grid-cols-2 gap-4">

				<InputField
					label="NIN"
					leftIcon={<IdCard className="w-4 h-4" />}
					errorMessage={errors.nin?.message}
					{...register("nin")}
				/>

				<div>
					<label className="text-xs uppercase text-muted-foreground">
						Theme
					</label>
					<select {...register("theme")} className="ui-input mt-1">
						<option value="light">Light</option>
						<option value="dark">Dark</option>
						<option value="system">System</option>
					</select>
				</div>

				{isEdit && (
					<div className="col-span-2">
						<label className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40">
							<input
								type="checkbox"
								className="h-4 w-4 rounded border-border"
								{...register("isVerified")}
							/>

							<div>
								<p className="font-medium text-sm">Verified User</p>
								<p className="text-xs text-muted-foreground">
									Mark this user as identity verified.
								</p>
							</div>
						</label>
					</div>
				)}

			</div>

			{/* ================= ACTION ================= */}
			<div className="flex justify-end pt-4">
				<Button type="submit" variant="accent" isLoading={loading}>
					{isEdit ? "Update User" : "Create User"}
				</Button>
			</div>

		</form>
	);
}