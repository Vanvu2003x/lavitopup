"use client";

import { useEffect, useState } from "react";
import {
    FiBox,
    FiChevronDown,
    FiChevronUp,
    FiPackage,
    FiShoppingBag,
    FiUser,
} from "react-icons/fi";

import { getOrdersByUserId } from "@/services/order.service";
import { getImageSrc } from "@/utils/imageHelper";

const formatCurrency = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))}đ`;

function normalizeStatus(status) {
    const value = String(status || "").toLowerCase();

    if (value.includes("success") || value.includes("completed")) return "success";
    if (value.includes("cancel") || value.includes("fail")) return "failed";
    if (value.includes("partial")) return "partial";
    if (value.includes("processing")) return "processing";

    return "pending";
}

function Pagination({ page, totalPages, onPrev, onNext }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
                type="button"
                onClick={onPrev}
                disabled={page === 1}
                className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
            >
                Trước
            </button>
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#c7d9f5]">
                Trang {page}/{totalPages}
            </span>
            <button
                type="button"
                onClick={onNext}
                disabled={page === totalPages}
                className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
            >
                Sau
            </button>
        </div>
    );
}

function OrderItem({ order }) {
    const [expanded, setExpanded] = useState(false);

    let accountInfo = null;
    if (order.account_info) {
        try {
            accountInfo =
                typeof order.account_info === "string"
                    ? JSON.parse(order.account_info)
                    : order.account_info;
        } catch (error) {
            accountInfo = order.account_info;
        }
    }

    const status = normalizeStatus(order.status);
    const statusMap = {
        success: {
            label: "Thành công",
            classes: "bg-[#53e5c6]/14 text-[#53e5c6]",
        },
        failed: {
            label: "Thất bại",
            classes: "bg-[#ff8456]/14 text-[#ff8456]",
        },
        partial: {
            label: "Một phần",
            classes: "bg-[#f6c15b]/14 text-[#f6c15b]",
        },
        processing: {
            label: "Đang xử lý",
            classes: "bg-[#6ab9ff]/14 text-[#6ab9ff]",
        },
        pending: {
            label: "Chờ xử lý",
            classes: "bg-white/[0.08] text-[#c7d9f5]",
        },
    };

    return (
        <div className="surface-card rounded-xl p-3.5">
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                        {order.thumbnail ? (
                            <img
                                src={getImageSrc(order.thumbnail)}
                                alt={order.package_name || "Gói nạp"}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <FiPackage className="text-[#53e5c6]" size={20} />
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                            <span>#{order.id}</span>
                            <span>{new Date(order.create_at || order.created_at).toLocaleString("vi-VN")}</span>
                        </div>

                        <h3 className="mt-1 text-base font-semibold text-white">
                            {order.package_name || "Đơn nạp game"}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#c4d8f7]">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                                <FiBox size={13} />
                                {order.game_name || "Game"}
                            </span>
                            {order.user_nap_name ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                                    <FiUser size={13} />
                                    {order.user_nap_name}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusMap[status].classes}`}>
                        {statusMap[status].label}
                    </span>
                    <p className="text-base font-bold text-white">{formatCurrency(order.amount)}</p>
                </div>
            </div>

            {accountInfo ? (
                <div className="mt-3 border-t border-white/10 pt-3">
                    <button
                        type="button"
                        onClick={() => setExpanded((value) => !value)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white transition hover:bg-white/[0.08]"
                    >
                        {expanded ? "Thu gọn thông tin nhân vật" : "Xem thông tin nhân vật"}
                        {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </button>

                    {expanded ? (
                        <div className="mt-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                            {typeof accountInfo === "object" ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {Object.entries(accountInfo).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="rounded-lg border border-white/10 bg-[#071529]/70 p-2.5"
                                        >
                                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                                                {key}
                                            </p>
                                            <p className="mt-1 break-all text-sm text-white">{String(value)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[#c4d8f7]">{String(accountInfo)}</p>
                            )}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const limit = 10;
    const totalPages = Math.ceil(total / limit) || 1;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await getOrdersByUserId(page);
                setOrders(data.orders || []);
                setTotal(data.total || 0);
            } catch (error) {
                console.error("Failed to load orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page]);

    return (
        <div className="space-y-3">
            <section className="surface-card rounded-2xl p-4 sm:p-5">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#53e5c6]">
                            Lịch sử đơn hàng
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-white">Đơn nạp game</h1>
                        <p className="mt-1.5 text-sm text-[#a8c0e4]">
                            Theo dõi trạng thái và thông tin từng đơn.
                        </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">Tổng đơn</p>
                        <p className="mt-1 text-lg font-bold text-white">{total}</p>
                    </div>
                </div>
            </section>

            <section className="space-y-2.5">
                {loading ? (
                    [...Array(4)].map((_, index) => (
                        <div key={index} className="surface-card h-32 animate-pulse rounded-xl border border-white/10" />
                    ))
                ) : orders.length === 0 ? (
                    <div className="surface-card rounded-xl px-5 py-12 text-center">
                        <FiShoppingBag className="mx-auto text-[#53e5c6]" size={28} />
                        <p className="mt-3 text-base font-semibold text-white">Chưa có đơn hàng nào</p>
                        <p className="mt-1 text-sm text-[#9fb7da]">
                            Khi bạn tạo đơn nạp game, lịch sử sẽ hiển thị tại đây.
                        </p>
                    </div>
                ) : (
                    orders.map((order) => <OrderItem key={order.id} order={order} />)
                )}
            </section>

            <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((value) => Math.max(1, value - 1))}
                onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
            />
        </div>
    );
}
