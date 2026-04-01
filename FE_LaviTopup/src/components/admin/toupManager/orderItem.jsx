"use client";

import { useState } from "react";
import { FiCheck, FiEye, FiPlay, FiRefreshCw, FiX } from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { acceptOrder, cancelOrder1, changeStatus, completeOrder } from "@/services/order.service";

const urlBaseAPI = process.env.NEXT_PUBLIC_API_URL;

const statusLabelMap = {
    pending: "Chờ xử lý",
    processing: "Đang thực hiện",
    success: "Thành công",
    cancelled: "Đã hủy",
    cancel: "Đã hủy",
};

const statusClassMap = {
    pending: "border-amber-300/35 bg-amber-400/10 text-amber-100",
    processing: "border-sky-300/35 bg-sky-400/10 text-sky-100",
    success: "border-emerald-300/35 bg-emerald-400/10 text-emerald-100",
    cancelled: "border-fuchsia-300/35 bg-fuchsia-400/10 text-fuchsia-100",
    cancel: "border-fuchsia-300/35 bg-fuchsia-400/10 text-fuchsia-100",
};

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
}

function normalizeAccountInfo(accountInfo) {
    if (!accountInfo) return null;
    if (typeof accountInfo === "string") {
        try {
            return JSON.parse(accountInfo);
        } catch {
            return null;
        }
    }
    return accountInfo;
}

export default function OrderItem({ order, onStatusChange }) {
    const toast = useToast();
    const [showAccount, setShowAccount] = useState(false);
    const [orderStatus, setOrderStatus] = useState(order.status);
    const [loading, setLoading] = useState(false);
    const [isManualMode, setIsManualMode] = useState(false);

    const statusLabel = statusLabelMap[orderStatus] || orderStatus;
    const statusClass = statusClassMap[orderStatus] || "border-slate-300/25 bg-slate-400/10 text-slate-100";
    const accountInfo = normalizeAccountInfo(order.account_info);

    const updateLocalStatus = (newStatus) => {
        setOrderStatus(newStatus);
        onStatusChange?.(order.id, newStatus);
    };

    const runAction = async (handler, successMessage, nextStatus) => {
        setLoading(true);
        try {
            await handler();
            toast.success(successMessage);
            updateLocalStatus(nextStatus);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Không thể xử lý thao tác.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!confirm("Xác nhận nhận đơn này để xử lý?")) return;
        await runAction(() => acceptOrder(order.id), "Đã nhận đơn.", "processing");
    };

    const handleComplete = async () => {
        if (!confirm("Xác nhận đã nạp xong cho khách?")) return;
        await runAction(() => completeOrder(order.id), "Đã hoàn thành đơn.", "success");
    };

    const handleCancel = async () => {
        if (!confirm("Xác nhận hủy đơn và hoàn tiền?")) return;
        await runAction(() => cancelOrder1(order.id), "Đã hủy đơn và hoàn tiền.", "cancelled");
    };

    const handleManualChange = async (newStatus) => {
        if (newStatus === orderStatus) return;
        await runAction(() => changeStatus(order.id, newStatus), "Đã cập nhật trạng thái thủ công.", newStatus);
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${urlBaseAPI}/api/order/${order.id}/sync`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();

            if (data.status) {
                toast.success(data.message || "Đồng bộ thành công.");
                if (data.remote_status) {
                    updateLocalStatus(data.remote_status);
                }
            } else {
                toast.error(data.message || "Lỗi đồng bộ");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi kết nối khi đồng bộ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <article className="rounded-[1.2rem] border border-white/10 bg-slate-950/40 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300">#{order.id}</span>
                        <span className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${statusClass}`}>{statusLabel}</span>
                        <span className="text-xs text-slate-500">
                            {order.update_at ? new Date(order.update_at).toLocaleString("vi-VN") : "N/A"}
                        </span>
                    </div>
                    <h3 className="text-base font-semibold text-white">{order.package_name || "Gói không tên"}</h3>
                    <p className="text-sm text-slate-300">{order.user_name || order.user_email || "N/A"}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-cyan-200">{formatCurrency(order.amount)}</span>
                        <span className="text-emerald-200">Lợi nhuận: {formatCurrency(order.profit || 0)}</span>
                        <span className="text-slate-400">Game: {order.game_name || "N/A"}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {orderStatus === "pending" && !isManualMode ? (
                        <>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleAccept}
                                className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
                            >
                                <FiPlay size={12} />
                                Nhận
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleCancel}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-60"
                            >
                                <FiX size={12} />
                                Hủy
                            </button>
                        </>
                    ) : null}

                    {orderStatus === "processing" && !isManualMode ? (
                        <>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleComplete}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                            >
                                <FiCheck size={12} />
                                Xong
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleCancel}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-60"
                            >
                                <FiX size={12} />
                                Hủy
                            </button>
                        </>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => setIsManualMode((prev) => !prev)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            isManualMode
                                ? "border-amber-300/30 bg-amber-500/10 text-amber-100"
                                : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                        }`}
                    >
                        Thủ công
                    </button>

                    <button
                        type="button"
                        onClick={handleSync}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-lg border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:opacity-60"
                    >
                        <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
                        Sync
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowAccount((prev) => !prev)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                        <FiEye size={12} />
                        Info
                    </button>
                </div>
            </div>

            {isManualMode ? (
                <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                    <span className="text-xs text-slate-400">Đổi trạng thái:</span>
                    <select
                        value={orderStatus}
                        onChange={(event) => handleManualChange(event.target.value)}
                        disabled={loading}
                        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                    >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="success">Success</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            ) : null}

            {showAccount ? (
                <div className="mt-3 border-t border-white/10 pt-3">
                    {order.user_nap_name ? (
                        <div className="mb-3 rounded-lg border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                            Người thực hiện nạp: <span className="font-semibold">{order.user_nap_name}</span>
                        </div>
                    ) : null}

                    {accountInfo ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                            {Object.entries(accountInfo).map(([key, value]) => (
                                <div key={key} className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2">
                                    <p className="text-[10px] uppercase text-slate-500">{String(key).replace(/_/g, " ")}</p>
                                    <p className="mt-1 text-xs text-slate-200 break-all">{String(value) || "Trống"}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">Không có thông tin tài khoản đính kèm.</p>
                    )}
                </div>
            ) : null}
        </article>
    );
}
