import React from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "./Avatar";
import RowActions from "./RowActions";
import StatusBadge from "./StatusBadge";
import { ROUTE } from "../../Routes/Route";

const UserRow = ({ user, handleBanToggle, deleteUser, isMobile = false }) => {
	const navigate = useNavigate();
	const isBanned = user.isBanned;

	const actions = [
		{
			label: "Edit",
			onClick: (e) => {
				e.stopPropagation();
				navigate(`${ROUTE.manageUsers}/edit/${user._id}`);
			},
		},
		{
			label: isBanned ? "Restore User" : "Suspend User",
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
				if (confirm(`Delete ${user.firstName} ${user.lastName}?`)) {
					deleteUser(user._id);
				}
			},
		},
	];

	// MOBILE CARD
	if (isMobile) {
		return (
			<div
				onClick={() => navigate(`${ROUTE.manageUsers}/${user._id}`)}
				className="card card-hover bg-card border border-surface rounded-xl shadow-card p-4 flex flex-col gap-3 hover:bg-surface-hover transition-colors cursor-pointer"
			>
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-3">
						<Avatar
							src={user.profilePicture}
							firstName={user.firstName}
							lastName={user.lastName}
							size={36}
						/>
						<div>
							<p className="text-sm font-medium text-primary">
								{user.firstName} {user.lastName}
							</p>
							<p className="text-xs text-muted">{user.email}</p>
						</div>
					</div>

					{/* Actions */}
					<RowActions
						actions={actions}
						onClick={(e) => e.stopPropagation()} // prevent card click
					/>
				</div>

				{/* Additional Info */}
				<div className="grid grid-cols-2 gap-4 text-sm text-primary">
					<div>
						<span className="text-muted">WSN ID:</span> {user.wsnId || "N/A"}
					</div>
					<div>
						<span className="text-muted">Subscription:</span>{" "}
						{user.subscriptionStatus || "None"}
					</div>
					<div className="col-span-2">
						<span className="text-muted">Status:</span>{" "}
						<StatusBadge status={isBanned ? "suspended" : "active"} />
					</div>
				</div>
			</div>
		);
	}

	// DESKTOP TABLE ROW
	return (
		<tr className="hover:bg-hover transition-colors">
			<td
				className="px-4 py-3 flex items-center gap-3 cursor-pointer"
				onClick={() => navigate(`${ROUTE.manageUsers}/${user._id}`)}
			>
				<Avatar
					src={user.profilePicture}
					firstName={user.firstName}
					lastName={user.lastName}
					size={36}
				/>
				<span className="text-sm font-medium text-primary">
					{user.firstName} {user.lastName}
				</span>
			</td>

			<td className="px-4 py-3 text-sm text-primary">{user.email}</td>
			<td className="px-4 py-3 text-sm">{user.wsnId || "N/A"}</td>
			<td className="px-4 py-3 text-sm capitalize">
				{user.subscriptionStatus || "None"}
			</td>
			<td className="px-4 py-3">
				<StatusBadge status={isBanned ? "suspended" : "active"} />
			</td>
			<td className="px-4 py-3 text-right">
				<RowActions actions={actions} />
			</td>
		</tr>
	);
};

export default UserRow;
