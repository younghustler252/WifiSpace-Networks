import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useUser } from "../hooks/useUser";
import { Spinner } from "../components/ui/Loader";
import Avatar from "../components/ui/Avatar";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const Profile = () => {
	const { logout } = useAuth();
	const { dashboard, updateDetails, passwordChange } = useUser();
	const { theme, changeTheme } = useContext(ThemeContext);

	const [editMode, setEditMode] = useState(false);
	const [passwordMode, setPasswordMode] = useState(false);
	const [form, setForm] = useState({});
	const [passwordForm, setPasswordForm] = useState({
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [passwordError, setPasswordError] = useState(null);

	useEffect(() => {
		if (dashboard.data?.profile) {
			const { fullName, email, themePreference } = dashboard.data.profile;
			setForm({ fullName, email });

			if (themePreference && themePreference !== theme) {
				changeTheme(themePreference);
			}
		}
	}, [dashboard.data]);

	if (dashboard.isLoading) return <Spinner message="Loading profile..." />;
	if (dashboard.isError)
		return (
			<p className="text-center text-danger">
				Failed to load profile data.
			</p>
		);

	const { profile, subscription } = dashboard.data;
	const themeOptions = ["light", "dark", "system"];

	const saveDetails = () => {
		updateDetails.mutate(form, {
			onSuccess: () => {
				setEditMode(false);
				toast.success("Profile updated successfully");
			},
			onError: (err) => {
				toast.error(err?.message || "Failed to update profile");
			},
		});
	};

	const savePassword = () => {
		setPasswordError(null);
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setPasswordError("Passwords do not match");
			return;
		}

		passwordChange.mutate(
			{
				oldPassword: passwordForm.oldPassword,
				newPassword: passwordForm.newPassword,
			},
			{
				onSuccess: () => {
					setPasswordMode(false);
					setPasswordForm({
						oldPassword: "",
						newPassword: "",
						confirmPassword: "",
					});
					toast.success("Password updated successfully");
				},
				onError: (err) => {
					toast.error(err?.message || "Failed to change password");
				},
			}
		);
	};

	return (
		<div className="max-w-5xl mx-auto p-6 space-y-8">
			{/* Header */}
			<div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Avatar
						firstName={profile.firstName}
						lastName={profile.lastName}
						src={profile.profilePicture}
						size={72}
					/>
					<div>
						<h1 className="text-2xl font-bold text-primary">{profile.fullName}</h1>
						<p className="text-secondary">{profile.email}</p>
						{profile.wsnId && (
							<p className="text-sm text-muted">Customer ID: {profile.wsnId}</p>
						)}
						{subscription && (
							<p className="text-sm text-green-600 mt-1">
								Current Plan: {subscription.planName}
							</p>
						)}
					</div>
				</div>
				<Button variant="danger" onClick={logout}>
					Logout
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Profile Details */}
				<div className="card space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="section-title">Profile Details</h2>
						<button
							className="text-sm text-accent hover:underline"
							onClick={() => setEditMode(!editMode)}
						>
							{editMode ? "Cancel" : "Edit"}
						</button>
					</div>

					{editMode ? (
						<div className="space-y-3">
							<Input
								label="Full Name"
								value={form.fullName}
								onChange={(e) =>
									setForm({ ...form, fullName: e.target.value })
								}
							/>
							<Input
								label="Email"
								value={form.email}
								onChange={(e) =>
									setForm({ ...form, email: e.target.value })
								}
							/>
							<Button onClick={saveDetails} loading={updateDetails.isLoading}>
								Save Changes
							</Button>
						</div>
					) : (
						<div className="space-y-1 text-sm text-primary">
							<p>
								<strong>Full Name:</strong> {profile.fullName}
							</p>
							<p>
								<strong>Email:</strong> {profile.email}
							</p>
						</div>
					)}
				</div>

				{/* Theme & Password */}
				<div className="space-y-6">
					{/* Theme Preferences */}
					<div className="card space-y-3">
						<h2 className="section-title">Theme Preferences</h2>
						<div className="flex gap-2">
							{themeOptions.map((option) => (
								<button
									key={option}
									onClick={() => changeTheme(option)}
									className={`px-4 py-2 rounded-md text-sm capitalize border transition
                    ${theme === option
											? "bg-primary text-white border-primary"
											: "bg-card text-secondary border-surface hover:bg-surface-hover"
										}`}
								>
									{option}
								</button>
							))}
						</div>
					</div>

					{/* Change Password */}
					<div className="card space-y-3">
						<div className="flex justify-between items-center">
							<h2 className="section-title">Change Password</h2>
							<button
								className="text-sm text-accent hover:underline"
								onClick={() => setPasswordMode(!passwordMode)}
							>
								{passwordMode ? "Cancel" : "Edit"}
							</button>
						</div>

						{passwordMode && (
							<div className="space-y-3">
								<Input
									label="Old Password"
									type="password"
									value={passwordForm.oldPassword}
									onChange={(e) =>
										setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
									}
								/>
								<Input
									label="New Password"
									type="password"
									value={passwordForm.newPassword}
									onChange={(e) =>
										setPasswordForm({ ...passwordForm, newPassword: e.target.value })
									}
								/>
								<Input
									label="Confirm New Password"
									type="password"
									value={passwordForm.confirmPassword}
									onChange={(e) =>
										setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
									}
								/>
								{passwordError && (
									<p className="text-sm text-danger">{passwordError}</p>
								)}
								<Button onClick={savePassword} loading={passwordChange.isLoading}>
									Save Password
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
