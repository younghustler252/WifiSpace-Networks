"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

interface AppShellProps {
	children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const pathname = usePathname();

	return (
		<div className="flex h-screen bg-background text-foreground">

			{/* SIDEBAR */}
			<Sidebar
				currentPath={pathname}
				mobileOpen={mobileSidebarOpen}
				setMobileOpen={setMobileSidebarOpen}
			/>

			{/* MAIN */}
			<div className="flex-1 flex flex-col overflow-hidden">

				{/* TOPBAR */}
				<Topbar
					onToggleSidebar={() =>
						setMobileSidebarOpen((prev) => !prev)
					}
				/>

				{/* CONTENT */}
				<main className="flex-1 overflow-auto p-6">
					{children}
				</main>

			</div>

		</div>
	);
};

export default AppShell;