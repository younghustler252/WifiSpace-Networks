"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Search, Plus, Mail, MoreVertical } from "lucide-react";

import { userApi } from "@/lib/api/user";
import { useAuth } from "@/context/AuthContext";

import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";

import Modal, { ModalHeader, ModalBody } from "@/components/ui/Modal";
import UserForm from "@/features/user/UserForm";
import UserDrawer from "@/features/user/UserDrawer";

import Dropdown, {
	DropdownItem,
	DropdownDivider,
} from "@/components/ui/Dropdown";

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

export default function AdminUsersPage() {
	const { user: currentUser } = useAuth();
	const queryClient = useQueryClient();

	// ================= STATE =================
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [sort, setSort] = useState<"az" | "za" | "newest" | "oldest">("az");

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [selectedUser, setSelectedUser] = useState<any | null>(null);
	const [openCreate, setOpenCreate] = useState(false);

	// ================= DEBOUNCE =================
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, roleFilter, statusFilter]);

	// ================= QUERY =================
	const { data, isLoading, isFetching, error } = useQuery({
		queryKey: [
			"admin-users",
			debouncedSearch,
			roleFilter,
			statusFilter,
			sort,
			page,
			limit,
		],
		queryFn: () =>
			userApi.getAllUsers({
				search: debouncedSearch || undefined,
				role: roleFilter || undefined,
				status: statusFilter || undefined,
				sort,
				skip: (page - 1) * limit,
				limit,
			}),
		placeholderData: (previousData) => previousData,
		staleTime: 30 * 1000, // 30s cache
		refetchInterval: 10 * 1000 // live-ish updates
	});

	const users = data?.data?.data || [];
	const total = data?.data?.total || 0;
	const totalPages = Math.ceil(total / limit);

	// ================= MUTATIONS =================
	const createMutation = useMutation({
		mutationFn: userApi.createUser,

		onSuccess: () => {
			setOpenCreate(false);
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		},
	});

	const banMutation = useMutation({
		mutationFn: (id: string) => userApi.banUser(id),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
	});
	const deleteMutation = useMutation({
		mutationFn: (id: string) => userApi.deleteUser(id),
		onSuccess: () => {
			setSelectedUser(null);
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		},
	});

	// 🔥 IMPORTANT FIX (THIS IS WHAT YOU WERE MISSING)
	const handleCreate = async (data: any) => {
		await createMutation.mutateAsync(data);
	};

	const handleFilterChange = (setter: any) => (value: string) => {
		setter(value);
		setPage(1);
	};

	if (error) {
		const msg =
			(error as any)?.response?.data?.message ||
			"Failed to load users";

		return (
			<div className="p-6 text-danger text-center">
				{msg}
			</div>
		);
	}

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
			<select
				className="ui-input"
				value={roleFilter}
				onChange={(e) =>
					handleFilterChange(setRoleFilter)(e.target.value)
				}
			>
				<option value="">All Roles</option>
				<option value="customer">Customer</option>
				<option value="staff">Staff</option>
				<option value="superadmin">Superadmin</option>
			</select>

			<select
				className="ui-input"
				value={statusFilter}
				onChange={(e) =>
					handleFilterChange(setStatusFilter)(e.target.value)
				}
			>
				<option value="">All Status</option>
				<option value="active">Active</option>
				<option value="banned">Banned</option>
			</select>

			<select
				className="ui-input"
				value={sort}
				onChange={(e) => {
					setSort(e.target.value as "az" | "za" | "newest" | "oldest");
					setPage(1);
				}}
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
				title="Manage Users"
				primary={primary}
				secondary={secondary}
				actions={actions}
				loading={isLoading}
				fetching={isFetching}
				isEmpty={users.length === 0}
				emptyText="No users found"
				page={page}
				totalPages={totalPages}
				limit={limit}
				onPageChange={setPage}
				onLimitChange={setLimit}

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
								actions={
									<Dropdown trigger={<button className="p-2">⋮</button>}>
										<DropdownItem onClick={() => setSelectedUser(u)}>
											View
										</DropdownItem>
										<DropdownDivider />
										<DropdownItem onClick={() => banMutation.mutate(u.id)}>
											Ban
										</DropdownItem>
									</Dropdown>
								}
							/>
						))}
					</div>
				}

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
												<p className="text-xs text-muted-foreground">
													<Mail className="w-3 h-3 inline mr-1" />
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
										<span className="ui-badge">{u.status}</span>
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
												<DropdownDivider />
												<DropdownItem
													danger
													aria-disabled={deleteMutation.isPending}
													onClick={() => deleteMutation.mutate(u.id)}
												>
													Delete
												</DropdownItem>
											</Dropdown>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				}
			/>

			{/* CREATE USER MODAL */}
			<Modal open={openCreate} onClose={() => setOpenCreate(false)} size="lg">
				<ModalHeader>Create User</ModalHeader>
				<ModalBody>
					<UserForm
						onSubmit={handleCreate}
						loading={createMutation.isPending}
						apiError={createMutation.error}
					/>
				</ModalBody>
			</Modal>

			{/* USER DRAWER */}
			<UserDrawer
				user={selectedUser}
				currentUser={currentUser}
				open={!!selectedUser}
				onClose={() => setSelectedUser(null)}
				onUpdateProfile={async () => {}}
				onUpdateRole={() => {}}
				onBan={() => {}}
				onDelete={() => {}}
			/>
		</>
	);
}