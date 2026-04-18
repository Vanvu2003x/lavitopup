"use client";

import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

import Sidebar from "@/components/account/Sidebar";

export default function AccountLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <section className="min-h-screen px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
            <div className="mx-auto max-w-[1220px]">
                <div className="surface-card mb-4 rounded-2xl p-3 lg:hidden">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53e5c6]">
                                Khu tài khoản
                            </p>
                            <p className="mt-1 text-xs text-[#a8c0e4]">
                                Quản lý số dư và đơn hàng.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen((value) => !value)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
                            aria-label={
                                isSidebarOpen ? "Đóng menu tài khoản" : "Mở menu tài khoản"
                            }
                        >
                            {isSidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                        </button>
                    </div>
                </div>

                <div
                    className={`fixed inset-0 z-[65] lg:hidden ${
                        isSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
                    }`}
                >
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`absolute inset-0 bg-[#020817]/70 backdrop-blur-sm transition ${
                            isSidebarOpen ? "opacity-100" : "opacity-0"
                        }`}
                        aria-label="Đóng menu tài khoản"
                    />

                    <div
                        className={`absolute left-3 right-3 top-16 max-h-[calc(100vh-5rem)] overflow-y-auto transition-all duration-200 sm:left-4 sm:right-4 sm:top-20 ${
                            isSidebarOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
                        }`}
                    >
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(false)}
                                className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-[#071529]/90 text-white transition hover:bg-[#0c1d38]"
                                aria-label="Đóng khu tài khoản"
                            >
                                <FiX size={16} />
                            </button>
                            <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-5">
                    <aside className="hidden lg:block">
                        <div className="sticky top-24">
                            <Sidebar />
                        </div>
                    </aside>

                    <main className="min-w-0">{children}</main>
                </div>
            </div>
        </section>
    );
}
