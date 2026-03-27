"use client";

import { useState } from "react";

import AdminHeader from "@/components/admin/header";
import AdminSidebar from "@/components/admin/Sidebar";

export default function AdminShell({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.12),transparent_22%),linear-gradient(180deg,#020617_0%,#081224_48%,#030712_100%)]" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.14]" />

            <div className="relative">
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {isSidebarOpen ? (
                    <button
                        aria-label="Dong menu"
                        className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
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
        </div>
    );
}
