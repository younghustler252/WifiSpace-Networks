import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
    useAllUsers,
    useSearchUsers,
    useBanUser
} from "../../hooks/useAdmin";

import { Spinner } from "../../components/ui/Loader";
import Avatar from "../../components/ui/Avatar";
import DataTable from "../../components/ui/DataTable";

const AdminManageUsers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);  // Current page
    const [limit, setLimit] = useState(10);  // Items per page
    const [sort, setSort] = useState("wsnId");  // Default sorting by WSN ID
    const [filters, setFilters] = useState({});  // Custom filters, like activeSubscription, etc.

    const navigate = useNavigate();

    // Fetch all users using the custom hook with pagination, search, and sorting
    const { data: users, isLoading, isError } = useAllUsers(filters, sort, page, limit);
    const { mutate: banUser } = useBanUser();

    // Handle search changes
    const search = useSearchUsers(searchQuery);

    const handleBanToggle = (user) => {
        banUser({ id: user._id, ban: !user.isBanned });
    };

    if (isLoading) return <Spinner message="Loading users..." />;
    if (isError) return <p className="text-red-500 text-center">Failed to load users.</p>;

    // Display the appropriate list of users based on search
    const displayUsers = searchQuery ? search.data || [] : users?.users || [];

    // Define the columns for the DataTable
    const columns = [
        { key: "user", label: "User" },
        { key: "email", label: "Email" },
        { key: "wsnId", label: "WSN ID" },
        { key: "subscription", label: "Subscription" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
    ];

    // Handle sorting change (click on column headers)
    const handleSortChange = (column) => {
        if (sort === column) {
            setSort(`-${column}`);  // Reverse the sorting order
        } else {
            setSort(column);
        }
    };

    // Handle pagination change (page change buttons)
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Handle items per page change (pagination dropdown)
    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);  // Reset to page 1 when changing limit
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Page Title and Create User Button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">Manage Users</h1>

                {/* Create User Button */}
                <button
                    onClick={() => navigate("/admin/users/create")}  // Link to Create User Page
                    className="btn btn-primary px-6 py-2 rounded-full hover:bg-blue-600 transition duration-200"
                >
                    Create User
                </button>
            </div>

            {/* Search */}
            <div>
                <input
                    type="text"
                    placeholder="Search by email or WSN ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border rounded-full w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>

            {/* Users Table */}
            <DataTable
                columns={columns}
                data={displayUsers}
                emptyText="No users found."
                renderRow={(user) => {
                    const isBanned = user.isBanned;

                    const handleRowClick = () => navigate(`/admin/users/${user._id}`);

                    return (
                        <tr
                            key={user._id}
                            className="group cursor-pointer hover:bg-[rgb(var(--border-color)/0.2)] dark:hover:bg-[rgb(var(--border-color)/0.2)] transition-colors"
                            onClick={handleRowClick}
                        >
                            {/* User */}
                            <td className="py-2 px-3 flex items-center gap-3">
                                <Avatar
                                    src={user.profilePicture}
                                    firstName={user.firstName}
                                    lastName={user.lastName}
                                    size={36}
                                />
                                <span className="font-medium">{user.firstName} {user.lastName}</span>
                            </td>

                            {/* Email */}
                            <td className="py-2 px-3">{user.email}</td>

                            {/* WSN ID */}
                            <td className="py-2 px-3">{user.wsnId || "N/A"}</td>

                            {/* Subscription */}
                            <td className="py-2 px-3 capitalize">{user.subscriptionStatus || "none"}</td>

                            {/* Status */}
                            <td className="py-2 px-3">
                                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${isBanned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                                    {isBanned ? "Suspended" : "Active"}
                                </span>
                            </td>

                            {/* Actions */}
                            <td className="py-2 px-3 flex justify-end items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleBanToggle(user); }}
                                    className={`p-2 rounded-lg transition-colors hover:bg-gray-200 ${isBanned ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                                    title={isBanned ? "Restore User" : "Suspend User"}
                                >
                                    {isBanned ? "↩️" : "🚫"}
                                </button>

                                {/* Optional hover arrow hint */}
                                <span className="text-muted opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                            </td>
                        </tr>
                    );
                }}
                renderCell={(user, index, key) => {
                    const isBanned = user.isBanned;
                    switch (key) {
                        case "user":
                            return (
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={user.profilePicture}
                                        firstName={user.firstName}
                                        lastName={user.lastName}
                                        size={36}
                                    />
                                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                                </div>
                            );
                        case "email":
                            return user.email;
                        case "wsnId":
                            return user.wsnId || "N/A";
                        case "subscription":
                            return user.subscriptionStatus || "none";
                        case "status":
                            return (
                                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${isBanned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                                    {isBanned ? "Suspended" : "Active"}
                                </span>
                            );
                        case "actions":
                            return (
                                <button
                                    onClick={() => handleBanToggle(user)}
                                    className={`p-2 rounded-lg transition-colors hover:bg-gray-200 ${isBanned ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                                    title={isBanned ? "Restore User" : "Suspend User"}
                                >
                                    {isBanned ? "↩️" : "🚫"}
                                </button>
                            );
                        default:
                            return null;
                    }
                }}
            />

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <div>
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="btn btn-secondary px-4 py-2 rounded-full"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={users && page === Math.ceil(users.totalCount / limit)}
                        className="btn btn-secondary px-4 py-2 rounded-full"
                    >
                        Next
                    </button>
                </div>

                <div>
                    <select
                        onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                        value={limit}
                        className="px-3 py-2 border rounded-full"
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
