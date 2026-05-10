"use client";

import { useState, useCallback } from "react";
import Navbar from "./Navbar";
import NavDrawer from "../components/Navdrawer";
import Sidebar from "./Sidebar";
import SidebarToggle from "../components/Sidebartoggle";
import { usePathname } from "next/navigation";

interface AppShellProps {
    children: React.ReactNode;
    /**
     * Kalau true, area konten tidak punya padding dan overflow:hidden
     * cocok untuk halaman peta yang butuh full-bleed.
     * Default: false, ada padding, cocok untuk halaman tabel/form.
     */
    fullBleed?: boolean;
}

export default function AppShell({ children, fullBleed }: AppShellProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const openDrawer = useCallback(() => setDrawerOpen(true), []);
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    const pathname = usePathname();

    const hideSidebar =
        pathname.startsWith("/manajemen_reklame") ||
        pathname.startsWith("/infografis");

    const toggleSidebar = useCallback(() => {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            setMobileSidebarOpen((prev) => !prev);
        } else {
            setSidebarCollapsed((prev) => !prev);
        }
    }, []);

    const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

    return (
        <>
            <Navbar onDrawerOpen={openDrawer} />
            <NavDrawer isOpen={drawerOpen} onClose={closeDrawer} />

            {!hideSidebar && (
                <SidebarToggle
                    sidebarCollapsed={sidebarCollapsed}
                    mobileSidebarOpen={mobileSidebarOpen}
                    onToggle={toggleSidebar}
                />
            )}

            <div className={hideSidebar ? "layout layout--no-sidebar" : "layout"}>
                {!hideSidebar && (
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        mobileOpen={mobileSidebarOpen}
                        onMobileClose={closeMobileSidebar}
                    />
                )}

                <div className={fullBleed ? "page-content--fullbleed" : "page-content"}>
                    {children}
                </div>
            </div>
        </>
    );
}