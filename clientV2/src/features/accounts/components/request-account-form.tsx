"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Home, Loader2, User, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { OptionCard } from "@/components/shared/option-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/features/users/hooks/use-users";
import { useRequestAccount } from "../hooks/use-accounts";
import { RequestAccountValues, requestAccountSchema } from "../schemas/accounts.schemas";

export function RequestAccountForm() {
	const router = useRouter();
	const requestAccount = useRequestAccount();
	const profile = useProfile();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		formState: { errors, isSubmitting },
	} = useForm<RequestAccountValues>({
		resolver: zodResolver(requestAccountSchema),
		defaultValues: { serviceType: "pppoe", accountType: "personal", businessName: "", address: "", landmark: "", city: "", state: "" },
	});

	useEffect(() => {
		const saved = profile.data?.address;
		if (saved && !getValues("address")) setValue("address", saved);
	}, [profile.data, getValues, setValue]);

	const serviceType = watch("serviceType");
	const accountType = watch("accountType");
	const isPppoe = serviceType === "pppoe";
	const isBusiness = isPppoe && accountType === "business";

	async function onSubmit(values: RequestAccountValues) {
		const res = await requestAccount.mutateAsync({
			serviceType: values.serviceType,
			accountType: isPppoe ? values.accountType : undefined,
			businessName: isBusiness ? values.businessName : undefined,
			requestedLocation: isPppoe
				? {
						address: values.address,
						landmark: values.landmark || undefined,
						city: values.city || undefined,
						state: values.state || undefined,
					}
				: undefined,
		});

		if (!res.success) {
			toast.error(res.message);
			return;
		}

		toast.success("Request submitted");
		router.push("/overview");
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
			<section className="space-y-3">
				<h2 className="text-sm font-medium">What do you need?</h2>
				<div role="radiogroup" aria-label="Service type" className="grid gap-3 sm:grid-cols-2">
					<OptionCard
						icon={Home}
						title="Home or office internet"
						description="A WifiSpace router installed at your location, on a recurring plan."
						selected={isPppoe}
						onSelect={() => setValue("serviceType", "pppoe")}
					/>
					<OptionCard
						icon={Wifi}
						title="Wifi hotspot"
						description="Pay-as-you-go access at WifiSpace hotspots."
						selected={!isPppoe}
						onSelect={() => setValue("serviceType", "hotspot")}
					/>
				</div>
			</section>

			{isPppoe && (
				<section className="space-y-3">
					<h2 className="text-sm font-medium">Who is it for?</h2>
					<div role="radiogroup" aria-label="Account type" className="grid gap-3 sm:grid-cols-2">
						<OptionCard
							icon={User}
							title="Personal"
							description="For you or your household."
							selected={accountType === "personal"}
							onSelect={() => setValue("accountType", "personal")}
						/>
						<OptionCard
							icon={Building2}
							title="Business"
							description="For a company, shop or office."
							selected={accountType === "business"}
							onSelect={() => setValue("accountType", "business")}
						/>
					</div>
				</section>
			)}

			{isBusiness && (
				<Field label="Business name" htmlFor="businessName" error={errors.businessName?.message}>
					<Input id="businessName" autoComplete="organization" aria-invalid={!!errors.businessName} {...register("businessName")} />
				</Field>
			)}

			{isPppoe && (
				<section className="space-y-4">
					<div>
						<h2 className="text-sm font-medium">Where should we install?</h2>
						<p className="text-[12px] text-muted-foreground">Our team uses this to plan your installation.</p>
					</div>
					<Field label="Address" htmlFor="address" error={errors.address?.message}>
						<Input id="address" autoComplete="street-address" aria-invalid={!!errors.address} {...register("address")} />
					</Field>
					<Field label="Nearest landmark (optional)" htmlFor="landmark">
						<Input id="landmark" autoComplete="off" {...register("landmark")} />
					</Field>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="City (optional)" htmlFor="city">
							<Input id="city" autoComplete="address-level2" {...register("city")} />
						</Field>
						<Field label="State (optional)" htmlFor="state">
							<Input id="state" autoComplete="address-level1" {...register("state")} />
						</Field>
					</div>
				</section>
			)}

			<Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
				{isSubmitting && <Loader2 className="animate-spin" />}
				Submit request
			</Button>
		</form>
	);
}