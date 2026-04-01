"use client";

import { useEffect, useRef, useState } from "react";
import {
    FiCheckCircle,
    FiClock,
    FiCreditCard,
    FiFilter,
    FiLoader,
    FiRefreshCw,
    FiSearch,
    FiShoppingCart,
    FiX,
    FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

import OrderItem from "@/components/admin/toupManager/orderItem";
import Pagination from "@/components/common/Pagination";
import { getAllOrder, getAllOrderByStatus, searchOrder } from "@/services/order.service";

const filterLabels = {
    all: "Tất cả",
    pending: "Chờ xử lý",
    processing: "Đang thực hiện",
    success: "Thành công",
    cancelled: "Đã hủy",
    failed: "Thất bại",
};

const statCardConfig = [
    { id: "all", title: "Tổng đơn", icon: FiCreditCard, tone: "text-slate-100", ring: "ring-slate-400/30" },
    { id: "pending", title: "Chờ xử lý", icon: FiClock, tone: "text-amber-200", ring: "ring-amber-300/30" },
    { id: "processing", title: "Đang thực hiện", icon: FiLoader, tone: "text-sky-200", ring: "ring-sky-300/30" },
    { id: "success", title: "Thành công", icon: FiCheckCircle, tone: "text-emerald-200", ring: "ring-emerald-300/30" },
    { id: "cancelled", title: "Đã hủy", icon: FiXCircle, tone: "text-fuchsia-200", ring: "ring-fuchsia-300/30" },
    { id: "failed", title: "Thất bại", icon: FiXCircle, tone: "text-rose-200", ring: "ring-rose-300/30" },
];

function StatCard({ title, value, icon: Icon, active, onClick, tone, ring }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative w-full overflow-hidden rounded-[1.2rem] border p-3.5 text-left transition ${
                active
                    ? `border-cyan-300/35 bg-cyan-300/10 shadow-[0_14px_36px_rgba(8,145,178,0.15)] ring-1 ${ring}`
                    : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
            }`}
        >
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/45 ${tone}`}>
                    <Icon size={16} className={active && title === "Đang thực hiện" ? "animate-spin" : ""} />
                </div>
                {active ? <div className="h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.9)]" /> : null}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </button>
    );
}

export default function ToUpManagerPage() {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        success: 0,
        cancelled: 0,
        failed: 0,
    });
    const [listOrders, setListOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const listRef = useRef(null);

    const fetchOrders = async () => {
        try {
            if (searchKeyword.trim()) {
                const res = await searchOrder(searchKeyword.trim(), currentPage);
                setListOrders(res.orders?.orders || []);
                setTotalPages(Math.ceil((res.orders?.total || 0) / 10));

                if (!res.orders || res.orders.length === 0) {
                    toast.info("Không tìm thấy đơn hàng phù hợp.");
                }
                return;
            }

            if (activeFilter === "all") {
                const res = await getAllOrder(currentPage);
                setStats({
                    total: res.total,
                    pending: res.stats?.pending || 0,
                    processing: res.stats?.processing || 0,
                    success: res.stats?.success || 0,
                    cancelled: res.stats?.cancelled || 0,
                    failed: res.stats?.failed || 0,
                });

                setListOrders(res.orders || []);
                setTotalPages(Math.ceil(res.total / 10));
            } else {
                const res = await getAllOrderByStatus(activeFilter, currentPage);
                setListOrders(res.orders || []);
                setTotalPages(Math.ceil(res.total / 10));

                if (!res.orders || res.orders.length === 0) {
                    toast.info("Không có đơn hàng trong trạng thái này.");
                }
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
            toast.error("Lỗi khi tải danh sách đơn hàng.");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [currentPage, activeFilter, searchKeyword]);

    useEffect(() => {
        if (listOrders.length > 0 && listRef.current) {
            listRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [listOrders]);

    const handleClickStat = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
        setSearchKeyword("");
    };

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(8,47,73,0.88)_45%,rgba(30,41,59,0.9))] p-4 shadow-2xl shadow-slate-950/35 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-[1.25fr_0.85fr]">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                            <FiShoppingCart />
                            Order control
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-[1.8rem]">Quản lý đơn nạp</h1>
                            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-300">
                                Theo dõi trạng thái đơn theo thời gian thực, lọc nhanh theo nhóm và đồng bộ lại trạng thái toàn bộ khi cần.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                        <div className="rounded-[1.15rem] border border-white/10 bg-slate-950/30 px-4 py-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tổng đơn</p>
                            <p className="mt-3 font-display text-2xl font-semibold text-cyan-200">{stats.total}</p>
                        </div>
                        <div className="rounded-[1.15rem] border border-white/10 bg-slate-950/30 px-4 py-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Chờ xử lý</p>
                            <p className="mt-3 font-display text-2xl font-semibold text-amber-200">{stats.pending}</p>
                        </div>
                        <div className="rounded-[1.15rem] border border-white/10 bg-slate-950/30 px-4 py-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Trang hiện tại</p>
                            <p className="mt-3 font-display text-2xl font-semibold text-emerald-200">
                                {currentPage}/{totalPages}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-3 py-1.5 text-xs font-semibold text-slate-300">
                        <FiFilter className="text-cyan-200" />
                        Đang xem: <span className="text-cyan-200">{filterLabels[activeFilter] || activeFilter}</span>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                        <div className="relative w-full sm:min-w-[300px]">
                            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(event) => setSearchKeyword(event.target.value)}
                                placeholder="Tìm theo mã đơn, email..."
                                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/45 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/30"
                            />
                            {searchKeyword ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchKeyword("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                                >
                                    <FiX size={14} />
                                </button>
                            ) : null}
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                const confirmed = confirm(
                                    "Bạn có chắc muốn quét và đồng bộ lại trạng thái TẤT CẢ đơn đang xử lý? Quá trình này có thể mất vài giây."
                                );
                                if (!confirmed) return;

                                const toastId = toast.loading("Đang đồng bộ dữ liệu...");

                                try {
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/sync/all`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                                        },
                                    });
                                    const data = await res.json();

                                    if (data.status) {
                                        toast.update(toastId, {
                                            render: `Đã đồng bộ: ${data.updated} đơn thay đổi.`,
                                            type: "success",
                                            isLoading: false,
                                            autoClose: 3000,
                                        });
                                        fetchOrders();
                                    } else {
                                        toast.update(toastId, {
                                            render: data.message || "Lỗi đồng bộ",
                                            type: "error",
                                            isLoading: false,
                                            autoClose: 3000,
                                        });
                                    }
                                } catch (error) {
                                    toast.update(toastId, {
                                        render: "Lỗi kết nối server",
                                        type: "error",
                                        isLoading: false,
                                        autoClose: 3000,
                                    });
                                }
                            }}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                        >
                            <FiRefreshCw />
                            Đồng bộ trạng thái
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                {statCardConfig.map((item) => (
                    <StatCard
                        key={item.id}
                        title={item.title}
                        value={item.id === "all" ? stats.total : stats[item.id]}
                        icon={item.icon}
                        tone={item.tone}
                        ring={item.ring}
                        active={activeFilter === item.id}
                        onClick={() => handleClickStat(item.id)}
                    />
                ))}
            </section>

            <section ref={listRef} className="space-y-4">
                {listOrders.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-4">
                            {listOrders.map((order, index) => (
                                <OrderItem
                                    key={order.id}
                                    order={{ ...order, stt: (currentPage - 1) * 10 + index + 1 }}
                                    onStatusChange={() => {
                                        fetchOrders();
                                        toast.success("Cập nhật trạng thái thành công");
                                    }}
                                />
                            ))}
                        </div>

                        <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                            <Pagination
                                currentPage={currentPage}
                                totalPage={totalPages}
                                tone="dark"
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="rounded-[1.65rem] border border-white/10 bg-white/[0.04] px-6 py-16 text-center backdrop-blur-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-slate-950/45 text-slate-300">
                            <FiShoppingCart size={20} />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-white">Không có đơn nạp nào</h3>
                        <p className="mt-2 text-sm text-slate-400">Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
