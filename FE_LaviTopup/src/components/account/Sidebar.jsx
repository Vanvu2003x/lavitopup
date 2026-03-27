"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FiCreditCard,
    FiClock,
    FiHome,
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
        <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/12 p-4 shadow-[0_24px_80px_rgba(3,10,28,0.3)] sm:rounded-[2.2rem]">
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-4 sm:rounded-[1.8rem] sm:p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,#53e5c6_0%,#6ab9ff_100%)] text-2xl font-black text-[#07142d] shadow-[0_16px_30px_rgba(83,229,198,0.18)] sm:h-16 sm:w-16 sm:rounded-[1.6rem]">
                        {String(user?.name || "L").charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#53e5c6]">
                            Tài khoản
                        </p>
                        <p className="mt-1 truncate text-base font-bold text-white sm:text-lg">
                            {user?.name || "LaviTopup"}
                        </p>
                        <p className="truncate text-sm text-[#9fb7da]">
                            {user?.email || "Đăng nhập để đồng bộ dữ liệu"}
                        </p>
                    </div>
                </div>

                <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-[#071529]/70 p-4 sm:rounded-[1.5rem]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">
                                Số dư khả dụng
                            </p>
                            <p className="mt-2 break-words text-lg font-black text-white sm:text-xl">
                                {formatCurrency(user?.balance)}
                            </p>
                        </div>
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#53e5c6]/14 text-[#53e5c6]">
                            <FiHome size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={onNavigate}
                            className={`group flex items-center gap-3 rounded-[1.4rem] border px-4 py-3.5 text-sm font-semibold transition sm:rounded-[1.5rem] ${
                                isActive
                                    ? "border-[#53e5c6]/30 bg-[#53e5c6]/12 text-white shadow-[0_12px_28px_rgba(83,229,198,0.08)]"
                                    : "border-white/8 bg-white/[0.03] text-[#c4d8f7] hover:border-white/14 hover:bg-white/[0.06] hover:text-white"
                            }`}
                        >
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                                    isActive
                                        ? "bg-[#53e5c6] text-[#07142d]"
                                        : "bg-white/[0.05] text-[#8fb5ee] group-hover:text-[#53e5c6]"
                                }`}
                            >
                                <Icon size={18} />
                            </span>
                            <span className="min-w-0 leading-6">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-[1.4rem] border border-[#ff8456]/20 bg-[#ff8456]/10 px-4 py-3.5 text-sm font-semibold text-[#ffb89d] transition hover:border-[#ff8456]/40 hover:bg-[#ff8456]/16 hover:text-white sm:rounded-[1.5rem]"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ff8456]/16 text-[#ff8456]">
                        <FiLogOut size={18} />
                    </span>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}
