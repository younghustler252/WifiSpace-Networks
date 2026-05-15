"use client";

import React, { useState } from "react";
import { ChevronDown, Bell, Moon, Menu } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { cn } from "@/lib/cn";
import { Spinner } from "../ui/Loader";

const Topbar = ({ onToggleSidebar }: { onToggleSidebar?: () => void }) => {
	const { user, accounts, activeAccount, switchAccount, loading } = useAuth();
	const [open, setOpen] = useState(false);

	if (loading) return <Spinner />;

	const getAccountLabel = (acc: any) => {
		if (!acc) return { title: "No Account", subtitle: "" };

		return {
			title: acc.wsnId || "WSN",
			subtitle: acc.accountType,
		};
	};

	return (
		<header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border">

			{/* LEFT */}
			<div className="flex items-center gap-3">

				{/* 🔥 MOBILE MENU */}
				<button
					onClick={onToggleSidebar}
					className="md:hidden p-2 rounded-lg hover:bg-muted"
				>
					<Menu size={20} />
				</button>

				{/* ACCOUNT SWITCH */}
				<div className="relative">
					<Button
						variant="outline"
						size="sm"
						className="flex items-center gap-2 !h-10"
						onClick={() => setOpen(!open)}
						rightIcon={<ChevronDown size={14} />}
					>
						<div className="flex flex-col items-start leading-tight">
							{(() => {
								const acc = getAccountLabel(activeAccount);

								return (
									<>
										<span className="text-sm font-semibold truncate max-w-[140px]">
											{acc.title}
										</span>
										<span className="text-[11px] text-muted-foreground capitalize">
											{acc.subtitle}
										</span>
									</>
								);
							})()}
						</div>
					</Button>

					{open && (
						<div className="absolute mt-2 w-60 bg-card border border-border rounded-xl shadow-card p-2 z-50">
							{accounts.map((acc) => {
								const isActive = acc.id === activeAccount?.id;

								return (
									<button
										key={acc.id}
										onClick={() => {
											switchAccount(acc.id);
											setOpen(false);
										}}
										className={cn(
											"w-full text-left px-3 py-2 rounded-lg text-sm",
											isActive
												? "bg-accent-soft text-accent font-medium"
												: "hover:bg-muted"
										)}
									>
										<div className="flex flex-col">
											<span className="font-medium">{acc.wsnId}</span>
											<span className="text-xs text-muted-foreground capitalize">
												{acc.accountType}
											</span>
										</div>
									</button>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* RIGHT */}
			<div className="flex items-center gap-3">

				{user?.role && (
					<div className="hidden sm:flex px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold capitalize">
						{user.role}
					</div>
				)}

				<Button variant="ghost" size="sm" className="!p-2">
					<Moon size={18} />
				</Button>

				<Button variant="ghost" size="sm" className="!p-2 relative">
					<Bell size={18} />
					<span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] flex items-center justify-center rounded-full">
						2
					</span>
				</Button>

				<div className="flex items-center gap-2 pl-2 border-l border-border">
					<Avatar
						src={user?.avatar?.url}
						name={`${user?.firstName || ""} ${user?.lastName || ""}`}
						size="md"
					/>
				</div>
			</div>
		</header>
	);
};

export default Topbar;