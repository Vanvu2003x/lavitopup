"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, Gamepad2, Package, ReceiptText, Users, Wallet } from "lucide-react";

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

const quickLinks = [
    { title: "Khách hàng", href: "/admin/danhmuc/UserManagerPage", icon: Users },
    { title: "Game", href: "/admin/danhmuc/GameManagerPage", icon: Gamepad2 },
    { title: "Gói nạp", href: "/admin/danhmuc/ToUpPackageManagerPage", icon: Package },
    { title: "Đơn nạp", href: "/admin/danhmuc/ToUpManagerPage", icon: ReceiptText },
    { title: "Nạp ví", href: "/admin/danhmuc/WalletManagerPage", icon: Wallet },
    { title: "Doanh thu", href: "/admin/danhmuc/RevenueManagerPage", icon: BarChart3 },
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

                if (cancelled) return;

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
                if (!cancelled) setLoading(false);
            }
        }

        loadDashboard();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="space-y-4">
            <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <h2 className="text-xl font-semibold text-white">Tổng quan nhanh</h2>
                <p className="mt-1 text-sm text-slate-400">Chỉ giữ các chỉ số vận hành quan trọng.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <StatItem label="Khách hàng" value={loading ? "--" : summary.userCount} />
                    <StatItem label="Game" value={loading ? "--" : summary.gameCount} />
                    <StatItem label="Tổng đơn nạp" value={loading ? "--" : summary.orderCount} />
                    <StatItem label="Đơn chờ xử lý" value={loading ? "--" : summary.pendingOrders} />
                    <StatItem label="Doanh thu hôm nay" value={loading ? "Đang tải..." : formatVND(summary.todayRevenue)} />
                    <StatItem label="Lợi nhuận tháng này" value={loading ? "Đang tải..." : formatVND(summary.monthProfit)} />
                </div>
            </section>

            <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <h3 className="text-lg font-semibold text-white">Đi nhanh chức năng</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {quickLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3.5 py-3 text-sm font-medium text-white transition hover:border-cyan-300/30 hover:bg-slate-900/60"
                            >
                                <Icon className="h-4 w-4 text-cyan-200" />
                                {item.title}
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

function StatItem({ label, value }) {
    return (
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3.5">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{value}</p>
        </div>
    );
}
