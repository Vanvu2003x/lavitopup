"use client";

import { useState } from "react";

import AdminHeader from "@/components/admin/header";
import AdminSidebar from "@/components/admin/Sidebar";

export default function AdminShell({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {isSidebarOpen ? (
                <button
                    aria-label="Dong menu"
                    className="fixed inset-0 z-40 bg-slate-950/70 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            ) : null}

            <div className="md:pl-64">
                <AdminHeader onMenuToggle={() => setIsSidebarOpen((value) => !value)} />

                <main className="px-4 pb-6 pt-5 sm:px-5 lg:px-6 lg:pb-8">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
