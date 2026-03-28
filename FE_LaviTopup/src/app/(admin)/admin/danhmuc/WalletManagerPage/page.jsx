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
    { id: "all", label: "Tất cả", icon: FiCreditCard },
    { id: "pending", label: "Đang chờ", icon: FiClock },
    { id: "success", label: "Thành công", icon: FiCheckCircle },
    { id: "failed", label: "Thất bại", icon: FiXCircle },
    { id: "cancelled", label: "Đã hủy", icon: FiShield },
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
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        case "Đang Chờ":
        case "pending":
        case "wait":
            return "border-amber-200 bg-amber-50 text-amber-700";
        case "Thất Bại":
            return "border-rose-200 bg-rose-50 text-rose-700";
        case "Đã Hủy":
            return "border-slate-200 bg-slate-100 text-slate-700";
        default:
            return "border-slate-200 bg-slate-100 text-slate-700";
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
        <div className="space-y-6">
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Wallet Deposit Admin</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">Quản lý đơn nạp ví</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Theo dõi trạng thái giao dịch nạp ví, tìm kiếm theo email hoặc mã giao dịch, và xử lý đơn trực tiếp ngay tại đây.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                        Làm mới
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {FILTERS.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.id;

                    return (
                        <button
                            key={filter.id}
                            type="button"
                            onClick={() => handleFilterChange(filter.id)}
                            className={`rounded-[1.4rem] border p-4 text-left transition ${
                                isActive
                                    ? "border-sky-200 bg-sky-50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isActive ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                                    <Icon size={18} />
                                </div>
                                <span className="text-2xl font-bold text-slate-900">{summary[filter.id]}</span>
                            </div>
                            <p className="mt-4 text-sm font-semibold text-slate-800">{filter.label}</p>
                            <p className="mt-1 text-xs text-slate-500">{isActive ? "Đang xem danh sách này" : "Bấm để lọc nhanh"}</p>
                        </button>
                    );
                })}
            </div>

            <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {FILTERS.find((filter) => filter.id === activeFilter)?.label || "Tất cả"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Tổng {pagination.totalItem} giao dịch phù hợp{searchTerm ? ` cho từ khóa "${searchTerm}"` : ""}.
                        </p>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                        <div className="relative min-w-[280px] max-w-full">
                            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Tìm theo email hoặc mã giao dịch..."
                                className="h-11 w-full rounded-[1rem] border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                            />
                        </div>

                        <button
                            type="submit"
                            className="h-11 rounded-[1rem] bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700"
                        >
                            Tìm kiếm
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            <tr>
                                <th className="px-5 py-4">Mã GD</th>
                                <th className="px-5 py-4">Người dùng</th>
                                <th className="px-5 py-4 text-right">Số tiền</th>
                                <th className="px-5 py-4">Trạng thái</th>
                                <th className="px-5 py-4">Tạo lúc</th>
                                <th className="px-5 py-4">Cập nhật</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(6)].map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={6} className="px-5 py-4">
                                            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <p className="text-base font-semibold text-slate-700">Không có giao dịch phù hợp</p>
                                        <p className="mt-2 text-sm text-slate-500">Hãy thử đổi bộ lọc hoặc tìm bằng email khác.</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-slate-50/80">
                                        <td className="px-5 py-4 align-top">
                                            <div className="font-mono text-xs font-semibold text-slate-700">#{transaction.id}</div>
                                        </td>

                                        <td className="px-5 py-4 align-top">
                                            <div className="font-semibold text-slate-900">{transaction.email || "N/A"}</div>
                                            <div className="mt-1 text-xs text-slate-500">{transaction.name_user || "Người dùng ẩn danh"}</div>
                                        </td>

                                        <td className="px-5 py-4 text-right align-top">
                                            <div className="font-semibold text-sky-700">{formatCurrency(transaction.amount)}</div>
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

                                        <td className="px-5 py-4 align-top text-sm text-slate-600">{formatDateTime(transaction.created_at)}</td>
                                        <td className="px-5 py-4 align-top text-sm text-slate-500">{formatDateTime(transaction.update_at)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && pagination.totalPages > 1 && (
                    <div className="border-t border-slate-200 p-5">
                        <Pagination
                            currentPage={currentPage}
                            totalPage={pagination.totalPages}
                            totalItems={pagination.totalItem}
                            pageSize={pagination.pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
