"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Bell, Moon, Menu } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { cn } from "@/lib/cn";

const Topbar = ({ onToggleSidebar }: { onToggleSidebar?: () => void }) => {
	const { user, accounts = [], activeAccount, switchAccount, loading } = useAuth();
	const [open, setOpen] = useState(false);
	
	// Ref used to track the dropdown container area
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Effect hook: Closes dropdown if a click lands outside the element
	useEffect(() => {
		if (!open) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [open]);

	// Effect hook: Closes dropdown instantly if escape key is hit
	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	// Prevent component crash if accounts is undefined or empty
	const accountList = accounts || [];

	const getAccountLabel = (acc: any) => {
		if (!acc) return { title: "No Account", subtitle: "Select session" };
		return {
			title: acc.wsnId || "WSN Account",
			subtitle: acc.accountType || "Personal",
		};
	};

	return (
		<header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border">

			{/* LEFT */}
			<div className="flex items-center gap-3">

				{/* MOBILE MENU */}
				<button
					onClick={onToggleSidebar}
					className="md:hidden p-2 rounded-lg hover:bg-muted"
				>
					<Menu size={20} />
				</button>

				{/* ACCOUNT SWITCH DROPDOWN CONTAINER */}
				<div className="relative" ref={dropdownRef}>
					<Button
						variant="outline"
						size="sm"
						disabled={loading || accountList.length === 0}
						className={cn("flex items-center gap-2 !h-10 transition-all", open && "border-primary bg-muted/30")}
						onClick={() => setOpen(!open)}
						rightIcon={
							<ChevronDown 
								size={14} 
								className={cn("transition-transform duration-200", open && "rotate-180")} 
							/>
						}
					>
						<div className="flex flex-col items-start leading-tight">
							{loading ? (
								<div className="w-24 h-4 bg-muted animate-pulse rounded" />
							) : (
								(() => {
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
								})()
							)}
						</div>
					</Button>

					{open && accountList.length > 0 && (
						<div className="absolute left-0 mt-2 w-60 bg-card border border-border rounded-xl shadow-card p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
							{accountList.map((acc) => {
								const isActive = acc.id === activeAccount?.id;

								return (
									<button
										key={acc.id}
										onClick={() => {
											if (!isActive) switchAccount(acc.id);
											setOpen(false); // Closes menu when action is completed
										}}
										className={cn(
											"w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 last:mb-0",
											isActive
												? "bg-accent-soft text-accent font-semibold"
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
				{loading ? (
					<div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
				) : (
					<>
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
					</>
				)}
			</div>
		</header>
	);
};

export default Topbar;
