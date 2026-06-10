"use client";

import { useState } from "react";
import {
	Shield,
	Pencil,
	Eye,
	EyeOff,
	Save,
	X,
} from "lucide-react";

import { accountApi } from "@/lib/api/account";

type Props = {
	account: any;
	role?: "customer" | "superAdmin" | "staff";
};

const SecuritySettings = ({
	account,
	role = "customer",
}: Props) => {
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const [routerPassword, setRouterPassword] = useState(
		account?.routerPassword || ""
	);

	const canEdit =
		role === "superAdmin" || account?.isOwner;

	const handleCancel = () => {
		setRouterPassword(account?.routerPassword || "");
		setEditing(false);
	};

	const handleSave = async () => {
		try {
			setSaving(true);

			await accountApi.changeAccountPassword(
				account.id,
				{routerPassword }
			);

			setEditing(false);
		} catch (error) {
			console.error(
				"Failed to update router password:",
				error
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="w-full min-w-0 rounded-xl border border-border bg-card p-5">

			{/* Header */}
			<div className="flex items-center justify-between mb-4">

				<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
					<Shield size={16} />
					Security Settings
				</div>

				{canEdit && !editing && (
					<button
						onClick={() => setEditing(true)}
						className="flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-muted transition"
					>
						<Pencil size={12} />
						Change Password
					</button>
				)}

			</div>

			<div className="space-y-4">

				{/* Router Password */}
				<div>
					<label className="block text-xs font-medium text-muted-foreground mb-2">
						Router Password
					</label>

					<div className="relative">

						<input
							type={
								showPassword
									? "text"
									: "password"
							}
							value={routerPassword}
							onChange={(e) =>
								setRouterPassword(
									e.target.value
								)
							}
							disabled={!editing}
							className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm disabled:opacity-70"
						/>

						<button
							type="button"
							onClick={() =>
								setShowPassword(
									(prev) => !prev
								)
							}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						>
							{showPassword ? (
								<EyeOff size={16} />
							) : (
								<Eye size={16} />
							)}
						</button>

					</div>
				</div>

				{/* Actions */}
				{editing && (
					<div className="flex items-center gap-2">

						<button
							onClick={handleSave}
							disabled={saving}
							className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
						>
							<Save size={14} />
							{saving
								? "Saving..."
								: "Save Changes"}
						</button>

						<button
							onClick={handleCancel}
							disabled={saving}
							className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
						>
							<X size={14} />
							Cancel
						</button>

					</div>
				)}

				{/* Future fields can go here */}
				{!editing && (
					<p className="text-xs text-muted-foreground">
						Manage router access credentials and
						other security-related settings.
					</p>
				)}

			</div>

		</div>
	);
};

export default SecuritySettings;