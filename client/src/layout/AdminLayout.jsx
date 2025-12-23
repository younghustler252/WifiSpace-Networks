import { useState, useEffect } from "react";
import Sidebar from "./SideBar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleToggle = () => {
        if (window.innerWidth < 1024) {
            setMobileOpen(!mobileOpen); // Mobile behavior
        } else {
            setIsCollapsed(!isCollapsed); // Desktop behavior
        }
    };

    // Prevent scrolling when mobile sidebar is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    }, [mobileOpen]);

    return (
        <div className="h-screen bg-surface text-primary flex">
            {/* Sidebar */}
            <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                isCollapsed={isCollapsed}
            />

            {/* Main Content */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300
          ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
            >
                <Header onToggle={handleToggle} />

                <main className="flex-1 p-6 overflow-auto">
                    {/* Admin pages render here */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
