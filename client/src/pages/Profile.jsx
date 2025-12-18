import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useUser } from "../hooks/useUser";
import { Spinner } from "../components/ui/Loader";
import Avatar from "../components/ui/Avatar";
import Input from "../components/ui/Input";

const Profile = () => {
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

	useEffect(() => {
		if (dashboard.data?.profile) {
			const { fullName, email, themePreference } = dashboard.data.profile;
			setForm({ fullName, email });
			if (themePreference && themePreference !== theme) changeTheme(themePreference);
		}
	}, [dashboard.data]);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
	const handlePasswordChange = (e) =>
		setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

	const saveDetails = () => {
		updateDetails.mutate(form, { onSuccess: () => setEditMode(false) });
	};

	const savePassword = () => {
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			alert("Passwords do not match!");
			return;
		}
		passwordChange.mutate(
			{ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword },
			{ onSuccess: () => setPasswordMode(false) }
		);
	};

	if (dashboard.isLoading) return <Spinner message="Loading profile..." />;
	if (dashboard.isError)
		return <p className="text-red-500 text-center">Failed to load profile data.</p>;

	const { profile } = dashboard.data;
	const themeOptions = ["light", "dark", "system"];

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-8">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Avatar
					firstName={profile.firstName}
					lastName={profile.lastName}
					src={profile.profilePicture}
					size={64}
				/>
				<div>
					<h1 className="text-2xl font-bold text-primary">{profile.fullName}</h1>
					<p className="text-secondary">{profile.email}</p>
					{profile.wsnId && (
						<p className="text-sm text-muted">Customer ID: {profile.wsnId}</p>
					)}
				</div>
			</div>

			{/* Profile Details */}
			<div className="bg-surface border border-surface rounded-xl p-6 shadow-sm space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-lg font-semibold text-primary">Profile Details</h2>
					<button
						className="text-sm text-primary underline"
						onClick={() => setEditMode(!editMode)}
					>
						{editMode ? "Cancel" : "Edit"}
					</button>
				</div>

				{editMode ? (
					<div className="space-y-3">
						<Input
							label="Full Name"
							name="fullName"
							value={form.fullName}
							onChange={handleChange}
						/>
						<Input
							label="Email"
							name="email"
							value={form.email}
							onChange={handleChange}
						/>
						<button
							onClick={saveDetails}
							className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/90 transition"
						>
							Save Changes
						</button>
					</div>
				) : (
					<div className="space-y-1 text-sm text-primary">
						<p>
							<strong>Full Name:</strong> {profile.fullName}
						</p>
						<p>
							<strong>Email:</strong> {profile.email}
						</p>
						{profile.wsnId && (
							<p>
								<strong>Customer ID:</strong> {profile.wsnId}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Theme Preferences */}
			<div className="bg-surface border border-surface rounded-xl p-6 shadow-sm flex justify-between items-center">
				<div>
					<h2 className="text-lg font-semibold text-primary">Theme Preferences</h2>
					<p className="text-sm text-secondary">Current theme: {theme}</p>
				</div>
				<select
					value={theme}
					onChange={(e) => changeTheme(e.target.value)}
					className="px-4 py-2 border border-surface rounded"
				>
					{themeOptions.map((option) => (
						<option key={option} value={option}>
							{option.charAt(0).toUpperCase() + option.slice(1)}
						</option>
					))}
				</select>
			</div>

			{/* Change Password */}
			<div className="bg-surface border border-surface rounded-xl p-6 shadow-sm space-y-3">
				<div className="flex justify-between items-center">
					<h2 className="text-lg font-semibold text-primary">Change Password</h2>
					<button
						className="text-sm text-primary underline"
						onClick={() => setPasswordMode(!passwordMode)}
					>
						{passwordMode ? "Cancel" : "Edit"}
					</button>
				</div>

				{passwordMode && (
					<div className="space-y-3">
						<Input
							label="Old Password"
							name="oldPassword"
							type="password"
							value={passwordForm.oldPassword}
							onChange={handlePasswordChange}
						/>
						<Input
							label="New Password"
							name="newPassword"
							type="password"
							value={passwordForm.newPassword}
							onChange={handlePasswordChange}
						/>
						<Input
							label="Confirm New Password"
							name="confirmPassword"
							type="password"
							value={passwordForm.confirmPassword}
							onChange={handlePasswordChange}
						/>
						<button
							onClick={savePassword}
							className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/90 transition"
						>
							Save Password
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Profile;
