"use client";

import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";

import Button from "../ui/Button";
import { InputField } from "../ui/InputField";

type BonusRule = {
	minCycles: number;
	bonusDays: number;
};

type PlanFormData = {
	name: string;

	serviceType: "pppoe" | "hotspot";

	accountType?: "personal" | "business" | null;


	price: number;

	speedRate: string;

	durationValue: number;

	durationUnit: "minutes" | "hours" | "days" | "months";

	devicesAllowed: number;

	mikrotikProfile: string;

	features: string;

	status: "active" | "inactive";

	bonusRules: BonusRule[];
};

interface Props {
	defaultValues?: Partial<PlanFormData>;

	onSubmit: (data: any) => Promise<void>;

	loading?: boolean;
}

export default function PlanForm({
	defaultValues,
	onSubmit,
	loading,
}: Props) {
	const [error, setError] = React.useState<string | null>(null);

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<PlanFormData>({
		defaultValues: {
			name: "",

			serviceType: "pppoe",

			accountType: "personal",

			price: 0,

			speedRate: "",

			durationValue: 30,

			durationUnit: "days",

			devicesAllowed: 1,

			mikrotikProfile: "",

			features: "",

			status: "active",

			bonusRules: [{ minCycles: 1, bonusDays: 1 }],

			...defaultValues,
		},
	});

	const serviceType = useWatch({
		control,
		name: "serviceType",
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "bonusRules",
	});

	const submit = async (data: PlanFormData) => {
		try {
			setError(null);

			const formatted = {
				...data,

				accountType:
					data.serviceType === "pppoe"
						? data.accountType
						: null,

				features: data.features
					.split(",")
					.map((f) => f.trim())
					.filter(Boolean),
			};

			await onSubmit(formatted);
		} catch (err: any) {
			setError(err?.message || "Something went wrong");
		}
	};

	return (
		<form
			onSubmit={handleSubmit(submit)}
			className="ui-stack"
		>
			{/* GLOBAL ERROR */}

			{error && (
				<div className="rounded-md bg-red-500/10 text-red-500 px-3 py-2 text-sm">
					{error}
				</div>
			)}

			{/* NAME */}

			<InputField
				label="Plan Name"
				required
				errorMessage={
					errors.name &&
					"Plan name is required"
				}
				{...register("name", {
					required: true,
				})}
			/>

			{/* SERVICE TYPE */}

			<div>
				<label className="text-xs text-muted-foreground uppercase">
					Service Type
				</label>

				<select
					{...register("serviceType")}
					className="ui-input mt-1"
				>
					<option value="pppoe">
						PPPoE
					</option>

					<option value="hotspot">
						Hotspot
					</option>
				</select>
			</div>

			{/* ACCOUNT TYPE */}

			{serviceType === "pppoe" && (
				<div>
					<label className="text-xs text-muted-foreground uppercase">
						Account Type
					</label>

					<select
						{...register("accountType", {
							required:
								serviceType ===
								"pppoe",
						})}
						className="ui-input mt-1"
					>
						<option value="personal">
							Personal
						</option>

						<option value="business">
							Business
						</option>
					</select>
				</div>
			)}

			{/* STATUS */}

			<div>
				<label className="text-xs text-muted-foreground uppercase">
					Status
				</label>

				<select
					{...register("status")}
					className="ui-input mt-1"
				>
					<option value="active">
						Active
					</option>

					<option value="inactive">
						Inactive
					</option>
				</select>
			</div>

			{/* PRICE + SPEED */}

			<div className="grid grid-cols-2 gap-4">
				<InputField
					label="Price"
					type="number"
					required
					errorMessage={
						errors.price?.type ===
						"required"
							? "Price is required"
							: errors.price
							? "Price cannot be negative"
							: undefined
					}
					{...register("price", {
						valueAsNumber: true,
						required: true,
						min: 0,
					})}
				/>

				<InputField
					label="Speed Rate"
					required
					errorMessage={
						errors.speedRate &&
						"Speed rate is required"
					}
					{...register("speedRate", {
						required: true,
					})}
				/>
			</div>

			{/* DURATION */}

			<div className="grid grid-cols-2 gap-4">
				<InputField
					label="Duration Value"
					type="number"
					errorMessage={
						errors.durationValue &&
						"Minimum is 1"
					}
					{...register("durationValue", {
						valueAsNumber: true,
						required: true,
						min: 1,
					})}
				/>

				<div>
					<label className="text-xs text-muted-foreground uppercase">
						Duration Unit
					</label>

					<select
						{...register("durationUnit")}
						className="ui-input mt-1"
					>
						<option value="minutes">
							Minutes
						</option>

						<option value="hours">
							Hours
						</option>

						<option value="days">
							Days
						</option>

						<option value="months">
							Months
						</option>
					</select>
				</div>
			</div>

			{/* DEVICES */}

			<InputField
				label="Devices Allowed"
				type="number"
				errorMessage={
					errors.devicesAllowed &&
					"Minimum is 1 device"
				}
				{...register("devicesAllowed", {
					valueAsNumber: true,
					min: 1,
				})}
			/>

			{/* MIKROTIK PROFILE */}

			<InputField
				label="Mikrotik Profile"
				required
				errorMessage={
					errors.mikrotikProfile &&
					"Mikrotik profile is required"
				}
				{...register("mikrotikProfile", {
					required: true,
				})}
			/>

			{/* FEATURES */}

			<div>
				<label className="text-xs text-muted-foreground uppercase">
					Features (comma separated)
				</label>

				<textarea
					{...register("features")}
					className="ui-textarea mt-1"
					placeholder="Unlimited data, Priority support, Static IP"
				/>
			</div>

			{/* BONUS RULES */}

			<div>
				<label className="text-xs text-muted-foreground uppercase">
					Bonus Rules
				</label>

				<div className="space-y-3 mt-2">
					{fields.map((field, index) => (
						<div
							key={field.id}
							className="grid grid-cols-3 gap-2"
						>
							<InputField
								label="Min Cycles"
								type="number"
								errorMessage={
									errors.bonusRules?.[
										index
									]?.minCycles &&
									"Required"
								}
								{...register(
									`bonusRules.${index}.minCycles`,
									{
										valueAsNumber: true,
										required: true,
										min: 1,
									}
								)}
							/>

							<InputField
								label="Bonus Days"
								type="number"
								errorMessage={
									errors.bonusRules?.[
										index
									]?.bonusDays &&
									"Required"
								}
								{...register(
									`bonusRules.${index}.bonusDays`,
									{
										valueAsNumber: true,
										required: true,
										min: 1,
									}
								)}
							/>

							<Button
								type="button"
								variant="ghost"
								onClick={() =>
									remove(index)
								}
							>
								Remove
							</Button>
						</div>
					))}

					<Button
						type="button"
						variant="accent"
						onClick={() =>
							append({
								minCycles: 1,
								bonusDays: 1,
							})
						}
					>
						Add Rule
					</Button>
				</div>
			</div>

			{/* ACTIONS */}

			<div className="flex justify-end gap-3 pt-4">
				<Button
					type="submit"
					variant="accent"
					isLoading={loading}
				>
					Save Plan
				</Button>
			</div>
		</form>
	);
}