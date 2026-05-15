"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
	X,
	Mail,
	Phone,
	MapPin,
	Shield,
	Ban,
	Trash2,
	User,
	Plus,
	Activity,
	Server,
} from "lucide-react";

import { cn } from "@/lib/cn";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";

import Modal, {
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/Modal";

import AccountForm from "../forms/AccountForm";
import { accountApi } from "@/lib/api/account";
import UserForm from "../forms/UserForm";

interface Props {
	open: boolean;
	onClose: () => void;
	user: any;
	currentUser: any;

	onUpdateProfile: (data: any) => void;
	onUpdateRole: (role: string) => void;

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

	/* ================= ACCOUNTS ================= */
	const { data, isLoading } = useQuery({
		queryKey: ["user-accounts", user?.id],
		queryFn: () => accountApi.getAllAccounts({ userId: user.id }),
		enabled: !!user?.id && open,
	});

	const userAccounts = data?.data || [];

	/* ================= CREATE ACCOUNT ================= */
	const { mutate: createAccount, isPending } = useMutation({
		mutationFn: accountApi.createAccount,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["user-accounts", user?.id],
			});
			setOpenCreateAccount(false);
		},
	});

	if (!open || !user) return null;

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />

			<div className="relative w-full max-w-xl h-full bg-background border-l border-border shadow-xl flex flex-col">

				{/* ================= HEADER ================= */}
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<h2 className="font-semibold text-lg">User Control Panel</h2>
					<button onClick={onClose} className="p-2 hover:bg-muted rounded-md">
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* ================= BODY ================= */}
				<div className="flex-1 overflow-y-auto ui-scrollbar p-6">

					{/* ================= HERO ================= */}
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

					{/* ================= TABS ================= */}
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

					{/* ================= OVERVIEW ================= */}
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

							{/* ACCOUNTS INTELLIGENCE */}
							<Card>
								<CardHeader className="flex items-center gap-2">
									<Server className="w-4 h-4" />
									Accounts Intelligence
								</CardHeader>

								<CardContent className="space-y-3">

									{isLoading ? (
										<p className="text-sm text-muted-foreground">
											Loading accounts...
										</p>
									) : userAccounts.length ? (
										<>
											{userAccounts.map((acc: any) => (
												<Card
													key={acc.id}
													padding="sm"
													className="cursor-pointer hover:scale-[1.01] transition"
													onClick={() =>
														router.push(`/admin/account/${acc.id}`)
													}
												>
													<div className="flex justify-between items-start">

														<div>
															<p className="font-semibold text-sm">
																{acc.wsnId}
															</p>

															<p className="text-xs text-muted-foreground">
																{acc.accountType} • {acc.serviceType}
															</p>

															<p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
																<Activity className="w-3 h-3" />
																{acc.profileStatus}
															</p>
														</div>

														<span className="text-xs px-2 py-1 rounded-full bg-muted">
															{acc.profileStatus}
														</span>

													</div>
												</Card>
											))}

											<Button
												fullWidth
												variant="accent"
												leftIcon={<Plus className="w-4 h-4" />}
												onClick={() => setOpenCreateAccount(true)}
											>
												Create Account
											</Button>
										</>
									) : (
										<Button
											fullWidth
											variant="accent"
											onClick={() => setOpenCreateAccount(true)}
										>
											Create First Account
										</Button>
									)}
								</CardContent>
							</Card>

							{/* ROLE MANAGEMENT */}
							{currentUser?.role === "superadmin" && (
								<Card>
									<CardHeader>
										<div className="flex items-center gap-2">
											<Shield className="w-4 h-4" />
											Role Management
										</div>
									</CardHeader>

									<CardContent>
										<form
											onSubmit={(e) => {
												e.preventDefault();
												const role =
													(e.currentTarget.elements.namedItem(
														"role"
													) as HTMLSelectElement)?.value;

												onUpdateRole(role);
											}}
											className="flex gap-2"
										>
											<select className="ui-input" name="role">
												<option value="customer">Customer</option>
												<option value="staff">Staff</option>
												<option value="superadmin">Superadmin</option>
											</select>

											<Button type="submit">Update</Button>
										</form>
									</CardContent>
								</Card>
							)}

							{/* ADMIN CONTROL CENTER */}
							<Card>
								<CardHeader>Admin Control Center</CardHeader>

								<CardContent className="grid grid-cols-2 gap-2">

									<Button variant="outline" onClick={onBan}>
										<Ban className="w-4 h-4 mr-2" />
										Ban User
									</Button>

									{currentUser?.role === "superadmin" && (
										<Button variant="danger" onClick={onDelete}>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete User
										</Button>
									)}

								</CardContent>
							</Card>

						</div>
					)}

					{/* ================= EDIT ================= */}
					{tab === "edit" && (
						<UserForm
							isEdit
							defaultValues={user}
							onSubmit={onUpdateProfile}
							loading={loading?.updateProfile}
						/>
					)}
				</div>

				{/* ================= FOOTER ================= */}
				<div className="p-4 border-t text-xs text-muted-foreground">
					User management console
				</div>
			</div>

			{/* ================= CREATE ACCOUNT MODAL ================= */}
			<Modal open={openCreateAccount} onClose={() => setOpenCreateAccount(false)}>
				<ModalHeader onClose={() => setOpenCreateAccount(false)}>
					Create Account
				</ModalHeader>

				<ModalBody>
					<AccountForm
						userId={user.id}
						role={currentUser.role}
						isLoading={isPending}
						onSubmit={createAccount}
					/>
				</ModalBody>

				<ModalFooter>
					<Button variant="outline" onClick={() => setOpenCreateAccount(false)}>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>

		</div>
	);
}