"use client";

import { useCallback, useEffect, useState } from "react";
import { FiActivity, FiCreditCard, FiRefreshCw, FiTrendingUp, FiUsers } from "react-icons/fi";

import Pagination from "@/components/common/Pagination";
import api from "@/utils/axios";

const PAGE_SIZE = 5;

function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(toNumber(value));
}

function formatCompact(value) {
    const amount = toNumber(value);
    if (Math.abs(amount) >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
    if (Math.abs(amount) >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return new Intl.NumberFormat("vi-VN").format(amount);
}

function formatDayMonth(value) {
    if (!value) return "--/--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--/--";
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

function formatFullDate(value) {
    if (!value) return "Khong ro ngay";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Khong ro ngay";
    return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function RevenueManagerPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get("/api/statistics/revenue/dashboard");
            if (res.data?.status) {
                setStats(res.data.data || null);
                return;
            }
            setError("Khong the tai du lieu doanh thu.");
        } catch (fetchError) {
            console.error("Error fetching revenue dashboard:", fetchError);
            setError("Khong the tai du lieu doanh thu.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading && !stats) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Bao cao doanh thu</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Tong quan doanh thu, chi phi, loi nhuan va khach hang noi bat.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={fetchStats}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <FiRefreshCw size={14} />
                        Tai lai
                    </button>
                </div>
                {error ? (
                    <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>
                ) : null}
            </section>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <OverviewCard icon={FiTrendingUp} label="Tong doanh thu" value={formatCurrency(stats?.total?.revenue)} />
                <OverviewCard icon={FiCreditCard} label="Tong chi phi" value={formatCurrency(stats?.total?.spending)} />
                <OverviewCard icon={FiActivity} label="Tong loi nhuan" value={formatCurrency(stats?.total?.profit)} />
                <OverviewCard icon={FiUsers} label="So du khach hang" value={formatCurrency(stats?.total_user_balance)} />
            </section>

            <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <PeriodCard title="Hom nay" revenue={stats?.today?.revenue} spending={stats?.today?.spending} profit={stats?.today?.profit} />
                <PeriodCard title="Tuan nay" revenue={stats?.this_week?.revenue} spending={stats?.this_week?.spending} profit={stats?.this_week?.profit} />
                <PeriodCard
                    title="Thang nay"
                    revenue={stats?.this_month?.revenue}
                    spending={stats?.this_month?.spending}
                    profit={stats?.this_month?.profit}
                />
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Bieu do 30 ngay gan nhat</h2>
                <p className="mt-1 text-xs text-slate-500">Bam vao tung cot de xem chi tiet ngay.</p>
                <div className="mt-4">
                    <RevenueChart data={stats?.chart || []} />
                </div>
            </section>

            <TopCustomersTable />
        </div>
    );
}

function OverviewCard({ icon: Icon, label, value }) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
                <Icon size={16} />
                <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
        </article>
    );
}

function PeriodCard({ title, revenue, spending, profit }) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Doanh thu</span>
                    <span className="font-semibold text-emerald-600">{formatCompact(revenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chi phi</span>
                    <span className="font-semibold text-sky-600">{formatCompact(spending)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
                    <span className="font-medium text-slate-700">Loi nhuan</span>
                    <span className={`font-bold ${toNumber(profit) >= 0 ? "text-violet-600" : "text-rose-600"}`}>
                        {toNumber(profit) > 0 ? "+" : ""}
                        {formatCompact(profit)}
                    </span>
                </div>
            </div>
        </article>
    );
}

function RevenueChart({ data = [] }) {
    const sortedData = [...data].sort((a, b) => new Date(a?.date || 0) - new Date(b?.date || 0));
    const [selectedIndex, setSelectedIndex] = useState(-1);

    useEffect(() => {
        if (sortedData.length > 0) {
            setSelectedIndex(sortedData.length - 1);
            return;
        }
        setSelectedIndex(-1);
    }, [sortedData.length]);

    if (sortedData.length === 0) {
        return <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">Chua co du lieu thong ke.</p>;
    }

    const safeIndex = selectedIndex >= 0 && selectedIndex < sortedData.length ? selectedIndex : sortedData.length - 1;
    const selectedData = sortedData[safeIndex];
    const maxValue = Math.max(
        ...sortedData.flatMap((item) => [toNumber(item?.revenue), toNumber(item?.spending), Math.abs(toNumber(item?.profit))]),
        1
    );

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatFullDate(selectedData?.date)}</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <p className="rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                        Doanh thu: <span className="font-bold text-emerald-600">{formatCurrency(selectedData?.revenue)}</span>
                    </p>
                    <p className="rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                        Chi phi: <span className="font-bold text-sky-600">{formatCurrency(selectedData?.spending)}</span>
                    </p>
                    <p className="rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                        Loi nhuan:{" "}
                        <span className={`font-bold ${toNumber(selectedData?.profit) >= 0 ? "text-violet-600" : "text-rose-600"}`}>
                            {formatCurrency(selectedData?.profit)}
                        </span>
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="flex min-w-[620px] items-end gap-2 rounded-lg border border-slate-200 px-3 py-3">
                    {sortedData.map((item, index) => {
                        const revenueHeight = (toNumber(item?.revenue) / maxValue) * 100;
                        const spendingHeight = (toNumber(item?.spending) / maxValue) * 100;
                        const profitHeight = (Math.abs(toNumber(item?.profit)) / maxValue) * 100;
                        const isActive = index === safeIndex;

                        return (
                            <button
                                key={`${item?.date || "date"}-${index}`}
                                type="button"
                                onClick={() => setSelectedIndex(index)}
                                className={`flex flex-1 min-w-[20px] flex-col items-center gap-1 rounded px-1 py-1 transition ${
                                    isActive ? "bg-slate-100" : "hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex h-28 items-end gap-[2px]">
                                    <span className="w-1.5 rounded-t bg-emerald-500" style={{ height: `${Math.max(revenueHeight, 4)}%` }} />
                                    <span className="w-1.5 rounded-t bg-sky-500" style={{ height: `${Math.max(spendingHeight, 4)}%` }} />
                                    <span
                                        className={`w-1.5 rounded-t ${toNumber(item?.profit) >= 0 ? "bg-violet-500" : "bg-rose-500"}`}
                                        style={{ height: `${Math.max(profitHeight, 4)}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-medium text-slate-500">{formatDayMonth(item?.date)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function TopCustomersTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchTopUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get("/api/statistics/revenue/top-sources");
            if (res.data?.status) {
                setUsers(Array.isArray(res.data.data) ? res.data.data : []);
                return;
            }
            setError("Khong the tai danh sach khach hang.");
        } catch (fetchError) {
            console.error("Error fetching top users:", fetchError);
            setError("Khong the tai danh sach khach hang.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopUsers();
    }, [fetchTopUsers]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, users.length]);

    const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
    const pagedUsers = users.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-slate-900">Khach hang noi bat</h2>
                    <p className="mt-1 text-xs text-slate-500">Top tai khoan dong gop doanh thu cao.</p>
                </div>
                <button
                    type="button"
                    onClick={fetchTopUsers}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <FiRefreshCw size={13} />
                    Tai lai
                </button>
            </div>

            {loading ? (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">Dang tai danh sach khach hang...</p>
            ) : null}

            {!loading && error ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-4 text-sm text-rose-600">{error}</p>
            ) : null}

            {!loading && !error && pagedUsers.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">Chua co du lieu khach hang.</p>
            ) : null}

            {!loading && !error && pagedUsers.length > 0 ? (
                <>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Khach hang</th>
                                    <th className="px-4 py-3">So don</th>
                                    <th className="px-4 py-3">Tong chi tieu</th>
                                    <th className="px-4 py-3">Loi nhuan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {pagedUsers.map((user, index) => {
                                    const rank = (currentPage - 1) * PAGE_SIZE + index + 1;

                                    return (
                                        <tr key={`${user?.email || "user"}-${rank}`} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-semibold text-slate-500">{rank}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-900">{user?.username || "An danh"}</p>
                                                <p className="text-xs text-slate-500">{user?.email || "Khong co email"}</p>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-700">{toNumber(user?.total_orders)}</td>
                                            <td className="px-4 py-3 font-semibold text-emerald-600">{formatCurrency(user?.total_spent)}</td>
                                            <td className={`px-4 py-3 font-semibold ${toNumber(user?.total_profit) >= 0 ? "text-violet-600" : "text-rose-600"}`}>
                                                {formatCurrency(user?.total_profit)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 ? (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <Pagination
                                currentPage={currentPage}
                                totalPage={totalPages}
                                totalItems={users.length}
                                pageSize={PAGE_SIZE}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    ) : null}
                </>
            ) : null}
        </section>
    );
}
