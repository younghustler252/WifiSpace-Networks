"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Mail, MoreVertical } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Dropdown, { DropdownItem, DropdownDivider } from "@/components/ui/Dropdown";
import StatusBadge from "@/components/ui/StatusBadge";

import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/Table";

import { MobileDataCard } from "@/components/ui/MobileDataCard";
import AdminTableLayout from "@/components/layout/AdminTableLayout";

import Modal, { ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import UserForm from "@/features/user/UserForm";
import UserDrawer from "@/features/user/UserDrawer";

import {
	useAdminUsers,
	useCreateUser,
	useUpdateUserProfile,
	useUpdateUserRole,
	useBanUser,
	useDeleteUser,
} from "@/features/user/hooks/useAdminUsers";

import { useAuth } from "@/context/AuthContext";

type Role = "superadmin" | "staff" | "customer" | "";

interface Props {
	scope: "admin" | "staff";
}

export default function UsersTable({ scope }: Props) {
	const { user: currentUser } = useAuth();

	// ================= ROLE FLAGS =================
	const isSuperAdmin = currentUser?.role === "superadmin";
	const isStaff = currentUser?.role === "staff";

	// ================= STATE =================
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const [roleFilter, setRoleFilter] = useState<Role>("");
	const [statusFilter, setStatusFilter] = useState("");
	const [sort, setSort] = useState<"az" | "za" | "newest" | "oldest">("az");

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [selectedUser, setSelectedUser] = useState<any | null>(null);
	const [openCreate, setOpenCreate] = useState(false);

	// ================= CONFIRM MODALS =================
	const [confirmBan, setConfirmBan] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	// ================= INLINE STATUS =================
	const [statusMsg, setStatusMsg] = useState<string | null>(null);

	// ================= DEBOUNCE =================
	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(t);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, roleFilter, statusFilter, sort]);

	// ================= QUERY =================
	const usersQuery = useAdminUsers({
		search: debouncedSearch,
		role: scope === "staff" ? "customer" : roleFilter || undefined,
		status: statusFilter || undefined,
		sort,
		page,
		limit,
	});

	const users = usersQuery.data?.data?.data ?? [];
	const total = usersQuery.data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// ================= MUTATIONS =================
	const createMutation = useCreateUser();
	const updateProfileMutation = useUpdateUserProfile();
	const updateRoleMutation = useUpdateUserRole();
	const banMutation = useBanUser();
	const deleteMutation = useDeleteUser();

	// ================= GUARDS =================
	const lockBan = banMutation.isPending;
	const lockDelete = deleteMutation.isPending;
	const lockUpdate = updateProfileMutation.isPending || updateRoleMutation.isPending;

	// ================= HANDLERS =================
	const handleCreate = async (data: any) => {
		if (createMutation.isPending) return;

		await createMutation.mutateAsync(data);
		setOpenCreate(false);
		setStatusMsg("User created successfully");
		setTimeout(() => setStatusMsg(null), 2500);
	};

	const handleUpdateProfile = async (data: any) => {
		if (!selectedUser || lockUpdate) return;

		await updateProfileMutation.mutateAsync({
			id: selectedUser.id,
			data,
		});

		setStatusMsg("Profile updated successfully");
		setTimeout(() => setStatusMsg(null), 2500);
	};

	const handleUpdateRole = async (role: any) => {
		if (!selectedUser || isStaff || updateRoleMutation.isPending) return;

		await updateRoleMutation.mutateAsync({
			userId: selectedUser.id,
			role,
		});

		setStatusMsg("Role updated successfully");
		setTimeout(() => setStatusMsg(null), 2500);
	};

	const handleBan = async () => {
		if (!selectedUser || isStaff || lockBan) return;

		await banMutation.mutateAsync(selectedUser.id);
		setConfirmBan(false);
		setStatusMsg("User banned successfully");
		setTimeout(() => setStatusMsg(null), 2500);
	};

	const handleDelete = async () => {
		if (!selectedUser || !isSuperAdmin || lockDelete) return;


		await deleteMutation.mutateAsync(selectedUser.id);
		setSelectedUser(null);
		setConfirmDelete(false);

		setStatusMsg("User deleted successfully");
		setTimeout(() => setStatusMsg(null), 2500);
	};

	// ================= TOOLBAR =================
	const primary = (
		<div className="relative w-full md:w-72">
			<Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
			<input
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search users..."
				className="ui-input pl-10 w-full"
			/>
		</div>
	);

	const secondary = (
		<>
			{scope === "admin" && (
				<select
					className="ui-input"
					value={roleFilter}
					onChange={(e) => setRoleFilter(e.target.value as Role)}
				>
					<option value="">All Roles</option>
					<option value="customer">Customer</option>
					<option value="staff">Staff</option>
					<option value="superadmin">Superadmin</option>
				</select>
			)}

			<select
				className="ui-input"
				value={statusFilter}
				onChange={(e) => setStatusFilter(e.target.value)}
			>
				<option value="">All Status</option>
				<option value="active">Active</option>
				<option value="banned">Banned</option>
			</select>

			<select
				className="ui-input"
				value={sort}
				onChange={(e) => setSort(e.target.value as any)}
			>
				<option value="az">A → Z</option>
				<option value="za">Z → A</option>
				<option value="newest">Newest</option>
				<option value="oldest">Oldest</option>
			</select>

			<select
				className="ui-input"
				value={limit}
				onChange={(e) => {
					setLimit(Number(e.target.value));
					setPage(1);
				}}
			>
				<option value={10}>10</option>
				<option value={20}>20</option>
				<option value={50}>50</option>
			</select>
		</>
	);

	const actions = (
		<Button variant="accent" onClick={() => setOpenCreate(true)}>
			<Plus className="w-4 h-4 mr-2" />
			Create User
		</Button>
	);

	// ================= RENDER =================
	return (
		<>
			<AdminTableLayout
				title={scope === "admin" ? "Manage Users" : "Customers"}
				primary={primary}
				secondary={secondary}
				actions={actions}
				loading={usersQuery.isLoading}
				fetching={usersQuery.isFetching}
				isEmpty={users.length === 0}
				emptyText="No users found"
				page={page}
				totalPages={totalPages}
				limit={limit}
				onPageChange={setPage}
				onLimitChange={setLimit}
	
				/* 🔥 REQUIRED FIX */
				table={
					<Table>
						<TableHeader>
							<tr>
								<TableHead>User</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Joined</TableHead>
								<TableHead>Actions</TableHead>
							</tr>
						</TableHeader>

						<TableBody>
							{users.map((u: any) => (
								<TableRow key={u.id} onClick={() => setSelectedUser(u)}>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar
												name={`${u.firstName} ${u.lastName}`}
												src={u?.avatar?.url}
											/>
											<div>
												<p>{u.firstName} {u.lastName}</p>
												<p className="text-xs text-muted-foreground flex items-center gap-1">
													<Mail className="w-3 h-3" />
													{u.email}
												</p>
											</div>
										</div>
									</TableCell>

									<TableCell>{u.phone || "-"}</TableCell>

									<TableCell>
										<span className="ui-badge">{u.role}</span>
									</TableCell>

									<TableCell>
										<StatusBadge variant={u.status} size="md" withDot>
											{u.status}
										</StatusBadge>
									</TableCell>

									<TableCell>
										{new Date(u.createdAt).toLocaleDateString()}
									</TableCell>

									<TableCell>
										<div onClick={(e) => e.stopPropagation()}>
											<Dropdown trigger={<button><MoreVertical /></button>}>
												<DropdownItem onClick={() => setSelectedUser(u)}>
													View
												</DropdownItem>
											</Dropdown>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				}

				/* 🔥 MOBILE REQUIRED TOO */
				mobile={
					<div className="ui-stack">
						{users.map((u: any) => (
							<MobileDataCard
								key={u.id}
								title={`${u.firstName} ${u.lastName}`}
								subtitle={u.email}
								badge={<span className="ui-badge">{u.role}</span>}
								fields={[
									{ label: "Phone", value: u.phone || "-" },
									{ label: "Status", value: u.status },
								]}
								onClick={() => setSelectedUser(u)}
							/>
						))}
					</div>
				}
			/>

			{/* STATUS MESSAGE */}
			{statusMsg && (
				<div className="fixed top-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded shadow">
					{statusMsg}
				</div>
			)}

			{/* ================= CREATE MODAL ================= */}
			<Modal open={openCreate} onClose={() => setOpenCreate(false)}>
				<ModalHeader>Create User</ModalHeader>
				<ModalBody>
					<UserForm
						onSubmit={handleCreate}
						loading={createMutation.isPending}
					/>
				</ModalBody>
			</Modal>

			{/* ================= BAN CONFIRM ================= */}
			<Modal open={confirmBan} onClose={() => setConfirmBan(false)}>
				<ModalHeader>Confirm Ban</ModalHeader>
				<ModalBody>
					Are you sure you want to ban this user?
				</ModalBody>
				<ModalFooter>
					<Button variant="outline" onClick={() => setConfirmBan(false)}>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={handleBan}
						disabled={lockBan}
					>
						Ban User
					</Button>
				</ModalFooter>
			</Modal>

			{/* ================= DELETE CONFIRM ================= */}
			<Modal className="z-[100]" open={confirmDelete} onClose={() => setConfirmDelete(false)}>
				<ModalHeader>Confirm Delete</ModalHeader>
				<ModalBody>
					This action cannot be undone. Delete this user?
				</ModalBody>
				<ModalFooter>
					<Button variant="outline" onClick={() => setConfirmDelete(false)}>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={handleDelete}
						disabled={lockDelete}
					>
						Delete User
					</Button>
				</ModalFooter>
			</Modal>

			{/* ================= DRAWER ================= */}
			<UserDrawer
				user={selectedUser}
				open={!!selectedUser}
				onClose={() => setSelectedUser(null)}
				currentUser={currentUser}
				onUpdateProfile={handleUpdateProfile}
				onUpdateRole={handleUpdateRole}
				onBan={() => setConfirmBan(true)}
				onDelete={() => setConfirmDelete(true)}
				loading={{
					updateProfile: updateProfileMutation.isPending,
					updateRole: updateRoleMutation.isPending,
					ban: banMutation.isPending,
					delete: deleteMutation.isPending,
				}}
			/>
		</>
	);
}