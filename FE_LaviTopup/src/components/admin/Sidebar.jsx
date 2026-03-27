"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    BarChart3,
    CreditCard,
    Gamepad2,
    LayoutDashboard,
    LogOut,
    Package,
    ReceiptText,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";

import { Logout } from "@/services/auth.service";

const mainItems = [
    {
        label: "Tổng quan",
        description: "Theo dõi sức khỏe hệ thống",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Khách hàng",
        description: "Quản lý tài khoản và số dư",
        href: "/admin/danhmuc/UserManagerPage",
        icon: Users,
    },
    {
        label: "Game",
        description: "Danh mục game đang bán",
        href: "/admin/danhmuc/GameManagerPage",
        icon: Gamepad2,
    },
    {
        label: "Gói nạp",
        description: "Giá bán và trạng thái gói",
        href: "/admin/danhmuc/ToUpPackageManagerPage",
        icon: Package,
    },
    {
        label: "Đơn nạp",
        description: "Kiểm soát giao dịch nạp game",
        href: "/admin/danhmuc/ToUpManagerPage",
        icon: ReceiptText,
    },
    {
        label: "Quản lý ví",
        description: "Theo dõi giao dịch nạp ví",
        href: "/admin/danhmuc/WalletManagerPage",
        icon: CreditCard,
    },
    {
        label: "Doanh thu",
        description: "Báo cáo và top khách hàng",
        href: "/admin/danhmuc/RevenueManagerPage",
        icon: BarChart3,
    },
];

export default function AdminSidebar({ isOpen, onClose }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        if (loggingOut) {
            return;
        }

        setLoggingOut(true);

        try {
            await Logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("name");
            localStorage.removeItem("balance");
            router.push("/");
        }
    }

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-slate-950/90 shadow-2xl shadow-slate-950/60 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={onClose}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-[linear-gradient(135deg,#22d3ee_0%,#3b82f6_52%,#f97316_100%)] shadow-lg shadow-cyan-950/50">
                        <ShieldCheck className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                        <p className="font-display text-base font-semibold text-white">Lavi Admin</p>
                        <p className="text-[10px] uppercase tracking-[0.26em] text-cyan-200/80">Trung tâm quản trị</p>
                    </div>
                </Link>

                <button
                    aria-label="Đóng menu"
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 md:hidden"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                    Quản trị chính
                </div>

                <div className="space-y-2">
                    {mainItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`group flex items-center gap-3 rounded-[1.15rem] border px-3.5 py-2.5 transition-all ${
                                    isActive
                                        ? "border-cyan-400/30 bg-cyan-400/10 shadow-lg shadow-cyan-950/25"
                                        : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/5"
                                }`}
                            >
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-[1rem] transition ${
                                        isActive
                                            ? "bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(59,130,246,0.14))] text-cyan-200"
                                            : "bg-white/5 text-slate-400 group-hover:text-slate-100"
                                    }`}
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`truncate text-sm font-medium ${isActive ? "text-white" : "text-slate-200"}`}>{item.label}</p>
                                    <p className="truncate text-[11px] text-slate-400">{item.description}</p>
                                </div>
                                <span
                                    className={`h-2 w-2 rounded-full transition ${
                                        isActive ? "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.7)]" : "bg-transparent"
                                    }`}
                                />
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="border-t border-white/10 px-3 py-3">
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-[1.1rem] border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <LogOut className="h-4 w-4" />
                    <span>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                </button>
            </div>
        </aside>
    );
}
