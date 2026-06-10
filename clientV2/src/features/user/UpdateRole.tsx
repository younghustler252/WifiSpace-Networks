"use client";

import { useForm } from "react-hook-form";
import { Shield } from "lucide-react";
import Button from "@/components/ui/Button";

type RoleFormData = {
	role: "customer" | "staff" | "superadmin";
};

interface Props {
	defaultRole: RoleFormData["role"];
	onSubmit: (data: RoleFormData) => void;
	loading?: boolean;
}

export default function UpdateRoleForm({
	defaultRole,
	onSubmit,
	loading,
}: Props) {
	const { register, handleSubmit } = useForm<RoleFormData>({
		defaultValues: { role: defaultRole },
	});

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex items-center gap-2"
		>
			<select
				{...register("role")}
				className="ui-input"
				disabled={loading}
			>
				<option value="customer">Customer</option>
				<option value="staff">Staff</option>
				<option value="superadmin">Superadmin</option>
			</select>

			<Button
				type="submit"
				variant="accent"
				isLoading={loading}
				disabled={loading}
			>
				<Shield className="w-4 h-4 mr-2" />
				Update Role
			</Button>
		</form>
	);
}