import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
import { ROUTE } from "../../Routes/Route";

const AdminManageUsers = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [sort] = useState("wsnId");
	const [filters] = useState({});

	const navigate = useNavigate();

	// Fetch users
	const { data: users, isLoading, isError } = useAllUsers(filters, sort, page, limit);
	const search = useSearchUsers(searchQuery);
	const { mutate: banUser } = useBanUser();
	const { mutate: deleteUser } = useDeleteUser();

	const handleBanToggle = (user) => {
		banUser({ id: user._id, ban: !user.isBanned });
	};

	if (isLoading) return <Spinner message="Loading users..." />;
	if (isError)
		return (
			<div className="card text-center text-danger py-6">
				Failed to load users.
			</div>
		);

	const displayUsers = searchQuery ? search.data || [] : users?.users || [];

	const columns = [
		{ key: "user", label: "User" },
		{ key: "email", label: "Email" },
		{ key: "wsnId", label: "WSN ID" },
		{ key: "subscription", label: "Subscription" },
		{ key: "status", label: "Status" },
		{ key: "actions", label: "" },
	];

	const handleRowClick = (user) => {
		navigate(`${ROUTE.manageUsers}/${user._id}`);
	};

	return (
		<div className="max-w-7xl mx-auto p-6 space-y-6">
			{/* Page Header */}
			<PageHeader
				title="Manage Users"
				actionLabel="Create User"
				onAction={() => navigate(`${ROUTE.manageUsers}/create`)}
			/>

			{/* Search */}
			<div className="max-w-md">
				<SearchInput
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search by email or WSN ID"
				/>
			</div>

			{/* Users Table / Mobile Cards */}
			<DataTable
				columns={columns}
				data={displayUsers}
				emptyText="No users found."
				onRowClick={handleRowClick}
				renderCell={(user, index, key) => {
					const isBanned = user.isBanned;
					switch (key) {
						case "user":
							return `${user.firstName} ${user.lastName}`;
						case "email":
							return user.email;
						case "wsnId":
							return user.wsnId || "N/A";
						case "subscription":
							return user.subscriptionStatus || "None";
						case "status":
							return <StatusBadge status={isBanned ? "suspended" : "active"} />;
						case "actions":
							return (
								<RowActions
									actions={[
										{
											label: "Edit",
											onClick: (e) => {
												e.stopPropagation();
												handleRowClick(user);
											},
										},
										{
											label: isBanned ? "Restore" : "Suspend",
											variant: isBanned ? "success" : "danger",
											onClick: (e) => {
												e.stopPropagation();
												handleBanToggle(user);
											},
										},
										{
											label: "Delete",
											variant: "danger",
											disabled: user.isSystemUser,
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

			{/* Pagination Controls */}
			<div className="flex justify-between items-center flex-wrap gap-3 mt-4">
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
						disabled={
							users && page === Math.ceil(users.totalCount / limit)
						}
						className="btn btn-secondary"
					>
						Next
					</button>
				</div>

				<div>
					<select
						value={limit}
						onChange={(e) => {
							setLimit(Number(e.target.value));
							setPage(1);
						}}
						className="px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent"
					>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
					</select>
				</div>
			</div>
		</div>
	);
};

export default AdminManageUsers;
