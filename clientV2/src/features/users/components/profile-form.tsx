"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateProfile } from "../hooks/use-users";
import { buildProfilePatch, toFormValues } from "../lib/profile";
import { GENDER_OPTIONS, ProfileValues, profileSchema } from "../schemas/users.schemas";
import type { UserProfile } from "../types/users.types";

export function ProfileForm({ profile }: { profile: UserProfile }) {
	const updateProfile = useUpdateProfile();
	const [changingNin, setChangingNin] = useState(!profile.nin);
	const today = new Date().toISOString().slice(0, 10);

	const {
		register,
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isDirty, isSubmitting, dirtyFields },
	} = useForm<ProfileValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: toFormValues(profile),
	});

	useEffect(() => {
		reset(toFormValues(profile));
	}, [profile.updatedAt]);

	function cancelNinChange() {
		setValue("nin", "", { shouldDirty: false, shouldValidate: true });
		setChangingNin(false);
	}

	async function onSubmit(values: ProfileValues) {
		const body = buildProfilePatch(values, dirtyFields);
		if (Object.keys(body).length === 0) {
			toast.info("Nothing to update");
			return;
		}

		const res = await updateProfile.mutateAsync(body);
		if (!res.success) {
			toast.error(res.message);
			return;
		}

		toast.success("Profile updated");
		setChangingNin(!res.data.nin);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
			<div className="grid gap-5 sm:grid-cols-2">
				<Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
					<Input id="firstName" autoComplete="given-name" aria-invalid={!!errors.firstName} {...register("firstName")} />
				</Field>
				<Field label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
					<Input id="lastName" autoComplete="family-name" aria-invalid={!!errors.lastName} {...register("lastName")} />
				</Field>
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
					<Input id="phone" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register("phone")} />
				</Field>
				<Field label="Date of birth" htmlFor="dateOfBirth" error={errors.dateOfBirth?.message}>
					<Input id="dateOfBirth" type="date" max={today} autoComplete="bday" aria-invalid={!!errors.dateOfBirth} {...register("dateOfBirth")} />
				</Field>
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<Field label="Gender" htmlFor="gender" error={errors.gender?.message}>
					<Controller
						control={control}
						name="gender"
						render={({ field }) => (
							<Select value={field.value || undefined} onValueChange={field.onChange}>
								<SelectTrigger id="gender" className="w-full">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									{GENDER_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</Field>

				<div className="space-y-2">
					<Label htmlFor="nin">National ID (NIN)</Label>
					{changingNin ? (
						<>
							<Input
								id="nin"
								inputMode="numeric"
								maxLength={11}
								autoComplete="off"
								placeholder="11-digit NIN"
								aria-invalid={!!errors.nin}
								{...register("nin")}
							/>
							{errors.nin ? (
								<p role="alert" className="text-sm text-destructive">
									{errors.nin.message}
								</p>
							) : (
								<p className="text-xs text-muted-foreground">For security, your NIN is always shown masked.</p>
							)}
							{profile.nin && (
								<button type="button" onClick={cancelNinChange} className="text-[12px] text-muted-foreground hover:text-foreground">
									Cancel
								</button>
							)}
						</>
					) : (
						<div className="card-elevated flex h-11 items-center justify-between bg-surface-2 pl-4 pr-1.5">
							<span className="text-mono text-[13px]">{profile.nin}</span>
							<Button type="button" variant="ghost" size="sm" onClick={() => setChangingNin(true)}>
								Change
							</Button>
						</div>
					)}
				</div>
			</div>

			<Field label="Address" htmlFor="address" error={errors.address?.message}>
				<Input id="address" autoComplete="street-address" aria-invalid={!!errors.address} {...register("address")} />
			</Field>

			<Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!isDirty || isSubmitting}>
				{isSubmitting && <Loader2 className="animate-spin" />}
				Save changes
			</Button>
		</form>
	);
}