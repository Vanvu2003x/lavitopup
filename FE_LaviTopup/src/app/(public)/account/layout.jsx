"use client";

import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

import Sidebar from "@/components/account/Sidebar";

export default function AccountLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <section className="relative min-h-screen overflow-hidden px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-[-12rem] top-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[#53e5c6]/10 blur-[120px]" />
                <div className="absolute right-[-12rem] top-[12rem] h-[26rem] w-[26rem] rounded-full bg-[#ff8456]/12 blur-[130px]" />
                <div className="absolute bottom-[-10rem] left-[10%] h-[22rem] w-[22rem] rounded-full bg-[#6ab9ff]/10 blur-[110px]" />
            </div>

            <div className="mx-auto max-w-[1360px]">
                <div className="surface-card mb-5 rounded-[1.8rem] p-4 lg:hidden">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#53e5c6]">
                                Khu tài khoản
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#a8c0e4]">
                                Quản lý số dư, lịch sử giao dịch và đơn hàng của bạn.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen((value) => !value)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
                            aria-label={
                                isSidebarOpen ? "Đóng menu tài khoản" : "Mở menu tài khoản"
                            }
                        >
                            {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
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
                        className={`absolute left-3 right-3 top-20 max-h-[calc(100vh-6rem)] overflow-y-auto transition-all duration-300 sm:left-4 sm:right-4 sm:top-24 ${
                            isSidebarOpen
                                ? "translate-y-0 opacity-100"
                                : "-translate-y-6 opacity-0"
                        }`}
                    >
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(false)}
                                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-[#071529]/90 text-white transition hover:bg-[#0c1d38]"
                                aria-label="Đóng khu tài khoản"
                            >
                                <FiX size={18} />
                            </button>
                            <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-28">
                            <Sidebar />
                        </div>
                    </aside>

                    <main className="min-w-0">{children}</main>
                </div>
            </div>
        </section>
    );
}
