"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FiClock,
    FiCreditCard,
    FiLogOut,
    FiShoppingBag,
    FiUser,
} from "react-icons/fi";

import { Logout, getInfo } from "@/services/auth.service";

const menuItems = [
    {
        name: "Thông tin tài khoản",
        icon: FiUser,
        path: "/account",
    },
    {
        name: "Biến động số dư",
        icon: FiClock,
        path: "/account/lich-su",
    },
    {
        name: "Nạp tiền vào ví",
        icon: FiCreditCard,
        path: "/account/nap-tien",
    },
    {
        name: "Lịch sử đơn hàng",
        icon: FiShoppingBag,
        path: "/account/don-hang",
    },
];

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

export default function Sidebar({ onNavigate }) {
    const pathname = usePathname();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getInfo();
                setUser(response?.user || response || null);
            } catch (error) {
                console.error("Không thể tải thông tin tài khoản", error);
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await Logout();
        } catch (error) {
            console.error("Đăng xuất thất bại", error);
        }

        localStorage.removeItem("name");
        localStorage.removeItem("balance");
        onNavigate?.();
        window.location.href = "/";
    };

    return (
        <div className="surface-card overflow-hidden rounded-2xl border border-white/10 p-3 sm:p-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#53e5c6]/20 text-sm font-black text-[#53e5c6]">
                        {String(user?.name || "L").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                            {user?.name || "LaviTopup"}
                        </p>
                        <p className="truncate text-xs text-[#9fb7da]">
                            {user?.email || "Chưa có email"}
                        </p>
                    </div>
                </div>

                <div className="mt-3 rounded-lg border border-white/10 bg-[#071529]/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                        Số dư khả dụng
                    </p>
                    <p className="mt-1 break-words text-base font-bold text-white">
                        {formatCurrency(user?.balance)}
                    </p>
                </div>
            </div>

            <div className="mt-3 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={onNavigate}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                                isActive
                                    ? "border-[#53e5c6]/30 bg-[#53e5c6]/10 text-white"
                                    : "border-white/10 bg-white/[0.02] text-[#c4d8f7] hover:bg-white/[0.05] hover:text-white"
                            }`}
                        >
                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    isActive
                                        ? "bg-[#53e5c6] text-[#07142d]"
                                        : "bg-white/[0.06] text-[#8fb5ee]"
                                }`}
                            >
                                <Icon size={16} />
                            </span>
                            <span className="min-w-0 truncate">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-3 border-t border-white/10 pt-3">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl border border-[#ff8456]/20 bg-[#ff8456]/10 px-3 py-2.5 text-sm text-[#ffb89d] transition hover:border-[#ff8456]/40 hover:text-white"
                >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff8456]/20 text-[#ff8456]">
                        <FiLogOut size={16} />
                    </span>
                    <span>Đăng xuất</span>
                </button>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] text-[#8fb5ee]">
                <FiCreditCard size={14} />
                <span>Tài khoản được đồng bộ theo thời gian thực.</span>
            </div>
        </div>
    );
}
