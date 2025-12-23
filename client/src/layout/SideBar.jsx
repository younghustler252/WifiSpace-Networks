import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/ui/Logo";
import Avatar from "../components/ui/Avatar";
import { ROUTE } from "../Routes/Route";

import {
	Grid,
	CreditCard,
	BarChart2,
	User as ProfileIcon,
	Wifi,
	Shield,
	Users,
	LogOut,
	Receipt,
} from "lucide-react";

const Sidebar = ({ mobileOpen, setMobileOpen, isCollapsed }) => {
	const { user } = useAuth();

	// Base nav items
	const baseNavItems = [
		{ name: "Dashboard", path: ROUTE.dashboard, icon: Grid },
		{ name: "Profile", path: ROUTE.profile, icon: ProfileIcon },
	];

	// User-specific items
	const userNavItems = [
		{ name: "Subscriptions", path: ROUTE.subscriptions, icon: CreditCard },
		{ name: "Transactions", path: ROUTE.transactions, icon: BarChart2 },
		{ name: "Devices", path: ROUTE.devices, icon: Wifi },
	];

	// Admin items
	const adminNavItems = [
		{ name: "Admin Dashboard", path: ROUTE.adminDashboard, icon: Shield },
		{ name: "Manage Users", path: ROUTE.manageUsers, icon: Users },
		{ name: "Manage Subscriptions", path: ROUTE.adminSubscriptions, icon: CreditCard },
		{ name: "Payments", path: ROUTE.adminPayments, icon: Receipt },
	];

	// Combine nav items based on role
	let navItems = [...baseNavItems];
	if (user?.role === "admin") {
		navItems = [...navItems, ...userNavItems, ...adminNavItems];
	} else {
		navItems = [...navItems, ...userNavItems];
	}

	const textClass = isCollapsed ? "hidden" : "block";

	return (
		<>
			<aside
				style={{ width: isCollapsed ? 80 : 260 }}
				className={`h-screen fixed top-0 left-0 z-40 bg-surface border-r border-surface text-primary
          flex flex-col transition-[width,transform] duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
			>
				{/* Sidebar Header */}
				<div className="flex items-center justify-between px-4 h-14 border-b border-surface">
					<Logo collapsed={isCollapsed} />

					{/* Mobile close button */}
					<button
						className="lg:hidden focus:outline-none focus:ring-2 focus:ring-accent rounded"
						onClick={() => setMobileOpen(false)}
						aria-label="Close sidebar"
					>
						<LogOut className="w-5 h-5 text-secondary" />
					</button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-2">
					<ul className="space-y-1">
						{navItems.map((item) => {
							const Icon = item.icon;
							return (
								<li key={item.path}>
									<NavLink
										to={item.path}
										title={isCollapsed ? item.name : undefined}
										onClick={() => mobileOpen && setMobileOpen(false)}
										className={({ isActive }) =>
											`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 min-w-0
                      ${isActive
												? "bg-accent/10 text-accent font-semibold"
												: "text-secondary hover:bg-surface-hover"
											}`
										}
									>
										<Icon className="w-5 h-5 shrink-0" />
										<span className={`truncate ${textClass}`}>{item.name}</span>
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* User Footer */}
				{user && (
					<div className="p-4 border-t border-surface">
						<div className={`flex items-center gap-3 ${textClass}`}>
							<Avatar
								src={user.profilePicture}
								firstName={user.firstName}
								lastName={user.lastName}
								size={32}
							/>
							<div className="min-w-0">
								<div className="font-medium text-primary truncate">
									{user?.fullName || `${user.firstName} ${user.lastName}`}
								</div>
								<div className="text-xs text-secondary truncate">
									{user?.role || "user"}
								</div>
							</div>
						</div>

						{/* Collapsed Mode */}
						{isCollapsed && (
							<div className="flex justify-center mt-2">
								<Avatar
									src={user.profilePicture}
									firstName={user.firstName}
									lastName={user.lastName}
									size={32}
								/>
								<span className="sr-only">{user?.role}</span>
							</div>
						)}
					</div>
				)}
			</aside>

			{/* Mobile overlay */}
			{mobileOpen && (
				<div
					onClick={() => setMobileOpen(false)}
					className="fixed inset-0 bg-black/40 lg:hidden z-30"
				/>
			)}
		</>
	);
};

export default Sidebar;
