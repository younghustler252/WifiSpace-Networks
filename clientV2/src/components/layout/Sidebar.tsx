"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAuth } from "@/context/AuthContext";

import Logo from "../ui/Logo";
import { navigation } from "@/lib/navigation";
import { Power, X } from "lucide-react";

import Button from "../ui/Button";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";

interface SidebarProps {
	currentPath?: string;
	className?: string;

	// 🔥 controlled from layout
	mobileOpen?: boolean;
	setMobileOpen?: (open: boolean) => void;
}

const Sidebar = ({
	currentPath = "",
	className = "",
	mobileOpen = false,
	setMobileOpen,
}: SidebarProps) => {
	const { user, logout } = useAuth();
	const [openLogout, setOpenLogout] = useState(false);

	const role = user?.role as "customer" | "staff" | "superadmin";

	const items = useMemo(() => navigation[role] || [], [role]);

	// ================= ACTIVE ROUTE =================
	const isActiveRoute = (href: string) => {
		if (!currentPath) return false;

		const normalize = (p: string) => p.replace(/\/+$/, "");
		const current = normalize(currentPath);
		const target = normalize(href);

		return current === target || current.startsWith(target + "/");
	};

	return (
		<>
			{/* ================= MOBILE OVERLAY ================= */}
			{mobileOpen && (
				<div
					className="fixed inset-0 bg-black/40 z-40 md:hidden"
					onClick={() => setMobileOpen?.(false)}
				/>
			)}

			{/* ================= SIDEBAR ================= */}
			<aside
				className={cn(
					"fixed md:static z-50 top-0 left-0 h-screen w-64 flex flex-col",
					"bg-card border-r border-border",
					"transition-transform duration-300 ease-in-out",
					mobileOpen
						? "translate-x-0"
						: "-translate-x-full md:translate-x-0",
					className
				)}
			>
				{/* ================= HEADER ================= */}
				<div className="h-16 flex items-center justify-between px-6 border-b border-border">
					<Logo size="md" />

					{/* close button (mobile only) */}
					<button
						className="md:hidden p-2 rounded-md hover:bg-muted"
						onClick={() => setMobileOpen?.(false)}
					>
						<X size={18} />
					</button>
				</div>

				{/* ================= NAV ================= */}
				<nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
					{items.map((item) => {
						const isActive = isActiveRoute(item.href);

						return (
							<Link
								key={`${item.label}-${item.href}`}
								href={item.href}
								onClick={() => setMobileOpen?.(false)}
								className={cn(
									"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
									"group",
									isActive
										? "bg-accent-soft text-accent font-medium"
										: "text-muted-foreground hover:text-foreground hover:bg-muted"
								)}
								aria-current={isActive ? "page" : undefined}
							>
								<span className="opacity-80 group-hover:opacity-100">
									{item.icon}
								</span>

								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>

				{/* ================= LOGOUT ================= */}
				<div className="p-4 border-t border-border">
					<Button
						variant="ghost"
						className="w-full justify-start text-danger hover:bg-danger/10"
						leftIcon={<Power size={16} />}
						onClick={() => setOpenLogout(true)}
					>
						Logout
					</Button>
				</div>
			</aside>

			{/* ================= LOGOUT MODAL ================= */}
			<Modal open={openLogout} onClose={() => setOpenLogout(false)}>
				<ModalHeader>Confirm Logout</ModalHeader>

				<ModalBody>
					Are you sure you want to log out?
				</ModalBody>

				<ModalFooter>
					<Button
						variant="outline"
						onClick={() => setOpenLogout(false)}
					>
						Cancel
					</Button>

					<Button
						variant="danger"
						onClick={() => {
							setOpenLogout(false);
							logout();
						}}
					>
						Logout
					</Button>
				</ModalFooter>
			</Modal>
		</>
	);
};

export default Sidebar;