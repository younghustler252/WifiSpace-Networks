"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { userApi } from "@/lib/api/user";
import {
	User,
	Phone,
	MapPin,
	Fingerprint,
	Camera,
	Shield,
	Key,
	Moon,
	Sun,
} from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { CenterLoader } from "@/components/ui/Loader";
import { InputField } from "@/components/ui/InputField";

const ProfilePage = () => {
	const { user } = useAuth();

	const [isEditing, setIsEditing] = useState(false);
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [successMsg, setSuccessMsg] = useState("");
	const [errorMsg, setErrorMsg] = useState("");

	const { data: profileDatas, isLoading, error } = useQuery({
		queryKey: ["profile"],
		queryFn: userApi.getProfile,
		enabled: !!user,
	});

	const profileData = profileDatas?.data;

	// ================= FORMS =================
	const profileForm = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			phone: "",
			nin: "",
			address: "",
			gender: "",
			dateOfBirth: "",
		},
	});

	const passwordForm = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
		},
	});

	// ================= MUTATIONS =================
	const updateProfileMutation = useMutation({
		mutationFn: userApi.updateProfile,
		onSuccess: () => {
			setIsEditing(false);
			setSuccessMsg("Profile updated successfully");
			setTimeout(() => setSuccessMsg(""), 3000);
		},
		onError: (err: any) => {
			setErrorMsg(err?.message || "Failed to update profile");
		},
	});

	const changePasswordMutation = useMutation({
		mutationFn: userApi.changePassword,
		onSuccess: () => {
			setSuccessMsg("Password changed successfully");
			passwordForm.reset();
			setShowPasswordForm(false);
			setTimeout(() => setSuccessMsg(""), 3000);
		},
		onError: (err: any) => {
			setErrorMsg(err?.message || "Failed to change password");
		},
	});

	if (isLoading) return <CenterLoader label="Loading Profile..." />;
	if (error) return <div>Error loading profile</div>;

	// ================= HANDLERS =================
	const handleEdit = () => {
		profileForm.reset({
			firstName: profileData?.firstName || "",
			lastName: profileData?.lastName || "",
			phone: profileData?.phone || "",
			nin: profileData?.nin || "",
			address: profileData?.address || "",
			gender: profileData?.gender || "",
			dateOfBirth: profileData?.dateOfBirth || "",
		});
		setIsEditing(true);
	};

	const onSubmitProfile = (data: any) => {
		setErrorMsg("");
		updateProfileMutation.mutate(data);
	};

	const onSubmitPassword = (data: any) => {
		setErrorMsg("");

		if (!data.currentPassword || !data.newPassword) {
			setErrorMsg("All password fields are required");
			return;
		}

		changePasswordMutation.mutate({
			currentPassword: data.currentPassword,
			newPassword: data.newPassword,
		});
	};

	return (
		<>
			<PageHeader title="Profile Settings" />

			<main className="p-4 md:p-8">
				<div className="max-w-5xl mx-auto ui-stack-lg pb-12">

					{successMsg && (
						<div className="ui-badge ui-badge-success text-center">
							{successMsg}
						</div>
					)}

					{errorMsg && (
						<div className="ui-badge ui-badge-danger text-center">
							{errorMsg}
						</div>
					)}

					{/* HERO */}
					<div className="ui-card flex flex-col md:flex-row items-center gap-8">

						<div className="relative group">
							<Avatar
								src={profileData?.avatar?.url}
								size="lg"
								className="rounded-2xl"
							/>
							<button className="absolute inset-0 rounded-2xl flex items-center justify-center bg-primary/0 group-hover:bg-primary/40 transition">
								<Camera className="text-primary-foreground" size={22} />
							</button>
						</div>

						<div className="text-center md:text-left flex-1">
							<h2 className="text-2xl font-semibold">
								{profileData?.firstName} {profileData?.lastName}
							</h2>
						</div>

						<Button variant="accent" onClick={handleEdit}>
							Edit Profile
						</Button>
					</div>

					{/* GRID */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

						{/* LEFT */}
						<Card>
							<div className="flex gap-2 mb-4 items-center">
								<User size={18} className="text-accent" />
								Personal Details
							</div>

							<CardContent>

								{isEditing ? (
									<form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="ui-stack">

										<div className="grid grid-cols-2 gap-4">
											<InputField label="First Name" {...profileForm.register("firstName")} />
											<InputField label="Last Name" {...profileForm.register("lastName")} />
										</div>

										<InputField label="Phone" {...profileForm.register("phone")} />
										<InputField label="NIN" {...profileForm.register("nin")} />
										<InputField label="Address" {...profileForm.register("address")} />

										<div>
											<label className="text-xs text-muted-foreground uppercase">Gender</label>
											<select {...profileForm.register("gender")} className="ui-input mt-1">
												<option value="">Select Gender</option>
												<option value="male">Male</option>
												<option value="female">Female</option>
												<option value="other">Other</option>
											</select>
										</div>

										<InputField
											label="Date of Birth"
											type="date"
											{...profileForm.register("dateOfBirth")}
										/>

										<div className="flex justify-end gap-4 pt-4">
											<Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
												Cancel
											</Button>

											<Button
												type="submit"
												variant="accent"
												isLoading={updateProfileMutation.isPending}
											>
												Save Changes
											</Button>
										</div>
									</form>
								) : (
									<div className="ui-stack">

										<div className="grid grid-cols-2 gap-4">
											<Info label="First Name" value={profileData?.firstName} />
											<Info label="Last Name" value={profileData?.lastName} />
										</div>

										<Info label="Email" value={profileData?.email} />
										<Info label="Phone" value={profileData?.phone} icon={<Phone size={14} />} />
										<Info label="NIN" value={profileData?.nin || "Not Provided"} icon={<Fingerprint size={14} />} />
										<Info label="Address" value={profileData?.address || "Not Provided"} icon={<MapPin size={14} />} />
										<Info label="Gender" value={profileData?.gender || "Not Provided"} />
										<Info label="Date of Birth" value={profileData?.dateOfBirth || "Not Provided"} />

									</div>
								)}

							</CardContent>
						</Card>

						{/* RIGHT */}
						<div className="ui-stack-lg">

							{/* SECURITY */}
							<Card>
								<CardHeader>
									<div className="flex gap-2 items-center">
										<Shield size={18} className="text-success" />
										Security
									</div>
								</CardHeader>

								<CardContent>

									<Button
										variant="outline"
										fullWidth
										onClick={() => setShowPasswordForm(!showPasswordForm)}
									>
										<div className="flex items-center gap-3">
											<Key size={16} />
											Change Password
										</div>
									</Button>

									{showPasswordForm && (
										<form
											onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
											className="ui-stack mt-4"
										>
											<InputField
												label="Current Password"
												type="password"
												{...passwordForm.register("currentPassword")}
											/>

											<InputField
												label="New Password"
												type="password"
												{...passwordForm.register("newPassword")}
											/>

											<Button
												type="submit"
												variant="accent"
												isLoading={changePasswordMutation.isPending}
											>
												Update Password
											</Button>
										</form>
									)}

								</CardContent>
							</Card>

							{/* APPEARANCE */}
							<Card>
								<CardHeader>
									<div className="flex gap-2 items-center">
										<Sun size={18} className="text-warning" />
										Appearance
									</div>
								</CardHeader>

								<CardContent>
									<div className="flex bg-muted p-1 rounded-xl border border-border">

										<button
											onClick={() => setTheme("light")}
											className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg ${
												theme === "light" ? "ui-button-accent" : ""
											}`}
										>
											<Sun size={16} />
											Light
										</button>

										<button
											onClick={() => setTheme("dark")}
											className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg ${
												theme === "dark" ? "ui-button-accent" : ""
											}`}
										>
											<Moon size={16} />
											Dark
										</button>

									</div>
								</CardContent>
							</Card>

						</div>
					</div>
				</div>
			</main>
		</>
	);
};

export default ProfilePage;

const Info = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
	<div>
		<label className="text-xs text-muted-foreground uppercase">
			{label}
		</label>

		<div className="mt-1 flex items-center gap-2">
			{icon && <span className="text-muted-foreground">{icon}</span>}
			<p className="font-medium">{value}</p>
		</div>
	</div>
);