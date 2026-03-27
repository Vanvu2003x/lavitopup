"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FiArrowRight,
    FiCalendar,
    FiCreditCard,
    FiMail,
    FiShield,
    FiShoppingBag,
    FiTrendingDown,
    FiTrendingUp,
    FiUser,
} from "react-icons/fi";

import { getInfo } from "@/services/auth.service";
import { getFinancialSummary } from "@/services/user.service";

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

function LoadingCard() {
    return (
        <div className="surface-card h-40 animate-pulse rounded-[2rem] border border-white/10" />
    );
}

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [financials, setFinancials] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getInfo();
                setUser(response?.user || response || null);

                const financialData = await getFinancialSummary();
                setFinancials(financialData || null);
            } catch (error) {
                console.error("Không thể tải dữ liệu tài khoản", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-5 sm:space-y-6">
                <LoadingCard />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[...Array(4)].map((_, index) => (
                        <LoadingCard key={index} />
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="surface-card rounded-[2.2rem] p-6 text-center sm:p-8">
                <p className="text-2xl font-bold text-white sm:text-3xl">
                    Không tải được thông tin tài khoản
                </p>
                <p className="mt-3 text-sm leading-7 text-[#a8c0e4]">
                    Vui lòng đăng nhập lại để tiếp tục quản lý ví và đơn hàng của bạn.
                </p>
                <Link
                    href="/auth/login"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#53e5c6] px-5 py-3 text-sm font-bold text-[#07142d] transition hover:bg-[#6ff0d5]"
                >
                    Đi tới đăng nhập
                    <FiArrowRight size={16} />
                </Link>
            </div>
        );
    }

    const roleLabel =
        String(user.role || "").toLowerCase() === "admin"
            ? "Quản trị viên"
            : "Thành viên";
    const joinedAt = user.createdAt || user.created_at;

    const infoItems = [
        {
            label: "Họ và tên",
            value: user.name || "Chưa cập nhật",
            icon: FiUser,
        },
        {
            label: "Email",
            value: user.email || "Chưa cập nhật",
            icon: FiMail,
        },
        {
            label: "Vai trò",
            value: roleLabel,
            icon: FiShield,
        },
        {
            label: "Ngày tham gia",
            value: joinedAt
                ? new Date(joinedAt).toLocaleDateString("vi-VN")
                : "Chưa có dữ liệu",
            icon: FiCalendar,
        },
    ];

    const summaryCards = [
        {
            label: "Tổng tiền nạp",
            value: financials?.tong_nap,
            icon: FiTrendingUp,
            accent: "text-[#53e5c6]",
            bg: "bg-[#53e5c6]/12",
        },
        {
            label: "Đã chi tiêu",
            value: financials?.tong_tieu,
            icon: FiTrendingDown,
            accent: "text-[#ff8456]",
            bg: "bg-[#ff8456]/12",
        },
        {
            label: "Nạp tháng này",
            value: financials?.tong_nap_thang,
            icon: FiCreditCard,
            accent: "text-[#6ab9ff]",
            bg: "bg-[#6ab9ff]/12",
        },
        {
            label: "Chi tiêu tháng này",
            value: financials?.tong_tieu_thang,
            icon: FiShoppingBag,
            accent: "text-[#f6c15b]",
            bg: "bg-[#f6c15b]/12",
        },
    ];

    return (
        <div className="space-y-5 sm:space-y-6">
            <section className="surface-card overflow-hidden rounded-[2.2rem] p-5 sm:rounded-[2.6rem] sm:p-8">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:gap-6">
                    <div className="space-y-5 sm:space-y-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#53e5c6]">
                                Tổng quan tài khoản
                            </p>
                            <h1 className="mt-3 font-sans text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
                                Xin chào, {user.name || "bạn"}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#a8c0e4]">
                                Quản lý ví, theo dõi lịch sử giao dịch và kiểm tra các đơn nạp game
                                trong cùng một giao diện đồng bộ với trang chủ.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:flex sm:flex-wrap">
                            <Link
                                href="/account/nap-tien"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff8456] px-5 py-3 text-sm font-bold text-[#08111f] transition hover:bg-[#ff976f] sm:w-auto"
                            >
                                Nạp tiền ngay
                                <FiArrowRight size={16} />
                            </Link>
                            <Link
                                href="/account/don-hang"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] sm:w-auto"
                            >
                                Xem đơn hàng
                                <FiShoppingBag size={16} />
                            </Link>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                            {infoItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.label}
                                        className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 sm:rounded-[1.8rem]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-[#53e5c6]">
                                                <Icon size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">
                                                    {item.label}
                                                </p>
                                                <p className="mt-2 break-words text-sm font-semibold leading-6 text-white">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-panel rounded-[2rem] p-5 sm:rounded-[2.2rem] sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#53e5c6]">
                            Số dư hiện tại
                        </p>
                        <p className="mt-4 break-words text-3xl font-black text-white sm:text-5xl">
                            {formatCurrency(user.balance)}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#a8c0e4]">
                            Sử dụng số dư để tạo đơn nạp game nhanh hơn và theo dõi giao dịch rõ ràng
                            ngay trong tài khoản.
                        </p>

                        <div className="mt-6 grid gap-3">
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 sm:rounded-[1.6rem]">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">
                                    Tình trạng tài khoản
                                </p>
                                <p className="mt-2 text-lg font-bold text-white">Đang hoạt động</p>
                            </div>
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 sm:rounded-[1.6rem]">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">
                                    Đi nhanh
                                </p>
                                <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                                    <Link
                                        href="/account/lich-su"
                                        className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-white transition hover:border-[#53e5c6]/30 hover:text-[#53e5c6]"
                                    >
                                        Biến động số dư
                                    </Link>
                                    <Link
                                        href="/account/nap-tien"
                                        className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-white transition hover:border-[#53e5c6]/30 hover:text-[#53e5c6]"
                                    >
                                        Lịch sử nạp tiền
                                    </Link>
                                    <Link
                                        href="/account/don-hang"
                                        className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-white transition hover:border-[#53e5c6]/30 hover:text-[#53e5c6]"
                                    >
                                        Lịch sử đơn hàng
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div key={item.label} className="surface-card rounded-[1.8rem] p-5 sm:rounded-[2rem]">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">
                                        {item.label}
                                    </p>
                                    <p className="mt-3 break-words text-2xl font-black text-white">
                                        {formatCurrency(item.value)}
                                    </p>
                                </div>
                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.bg} ${item.accent}`}
                                >
                                    <Icon size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
