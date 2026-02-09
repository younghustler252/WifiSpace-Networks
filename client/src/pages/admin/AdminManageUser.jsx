import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
	useAllUsers,
	useSearchUsers,
	useBanUser,
	useDeleteUser,
} from "../../hooks/useAdmin";

import { Spinner } from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import DataTable from "../../components/ui/DataTable";
import RowActions from "../../components/ui/RowActions";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import { ROUTE } from "../../Routes/Route";

const AdminManageUsers = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	// ---------------------------
	// State
	// ---------------------------
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [sort] = useState("wsnId");
	const [showFilterModal, setShowFilterModal] = useState(false);

	const [filters, setFilters] = useState({
		subscriptionStatus: "",
		hotspotSynced: undefined,
		role: "",
		isVerified: undefined,
	});

	// ---------------------------
	// Initialize filters from query params
	// ---------------------------
	useEffect(() => {
		const params = Object.fromEntries([...searchParams]);
		setFilters({
			subscriptionStatus: params.subscriptionStatus || "",
			hotspotSynced:
				params.hotspotSynced === undefined
					? undefined
					: params.hotspotSynced === "true",
			role: params.role || "",
			isVerified:
				params.isVerified === undefined
					? undefined
					: params.isVerified === "true",
		});
	}, [searchParams]);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [filters]);

	// ---------------------------
	// Queries
	// ---------------------------
	const { data: users, isPending, isError } = useAllUsers(filters, sort, page, limit);
	const search = useSearchUsers(searchQuery);

	const { mutate: banUser } = useBanUser();
	const { mutate: deleteUser } = useDeleteUser();

	// ---------------------------
	// Handlers
	// ---------------------------
	const handleBanToggle = (user) => {
		banUser({ id: user._id, ban: user.subscriptionStatus !== "suspended" });
	};

	const handleRowClick = (user) => {
		navigate(`${ROUTE.manageUsers}/${user._id}`);
	};
	const handleEditClick = (user) => {
		navigate(`${ROUTE.manageUsers}/edit/${user._id}`)
	}

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	// ---------------------------
	// Loading / Error
	// ---------------------------
	if (isPending && !searchQuery)
		return <Spinner message="Loading users..." />;

	if (searchQuery && search.isPending)
		return (
			<div className="absolute bg-card border border-surface shadow-card p-4 rounded-md">
				Searching users...
			</div>
		);

	if (isError)
		return (
			<div className="card text-center text-danger py-6">
				Failed to load users.
			</div>
		);

	const displayUsers = searchQuery ? search.data || [] : users?.users || [];

	// ---------------------------
	// Columns
	// ---------------------------
	const columns = [
		{ key: "user", label: "User" },
		{ key: "email", label: "Email" },
		{ key: "wsnId", label: "WSN ID" },
		{ key: "subscription", label: "Subscription" },
		{ key: "status", label: "Status" },
		{ key: "actions", label: "" },
	];

	// ---------------------------
	// Render
	// ---------------------------
	return (
		<div className="max-w-7xl mx-auto p-6 space-y-6">
			<PageHeader
				title="Manage Users"
				actionLabel="Create User"
				onAction={() => navigate(`${ROUTE.manageUsers}/create`)}
			/>

			{/* Search & Filter */}
			<div className="flex flex-col md:flex-row items-center gap-3">
				<div className="flex-1 max-w-md">
					<SearchInput
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search by name, email or WSN ID"
					/>
				</div>

				{/* Desktop Filters */}
				<div className="hidden md:flex gap-2">
					<select
						value={filters.subscriptionStatus}
						onChange={(e) => handleFilterChange("subscriptionStatus", e.target.value)}
						className="px-3 py-2 border border-surface rounded focus-ring bg-surface"
					>
						<option value="">All Subscriptions</option>
						<option value="active">Active</option>
						<option value="expired">Expired</option>
						<option value="suspended">Suspended</option>
						<option value="none">None</option>
					</select>

					<select
						value={filters.hotspotSynced ?? ""}
						onChange={(e) =>
							handleFilterChange(
								"hotspotSynced",
								e.target.value === "" ? undefined : e.target.value === "true"
							)
						}
						className="px-3 py-2 border border-surface rounded focus-ring bg-surface"
					>
						<option value="">All Synced</option>
						<option value="true">Synced</option>
						<option value="false">Not Synced</option>
					</select>
				</div>

				{/* Mobile Filter Button */}
				<div className="md:hidden">
					<button
						className="btn btn-soft"
						onClick={() => setShowFilterModal(true)}
					>
						Filters
					</button>
				</div>
			</div>

			{/* Filter Modal */}
			<Modal open={showFilterModal} onClose={() => setShowFilterModal(false)}>
				<h3 className="text-lg font-semibold mb-4">Filters</h3>
				<div className="space-y-3">
					<div>
						<label className="block text-sm mb-1">Subscription Status</label>
						<select
							value={filters.subscriptionStatus}
							onChange={(e) => handleFilterChange("subscriptionStatus", e.target.value)}
							className="px-3 py-2 border border-surface rounded w-full focus-ring bg-surface"
						>
							<option value="">All Subscriptions</option>
							<option value="active">Active</option>
							<option value="expired">Expired</option>
							<option value="suspended">Suspended</option>
							<option value="none">None</option>
						</select>
					</div>

					<div>
						<label className="block text-sm mb-1">Hotspot Synced</label>
						<select
							value={filters.hotspotSynced ?? ""}
							onChange={(e) =>
								handleFilterChange(
									"hotspotSynced",
									e.target.value === "" ? undefined : e.target.value === "true"
								)
							}
							className="px-3 py-2 border border-surface rounded w-full focus-ring bg-surface"
						>
							<option value="">All Synced</option>
							<option value="true">Synced</option>
							<option value="false">Not Synced</option>
						</select>
					</div>

					<div className="flex justify-end">
						<button
							className="btn btn-primary"
							onClick={() => setShowFilterModal(false)}
						>
							Apply
						</button>
					</div>
				</div>
			</Modal>

			{/* Table */}
			<DataTable
				columns={columns}
				data={displayUsers}
				emptyText="No users found."
				onRowClick={handleRowClick}
				renderCell={(user, index, key) => {
					switch (key) {
						case "user":
							return `${user.firstName} ${user.lastName}`;
						case "email":
							return user.email;
						case "wsnId":
							return user.wsnId || "N/A";
						case "subscription":
							return user.subscription?.planName || "No Plan";
						case "status":
							return <StatusBadge status={user.subscriptionStatus || "none"} />;
						case "actions":
							return (
								<RowActions
									actions={[
										{
											label: "Edit",
											onClick: (e) => {
												e.stopPropagation();
												handleEditClick(user);
											},
										},
										{
											label:
												user.subscriptionStatus === "suspended"
													? "Restore"
													: "Suspend",
											variant:
												user.subscriptionStatus === "suspended"
													? "success"
													: "danger",
											onClick: (e) => {
												e.stopPropagation();
												handleBanToggle(user);
											},
										},
										{
											label: "Delete",
											variant: "danger",
											onClick: (e) => {
												e.stopPropagation();
												if (
													confirm(
														`Delete ${user.firstName} ${user.lastName}?`
													)
												) {
													deleteUser(user._id);
												}
											},
										},
									]}
								/>
							);
						default:
							return "-";
					}
				}}
			/>

			{/* Pagination */}
			<div className="flex justify-between items-center mt-4">
				<div className="flex gap-2">
					<button
						onClick={() => setPage(page - 1)}
						disabled={page === 1}
						className="btn btn-secondary"
					>
						Prev
					</button>
					<button
						onClick={() => setPage(page + 1)}
						disabled={users && page >= Math.ceil(users.totalCount / limit)}
						className="btn btn-secondary"
					>
						Next
					</button>
				</div>

				<select
					value={limit}
					onChange={(e) => {
						setLimit(Number(e.target.value));
						setPage(1);
					}}
					className="px-3 py-2 border rounded-full text-sm focus-ring bg-surface"
				>
					<option value={10}>10</option>
					<option value={20}>20</option>
					<option value={50}>50</option>
				</select>
			</div>
		</div>
	);
};

export default AdminManageUsers;
