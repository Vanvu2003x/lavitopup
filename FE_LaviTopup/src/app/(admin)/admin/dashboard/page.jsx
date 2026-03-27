"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowRight,
    BarChart3,
    Gamepad2,
    Package,
    ReceiptText,
    RefreshCw,
    TrendingUp,
    Users,
} from "lucide-react";

import { getGames } from "@/services/games.service";
import { getAllOrder } from "@/services/order.service";
import { getAllUserByKeyword } from "@/services/user.service";
import api from "@/utils/axios";

function formatVND(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount || 0);
}

const moduleCards = [
    {
        title: "Khách hàng",
        description: "Tìm kiếm, phân loại vai trò và điều chỉnh số dư ví nhanh hơn.",
        href: "/admin/danhmuc/UserManagerPage",
        icon: Users,
        accent: "from-sky-400/30 to-cyan-400/10",
    },
    {
        title: "Game",
        description: "Quản lý danh mục game, nhà phát hành và thay đổi cấu hình.",
        href: "/admin/danhmuc/GameManagerPage",
        icon: Gamepad2,
        accent: "from-indigo-400/30 to-blue-400/10",
    },
    {
        title: "Gói nạp",
        description: "Theo dõi giá gốc, lợi nhuận và các gói đang khuyến mãi theo trang.",
        href: "/admin/danhmuc/ToUpPackageManagerPage",
        icon: Package,
        accent: "from-amber-400/30 to-orange-400/10",
    },
    {
        title: "Đơn nạp",
        description: "Xử lý luồng đơn gọn gàng và kiểm soát trạng thái nạp game.",
        href: "/admin/danhmuc/ToUpManagerPage",
        icon: ReceiptText,
        accent: "from-emerald-400/30 to-teal-400/10",
    },
    {
        title: "Doanh thu",
        description: "Xem doanh thu, lợi nhuận và nhóm đóng góp theo chu kỳ.",
        href: "/admin/danhmuc/RevenueManagerPage",
        icon: BarChart3,
        accent: "from-fuchsia-400/30 to-pink-400/10",
    },
];

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        userCount: 0,
        gameCount: 0,
        orderCount: 0,
        pendingOrders: 0,
        todayRevenue: 0,
        monthProfit: 0,
    });

    useEffect(() => {
        let cancelled = false;

        async function loadDashboard() {
            try {
                setLoading(true);

                const [usersRes, gamesRes, ordersRes, revenueRes] = await Promise.all([
                    getAllUserByKeyword("user", ""),
                    getGames(),
                    getAllOrder(1),
                    api.get("/api/statistics/revenue/dashboard"),
                ]);

                if (cancelled) {
                    return;
                }

                setSummary({
                    userCount: usersRes?.users?.length || 0,
                    gameCount: Array.isArray(gamesRes) ? gamesRes.length : 0,
                    orderCount: ordersRes?.total || 0,
                    pendingOrders: ordersRes?.stats?.pending || 0,
                    todayRevenue: revenueRes?.data?.data?.today?.revenue || 0,
                    monthProfit: revenueRes?.data?.data?.this_month?.profit || 0,
                });
            } catch (error) {
                console.error("Dashboard load error:", error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-[1.45rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(8,47,73,0.9)_45%,rgba(30,41,59,0.92))] p-4 shadow-2xl shadow-slate-950/50 sm:p-5">
                <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                            <TrendingUp className="h-4 w-4" />
                            Bảng điều khiển mới
                        </div>

                        <div className="space-y-3">
                            <h2 className="max-w-3xl font-display text-xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                                Khu vực quản trị đã được gom thành từng khối gọn gàng để quản lý nhanh hơn.
                            </h2>
                            <p className="max-w-2xl text-[13px] leading-5 text-slate-300">
                                Từ đây bạn có thể đi vào các khu vực quản lý khách hàng, game, gói nạp, đơn nạp và doanh thu
                                trên một giao diện thống nhất, gọn và dễ rà soát dữ liệu hơn.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/admin/danhmuc/ToUpManagerPage"
                                className="inline-flex items-center gap-2 rounded-[0.95rem] bg-cyan-300 px-3.5 py-2 text-[13px] font-semibold text-slate-950 transition hover:bg-cyan-200"
                            >
                                Xử lý đơn nạp
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/admin/danhmuc/RevenueManagerPage"
                                className="inline-flex items-center gap-2 rounded-[0.95rem] border border-white/10 bg-white/5 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-white/10"
                            >
                                Xem báo cáo doanh thu
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <HeroStat
                            label="Doanh thu hôm nay"
                            value={loading ? "Đang tải..." : formatVND(summary.todayRevenue)}
                            description="Cập nhật từ thống kê doanh thu"
                        />
                        <HeroStat
                            label="Lợi nhuận tháng này"
                            value={loading ? "Đang tải..." : formatVND(summary.monthProfit)}
                            description="Tính theo chu kỳ hiện tại"
                        />
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <OverviewCard
                    label="Khách hàng"
                    value={loading ? "--" : summary.userCount}
                    note="Số tài khoản hiện có"
                    icon={Users}
                />
                <OverviewCard
                    label="Game"
                    value={loading ? "--" : summary.gameCount}
                    note="Tựa game đã cấu hình"
                    icon={Gamepad2}
                />
                <OverviewCard
                    label="Tổng đơn nạp"
                    value={loading ? "--" : summary.orderCount}
                    note="Tổng giao dịch trên hệ thống"
                    icon={ReceiptText}
                />
                <OverviewCard
                    label="Đơn chờ xử lý"
                    value={loading ? "--" : summary.pendingOrders}
                    note="Cần ưu tiên kiểm tra"
                    icon={RefreshCw}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-3.5 shadow-xl shadow-slate-950/30 backdrop-blur-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Khu vực quản lý</p>
                            <h3 className="mt-2 font-display text-lg font-semibold text-white">Đi nhanh vào từng mục</h3>
                        </div>
                        <div className="rounded-[1rem] border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[13px] text-cyan-200">
                            5 mục chính
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {moduleCards.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group overflow-hidden rounded-[1.15rem] border border-white/10 bg-slate-950/40 p-3.5 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-slate-950/55"
                                >
                                    <div className={`mb-3 inline-flex rounded-[1rem] border border-white/10 bg-gradient-to-br ${item.accent} p-2.5 text-white`}>
                                        <Icon className="h-4.5 w-4.5" />
                                    </div>
                                    <h4 className="font-display text-base font-semibold text-white">{item.title}</h4>
                                    <p className="mt-2 text-[13px] leading-5 text-slate-400">{item.description}</p>
                                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                                        Mở mục này
                                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-3.5 shadow-xl shadow-slate-950/30 backdrop-blur-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Điểm mới</p>
                        <h3 className="mt-2 font-display text-lg font-semibold text-white">Phân trang rõ ràng</h3>
                        <p className="mt-3 text-[13px] leading-5 text-slate-400">
                            Các danh sách quản trị đã dùng chung một kiểu phân trang, có tổng số bản ghi và nút Trước / Sau rõ ràng hơn.
                        </p>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,116,144,0.22),rgba(15,23,42,0.94))] p-3.5 shadow-xl shadow-slate-950/30">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Ưu tiên hôm nay</p>
                        <div className="mt-4 space-y-3">
                            <PriorityItem
                                title="Kiểm tra đơn đang chờ"
                                description="Mở trang Đơn nạp để xử lý các giao dịch chưa hoàn tất."
                            />
                            <PriorityItem
                                title="Cập nhật bảng giá gói nạp"
                                description="Rà soát gói khuyến mãi và biên lợi nhuận trên từng game."
                            />
                            <PriorityItem
                                title="Theo dõi top đóng góp"
                                description="Xem báo cáo doanh thu và nhóm khách hàng nổi bật mới nhất."
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function HeroStat({ label, value, description }) {
    return (
        <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4 shadow-lg shadow-slate-950/30 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
            <p className="mt-3 font-display text-2xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-[13px] text-slate-400">{description}</p>
        </div>
    );
}

function OverviewCard({ label, value, note, icon: Icon }) {
    return (
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 shadow-lg shadow-slate-950/20 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/[0.07]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[13px] text-slate-400">{label}</p>
                    <p className="mt-3 font-display text-2xl font-semibold text-white">{value}</p>
                    <p className="mt-2 text-[13px] text-slate-500">{note}</p>
                </div>
                <div className="rounded-[1rem] border border-cyan-300/20 bg-cyan-400/10 p-2.5 text-cyan-200">
                    <Icon className="h-4.5 w-4.5" />
                </div>
            </div>
        </div>
    );
}

function PriorityItem({ title, description }) {
    return (
        <div className="rounded-[1rem] border border-white/10 bg-slate-950/35 p-3.5">
            <p className="font-medium text-white">{title}</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-400">{description}</p>
        </div>
    );
}
