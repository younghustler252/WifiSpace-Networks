"use client";

import { WifiOff } from "lucide-react";
import { DetailList } from "@/components/shared/detail-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDateTime } from "@/lib/format";
import { useProfile } from "../hooks/use-users";
import { AvatarUploader } from "./avatar-uploader";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";
import { ThemePicker } from "./theme-picker";

export function ProfileView() {
	const { data: profile, isLoading, isError, refetch } = useProfile();

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-12 w-64 rounded-lg" />
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
					<Skeleton className="h-96 rounded-xl" />
					<Skeleton className="h-64 rounded-xl" />
				</div>
			</div>
		);
	}

	if (isError || !profile) {
		return (
			<StatusMessage icon={WifiOff} tone="warning" title="We couldn't load your profile" text="Check your connection and try again.">
				<Button size="lg" className="w-full" onClick={() => refetch()}>
					Try again
				</Button>
			</StatusMessage>
		);
	}

	const accountRows = [
		{ label: "Email", value: profile.email },
		{ label: "Verified", value: <StatusBadge status={profile.isVerified ? "approved" : "pending"} label={profile.isVerified ? "Verified" : "Not verified"} /> },
		{ label: "Status", value: <StatusBadge status={profile.status} /> },
		{ label: "Member since", value: formatDate(profile.createdAt) },
		...(profile.lastLoginAt ? [{ label: "Last sign-in", value: formatDateTime(profile.lastLoginAt) }] : []),
	];

	return (
		<div className="space-y-6">
			<PageHeader title="Profile" description="Your personal details, security and preferences." />

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
				<div className="space-y-4">
					<SectionCard title="Personal details">
						<div className="space-y-6">
							<AvatarUploader profile={profile} />
							<ProfileForm profile={profile} />
						</div>
					</SectionCard>

					<SectionCard title="Password" description="Use a strong password you don't use anywhere else.">
						<PasswordForm />
					</SectionCard>
				</div>

				<div className="space-y-4">
					<SectionCard title="Account">
						<DetailList rows={accountRows} />
					</SectionCard>
					<SectionCard title="Appearance">
						<ThemePicker />
					</SectionCard>
				</div>
			</div>
		</div>
	);
}