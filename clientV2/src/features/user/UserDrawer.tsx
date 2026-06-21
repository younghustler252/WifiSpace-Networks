"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UpdateRoleForm from "./UpdateRole";

type UserRole = "customer" | "staff" | "superadmin";

import {
	X,
	Mail,
	Phone,
	MapPin,
	Shield,
	Ban,
	Trash2,
	Plus,
	Activity,
	Server,
} from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";

import Modal, {
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/Modal";

import AccountForm from "../account/components/AccountForm";
import { accountApi } from "@/lib/api/account";
import UserForm from "./UserForm";

interface Props {
	open: boolean;
	onClose: () => void;
	user: any;
	currentUser: any;

	onUpdateProfile: (data: any) => Promise<void>;
	onUpdateRole: (role: UserRole) => Promise<void>;

	onDelete?: () => void;
	onBan?: () => void;

	loading?: {
		updateProfile?: boolean;
		updateRole?: boolean;
		ban?: boolean;
		delete?: boolean;
	};
}

export default function UserDrawer({
	open,
	onClose,
	user,
	currentUser,
	onUpdateProfile,
	onUpdateRole,
	onDelete,
	onBan,
	loading,
}: Props) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [tab, setTab] = useState<"overview" | "edit">("overview");
	const [openCreateAccount, setOpenCreateAccount] = useState(false);

	// ================= PERMISSIONS =================
	const isSuperAdmin = currentUser?.role === "superadmin";
	const canBan = isSuperAdmin;
	const canDelete = isSuperAdmin;
	const canUpdateRole = isSuperAdmin;

	// ================= STATUS UI =================
	const [status, setStatus] = useState<{
		type: "success" | "error" | "info" | null;
		message: string;
	}>({
		type: null,
		message: "",
	});

	const showStatus = (type: "success" | "error" | "info", message: string) => {
		setStatus({ type, message });

		setTimeout(() => {
			setStatus({ type: null, message: "" });
		}, 3000);
	};

	// ================= ACCOUNTS =================
	const { data, isFetching } = useQuery({
		queryKey: ["user-accounts", user?.id],
		queryFn: () => accountApi.getAllAccounts({ userId: user.id }),
		enabled: !!user?.id && open,
		placeholderData: (prev) => prev,
	});

	const userAccounts = data?.data ?? [];

	// ================= CREATE ACCOUNT =================
	const { mutate: createAccount, isPending } = useMutation({
		mutationFn: accountApi.createAccount,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["user-accounts", user?.id],
			});
			setOpenCreateAccount(false);
			showStatus("success", "Account created successfully");
		},
		onError: () => {
			showStatus("error", "Failed to create account");
		},
	});

	if (!open || !user) return null;

	// ================= HANDLERS =================
	const handleRoleUpdate = async (data: { role: UserRole }) => {
		try {
			await onUpdateRole(data.role);
			showStatus("success", "Role updated successfully");
		} catch (err: any) {
			showStatus(
				"error",
				err?.response?.data?.message || "Failed to update role"
			);
		}
	};

	const handleProfileUpdate = async (data: any) => {
		try {
			await onUpdateProfile(data);
			showStatus("success", "Profile updated successfully");
		} catch (err: any) {
			showStatus(
				"error",
				err?.response?.data?.message || "Update failed"
			);
		}
	};

	const isBusy =
		loading?.updateProfile ||
		loading?.updateRole ||
		loading?.ban ||
		loading?.delete;

	// ================= UI =================
	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />

			<div className="relative w-full max-w-xl h-full bg-background border-l border-border shadow-xl flex flex-col">

				{/* ================= HEADER ================= */}
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<h2 className="font-semibold text-lg">
						User Control Panel
					</h2>

					<button
						onClick={onClose}
						className="p-2 hover:bg-muted rounded-md"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* ================= STATUS BAR ================= */}
				{status.type && (
					<div
						className={`mx-6 mt-3 px-4 py-2 rounded-md text-sm border ${
							status.type === "success"
								? "bg-green-50 text-green-700 border-green-200"
								: status.type === "error"
								? "bg-red-50 text-red-700 border-red-200"
								: "bg-blue-50 text-blue-700 border-blue-200"
						}`}
					>
						{status.message}
					</div>
				)}

				{/* ================= BODY ================= */}
				<div className="flex-1 overflow-y-auto ui-scrollbar p-6">

					{/* HERO */}
					<Card className="mb-6">
						<CardContent className="flex items-center gap-4">
							<Avatar
								name={`${user?.firstName || ""} ${user?.lastName || ""}`}
								src={user?.avatar?.url}
								size="lg"
							/>

							<div className="flex-1">
								<h3 className="text-lg font-semibold">
									{user?.firstName} {user?.lastName}
								</h3>

								<p className="text-sm text-muted-foreground flex items-center gap-2">
									<Mail className="w-4 h-4" />
									{user?.email}
								</p>

								<p className="text-xs text-muted-foreground mt-1">
									Role: <span className="font-medium">{user?.role}</span>
								</p>
							</div>

							<span className="ui-badge ui-badge-success">
								Active
							</span>
						</CardContent>
					</Card>

					{/* TABS */}
					<div className="flex gap-2 mb-6">
						<Button
							variant={tab === "overview" ? "accent" : "outline"}
							size="sm"
							onClick={() => setTab("overview")}
						>
							Overview
						</Button>

						<Button
							variant={tab === "edit" ? "accent" : "outline"}
							size="sm"
							onClick={() => setTab("edit")}
						>
							Edit
						</Button>
					</div>

					{/* OVERVIEW */}
					{tab === "overview" && (
						<div className="space-y-6">

							{/* CONTACT */}
							<Card>
								<CardHeader>Contact</CardHeader>
								<CardContent className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<Mail className="w-4 h-4" />
										{user?.email}
									</div>

									<div className="flex items-center gap-2">
										<Phone className="w-4 h-4" />
										{user?.phone || "-"}
									</div>

									<div className="flex items-center gap-2">
										<MapPin className="w-4 h-4" />
										{user?.address || "-"}
									</div>
								</CardContent>
							</Card>

							{/* ACCOUNTS */}
							<Card>
								<CardHeader className="flex items-center gap-2">
									<Server className="w-4 h-4" />
									Accounts Intelligence
								</CardHeader>

								<CardContent className="space-y-3">
									{isFetching && (
										<p className="text-xs text-muted-foreground">
											Synchronizing...
										</p>
									)}

									{userAccounts.map((acc: any) => (
										<Card
											key={acc.id}
											padding="sm"
											className="cursor-pointer hover:bg-muted/40"
											onClick={() =>
												router.push(
													`/admin/accounts/${acc.id}`
												)
											}
										>
											<p className="font-semibold text-sm">
												{acc.wsnId}
											</p>
										</Card>
									))}

									<Button
										fullWidth
										variant="accent"
										leftIcon={<Plus className="w-4 h-4" />}
										onClick={() =>
											setOpenCreateAccount(true)
										}
									>
										Create Account
									</Button>
								</CardContent>
							</Card>

							{/* ROLE */}
							{canUpdateRole && (
								<Card>
									<CardHeader>
										<div className="flex items-center gap-2">
											<Shield className="w-4 h-4" />
											Role Management
										</div>
									</CardHeader>

									<CardContent>
										<UpdateRoleForm
											defaultRole={user.role}
											loading={loading?.updateRole}
											onSubmit={handleRoleUpdate}
										/>
									</CardContent>
								</Card>
							)}

							{/* ADMIN CONTROL */}
							<Card>
								<CardHeader>Admin Control Center</CardHeader>

								<CardContent className="grid grid-cols-2 gap-2">
									<Button
										disabled={!canBan || isBusy}
										onClick={onBan}
										variant="outline"
									>
										<Ban className="w-4 h-4 mr-2" />
										Ban User
									</Button>

									{canDelete && (
										<Button
											disabled={isBusy}
											variant="danger"
											onClick={onDelete}
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete User
										</Button>
									)}
								</CardContent>
							</Card>
						</div>
					)}

					{/* EDIT */}
					{tab === "edit" && (
						<UserForm
							isEdit
							defaultValues={user}
							onSubmit={handleProfileUpdate}
							loading={loading?.updateProfile}
						/>
					)}
				</div>

				{/* FOOTER */}
				<div className="p-4 border-t text-xs text-muted-foreground">
					User management console
				</div>
			</div>

			{/* CREATE ACCOUNT MODAL */}
			<Modal
				open={openCreateAccount}
				onClose={() => setOpenCreateAccount(false)}
			>
				<ModalHeader>Create Account</ModalHeader>

				<ModalBody>
					<AccountForm
						userId={user.id}
						role={currentUser?.role}
						isLoading={isPending}
						onSubmit={createAccount}
					/>
				</ModalBody>

				<ModalFooter>
					<Button
						variant="outline"
						onClick={() => setOpenCreateAccount(false)}
					>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
}