"use client";

import { useEffect, useState } from "react";
import {
    FiCheckCircle,
    FiClock,
    FiCreditCard,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

import Pagination from "@/components/common/Pagination";
import { getListLogs, manualChargeBalance } from "@/services/toup-wallet-logs.service";

const AUTO_REFRESH_MS = 10000;

const FILTERS = [
    { id: "all", label: "Tất cả", icon: FiCreditCard, tone: "text-slate-100" },
    { id: "pending", label: "Đang chờ", icon: FiClock, tone: "text-amber-200" },
    { id: "success", label: "Thành công", icon: FiCheckCircle, tone: "text-emerald-200" },
    { id: "failed", label: "Thất bại", icon: FiXCircle, tone: "text-rose-200" },
    { id: "cancelled", label: "Đã hủy", icon: FiShield, tone: "text-fuchsia-200" },
];

const STATUS_OPTIONS = ["Đang Chờ", "Thành Công", "Thất Bại", "Đã Hủy"];

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(value || 0));

const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN");
};

const getStatusClass = (status) => {
    switch (status) {
        case "Thành Công":
            return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
        case "Đang Chờ":
        case "pending":
        case "wait":
            return "border-amber-300/35 bg-amber-400/10 text-amber-100";
        case "Thất Bại":
            return "border-rose-300/35 bg-rose-400/10 text-rose-100";
        case "Đã Hủy":
            return "border-slate-300/25 bg-slate-400/10 text-slate-100";
        default:
            return "border-slate-300/25 bg-slate-400/10 text-slate-100";
    }
};

export default function WalletManagerPage() {
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [pagination, setPagination] = useState({
        totalItem: 0,
        totalPages: 1,
        pageSize: 10,
    });
    const [summary, setSummary] = useState({
        all: 0,
        pending: 0,
        success: 0,
        failed: 0,
        cancelled: 0,
    });

    const fetchSummary = async () => {
        const [allData, pendingData, successData, failedData, cancelledData] = await Promise.all([
            getListLogs(1, "", "all"),
            getListLogs(1, "", "pending"),
            getListLogs(1, "", "success"),
            getListLogs(1, "", "failed"),
            getListLogs(1, "", "cancelled"),
        ]);

        setSummary({
            all: Number(allData?.totalItem || 0),
            pending: Number(pendingData?.totalItem || 0),
            success: Number(successData?.totalItem || 0),
            failed: Number(failedData?.totalItem || 0),
            cancelled: Number(cancelledData?.totalItem || 0),
        });
    };

    const fetchTransactions = async ({ silent = false } = {}) => {
        if (silent) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const data = await getListLogs(currentPage, searchTerm, activeFilter);
            setTransactions(Array.isArray(data?.data) ? data.data : []);
            setPagination({
                totalItem: Number(data?.totalItem || 0),
                totalPages: Number(data?.totalPages || 1),
                pageSize: Number(data?.pageSize || 10),
            });
        } catch (error) {
            console.error("Lỗi lấy danh sách nạp ví:", error);
            toast.error("Không thể tải danh sách giao dịch nạp ví.");
            setTransactions([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, searchTerm, activeFilter]);

    useEffect(() => {
        fetchSummary().catch((error) => {
            console.error("Lỗi lấy thống kê nạp ví:", error);
        });
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchTransactions({ silent: true });
            fetchSummary().catch((error) => {
                console.error("Lỗi auto refresh thống kê nạp ví:", error);
            });
        }, AUTO_REFRESH_MS);

        return () => clearInterval(intervalId);
    }, [currentPage, searchTerm, activeFilter]);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setCurrentPage(1);
        setSearchTerm(searchInput.trim());
    };

    const handleFilterChange = (filterId) => {
        setActiveFilter(filterId);
        setCurrentPage(1);
    };

    const handleRefresh = async () => {
        await Promise.all([fetchTransactions({ silent: true }), fetchSummary()]);
        toast.success("Đã làm mới danh sách nạp ví.");
    };

    const handleChangeStatus = async (id, newStatus) => {
        try {
            setUpdatingId(id);
            await manualChargeBalance(id, newStatus);
            toast.success("Cập nhật trạng thái thành công.");
            await Promise.all([fetchTransactions({ silent: true }), fetchSummary()]);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái.");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.88)_45%,rgba(8,47,73,0.86))] p-5 shadow-2xl shadow-slate-950/35">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                            <FiCreditCard />
                            Wallet deposit
                        </p>
                        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">Quản lý đơn nạp ví</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                            Theo dõi giao dịch theo thời gian thực, tìm theo email hoặc mã giao dịch và xử lý trạng thái trực tiếp ngay trong bảng.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                    >
                        <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                        Làm mới
                    </button>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {FILTERS.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.id;
                    return (
                        <button
                            key={filter.id}
                            type="button"
                            onClick={() => handleFilterChange(filter.id)}
                            className={`rounded-[1.25rem] border p-4 text-left transition ${
                                isActive
                                    ? "border-cyan-300/30 bg-cyan-300/10 shadow-[0_14px_36px_rgba(8,145,178,0.12)]"
                                    : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                            }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/45 ${filter.tone}`}>
                                    <Icon size={16} />
                                </div>
                                <span className="text-2xl font-semibold text-white">{summary[filter.id]}</span>
                            </div>
                            <p className="mt-4 text-sm font-semibold text-white">{filter.label}</p>
                            <p className="mt-1 text-xs text-slate-400">{isActive ? "Đang xem danh sách này" : "Bấm để lọc nhanh"}</p>
                        </button>
                    );
                })}
            </section>

            <section className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04] shadow-xl shadow-slate-950/20 backdrop-blur-sm">
                <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            {FILTERS.find((filter) => filter.id === activeFilter)?.label || "Tất cả"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Tổng {pagination.totalItem} giao dịch phù hợp{searchTerm ? ` cho từ khóa "${searchTerm}"` : ""}.
                        </p>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                        <div className="relative min-w-[280px] max-w-full">
                            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Tìm theo email hoặc mã giao dịch..."
                                className="h-11 w-full rounded-[1rem] border border-white/10 bg-slate-950/45 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/30"
                            />
                        </div>

                        <button type="submit" className="h-11 rounded-[1rem] bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                            Tìm kiếm
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-slate-950/35 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            <tr>
                                <th className="px-5 py-4">Mã GD</th>
                                <th className="px-5 py-4">Người dùng</th>
                                <th className="px-5 py-4 text-right">Số tiền</th>
                                <th className="px-5 py-4">Trạng thái</th>
                                <th className="px-5 py-4">Tạo lúc</th>
                                <th className="px-5 py-4">Cập nhật</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                [...Array(6)].map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={6} className="px-5 py-4">
                                            <div className="h-12 animate-pulse rounded-2xl bg-white/10" />
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <p className="text-base font-semibold text-white">Không có giao dịch phù hợp</p>
                                        <p className="mt-2 text-sm text-slate-400">Hãy thử đổi bộ lọc hoặc tìm bằng email khác.</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id} className="transition hover:bg-white/[0.05]">
                                        <td className="px-5 py-4 align-top">
                                            <div className="font-mono text-xs font-semibold text-slate-200">#{transaction.id}</div>
                                        </td>

                                        <td className="px-5 py-4 align-top">
                                            <div className="font-semibold text-white">{transaction.email || "N/A"}</div>
                                            <div className="mt-1 text-xs text-slate-500">{transaction.name_user || "Người dùng ẩn danh"}</div>
                                        </td>

                                        <td className="px-5 py-4 text-right align-top">
                                            <div className="font-semibold text-cyan-200">{formatCurrency(transaction.amount)}</div>
                                        </td>

                                        <td className="px-5 py-4 align-top">
                                            <select
                                                value={transaction.status}
                                                onChange={(event) => handleChangeStatus(transaction.id, event.target.value)}
                                                disabled={updatingId === transaction.id}
                                                className={`min-w-[140px] rounded-xl border px-3 py-2 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${getStatusClass(transaction.status)}`}
                                            >
                                                {STATUS_OPTIONS.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="px-5 py-4 align-top text-sm text-slate-300">{formatDateTime(transaction.created_at)}</td>
                                        <td className="px-5 py-4 align-top text-sm text-slate-400">{formatDateTime(transaction.update_at)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && pagination.totalPages > 1 ? (
                    <div className="border-t border-white/10 p-5">
                        <Pagination
                            currentPage={currentPage}
                            totalPage={pagination.totalPages}
                            totalItems={pagination.totalItem}
                            pageSize={pagination.pageSize}
                            tone="dark"
                            onPageChange={setCurrentPage}
                        />
                    </div>
                ) : null}
            </section>
        </div>
    );
}
