"use client";

import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import Button from "../../components/ui/Button";
import { InputField } from "../../components/ui/InputField";
import { routerApi } from "@/lib/api/router";

type BonusRule = {
	minCycles: number;
	bonusDays: number;
};

type PlanFormData = {
	name: string;

	routerId: string;

	serviceType: "pppoe" | "hotspot";

	accountType?: "personal" | "business" | null;

	price: number;

	speedRate: string;

	durationValue: number;

	durationUnit: "minutes" | "hours" | "days" | "months";

	devicesAllowed: number;

	mikrotikProfile: string;

	gracePeriodDays: number;

	features: string;

	status: "active" | "inactive";

	bonusRule: BonusRule;
};

interface Router {
	id: string;
	name: string;
	code: string;
	host: string;
}

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
		watch,
		formState: { errors },
	} = useForm<PlanFormData>({
		defaultValues: {
			name: "",
			routerId: "",
			serviceType: "pppoe",
			accountType: "personal",
			price: 0,
			speedRate: "",
			durationValue: 30,
			durationUnit: "days",
			devicesAllowed: 1,
			mikrotikProfile: "",
			gracePeriodDays: 0,
			features: "",
			status: "active",
			bonusRule: {
				minCycles: 1,
				bonusDays: 1,
			},
			...defaultValues,
		},
	});

	// ----------------------------
	// WATCH VALUES
	// ----------------------------
	const routerId = watch("routerId");
	const serviceType = useWatch({
		control,
		name: "serviceType",
	});

	// ----------------------------
	// GET ROUTERS (ONLY NAME USED IN UI)
	// ----------------------------
	const { data: routers = [], isLoading: loadingRouters } =
	useQuery({
		queryKey: ["routers"],
		queryFn: routerApi.getAll,
	});

	// ----------------------------
	// GET MIKROTIK PROFILES
	// ----------------------------
	const { data: profiles = [], isLoading: loadingProfiles } =
		useQuery({
			queryKey: ["router-profiles", routerId, serviceType],
			queryFn: async () => {
				if (!routerId) return [];

				const res = await routerApi.getProfiles(
					routerId,
					serviceType
				);

				return res.data || [];
			},
			enabled: !!routerId,
		});

		console.log("Profiles:", profiles);
	// ----------------------------
	// SUBMIT
	// ----------------------------
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
		<form onSubmit={handleSubmit(submit)} className="ui-stack">
			{/* ERROR */}
			{error && (
				<div className="rounded-md bg-red-500/10 text-red-500 px-3 py-2 text-sm">
					{error}
				</div>
			)}

			{/* NAME */}
			<InputField
				label="Plan Name"
				required
				errorMessage={errors.name && "Plan name is required"}
				{...register("name", { required: true })}
			/>

			{/* ROUTER */}
			<div>
				<label className="text-xs uppercase text-muted-foreground">
					Router
				</label>

				<select
					{...register("routerId", { required: true })}
					className="ui-input mt-1"
				>
					<option value="">
						{loadingRouters ? "Loading routers..." : "Select router"}
					</option>

					{routers.map((router: Router) => (
						<option key={router.id} value={router.id}>
							{router.name}
						</option>
					))}
				</select>

				{errors.routerId && (
					<p className="text-xs text-red-500 mt-1">
						Router is required
					</p>
				)}
			</div>

			{/* SERVICE TYPE */}
			<div>
				<label className="text-xs uppercase text-muted-foreground">
					Service Type
				</label>

				<select {...register("serviceType")} className="ui-input mt-1">
					<option value="pppoe">PPPoE</option>
					<option value="hotspot">Hotspot</option>
				</select>
			</div>

			{/* ACCOUNT TYPE */}
			{serviceType === "pppoe" && (
				<div>
					<label className="text-xs uppercase text-muted-foreground">
						Account Type
					</label>

					<select {...register("accountType")} className="ui-input mt-1">
						<option value="personal">Personal</option>
						<option value="business">Business</option>
					</select>
				</div>
			)}

			{/* STATUS */}
			<div>
				<label className="text-xs uppercase text-muted-foreground">
					Status
				</label>

				<select {...register("status")} className="ui-input mt-1">
					<option value="active">Active</option>
					<option value="inactive">Inactive</option>
				</select>
			</div>

			{/* PRICE + SPEED */}
			<div className="grid grid-cols-2 gap-4">
				<InputField
					label="Price"
					type="number"
					{...register("price", {
						valueAsNumber: true,
						required: true,
						min: 0,
					})}
				/>

				<InputField
					label="Speed Rate"
					required
					{...register("speedRate", { required: true })}
				/>
			</div>

			{/* DURATION */}
			<div className="grid grid-cols-2 gap-4">
				<InputField
					label="Duration Value"
					type="number"
					{...register("durationValue", {
						valueAsNumber: true,
						required: true,
						min: 1,
					})}
				/>

				<select {...register("durationUnit")} className="ui-input mt-6">
					<option value="minutes">Minutes</option>
					<option value="hours">Hours</option>
					<option value="days">Days</option>
					<option value="months">Months</option>
				</select>
			</div>

			{/* GRACE PERIOD */}
			<InputField
				label="Grace Period (Days)"
				type="number"
				{...register("gracePeriodDays", {
					valueAsNumber: true,
					min: 0,
				})}
			/>

			{/* DEVICES */}
			<InputField
				label="Devices Allowed"
				type="number"
				{...register("devicesAllowed", {
					valueAsNumber: true,
					min: 1,
				})}
			/>

			{/* MIKROTIK PROFILE */}
			<div>
				<label className="text-xs uppercase text-muted-foreground">
					MikroTik Profile
				</label>

				<select
					{...register("mikrotikProfile", { required: true })}
					className="ui-input mt-1"
				>
					<option value="">
						{loadingProfiles ? "Loading..." : "Select profile"}
					</option>

					{profiles?.map((p: any) => (
						<option key={p.name} value={p.name}>
							{p.name}
						</option>
					))}
				</select>
			</div>

			{/* FEATURES */}
			<div>
				<label className="text-xs uppercase text-muted-foreground">
					Features (comma separated)
				</label>

				<textarea
					{...register("features")}
					className="ui-textarea mt-1"
				/>
			</div>

			{/* BONUS RULE (SINGLE OBJECT) */}
			<div>
				<label className="text-xs uppercase text-muted-foreground">
					Bonus Rule
				</label>

				<div className="grid grid-cols-2 gap-3 mt-2">
					<InputField
						label="Min Cycles"
						type="number"
						{...register("bonusRule.minCycles", {
							valueAsNumber: true,
							min: 1,
						})}
					/>

					<InputField
						label="Bonus Days"
						type="number"
						{...register("bonusRule.bonusDays", {
							valueAsNumber: true,
							min: 1,
						})}
					/>
				</div>
			</div>

			{/* SUBMIT */}
			<div className="flex justify-end pt-4">
				<Button type="submit" variant="accent" isLoading={loading}>
					Save Plan
				</Button>
			</div>
		</form>
	);
}