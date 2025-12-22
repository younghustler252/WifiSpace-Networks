import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	const handleToggle = () => {
		if (window.innerWidth < 1024) {
			setMobileOpen(prev => !prev);
		} else {
			setIsCollapsed(prev => !prev);
		}
	};

	// Lock body scroll when mobile sidebar is open
	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		return () => (document.body.style.overflow = "");
	}, [mobileOpen]);

	return (
		<div className="min-h-screen bg-surface text-primary flex overflow-hidden">
			{/* Sidebar */}
			<Sidebar
				mobileOpen={mobileOpen}
				setMobileOpen={setMobileOpen}
				isCollapsed={isCollapsed}
			/>

			{/* Main content */}
			<div
				className={`
          flex-1 flex flex-col transition-all duration-300
          ml-0
          ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
			>
				<Header onToggle={handleToggle} />

				<main className="flex-1 overflow-y-auto p-4 sm:p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default MainLayout;
