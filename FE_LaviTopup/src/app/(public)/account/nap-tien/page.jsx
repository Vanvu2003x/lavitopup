"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiClock, FiCreditCard, FiPlusCircle, FiXCircle } from "react-icons/fi";

import PaymentWallet from "../components/PaymentWallet";
import { getLogByUser } from "@/services/toup-wallet-logs.service";

const formatCurrency = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))}đ`;

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

function getStatusBadge(status) {
    const normalized = String(status || "").toLowerCase();

    if (normalized.includes("thành") || normalized.includes("success")) {
        return "success";
    }

    if (normalized.includes("thất") || normalized.includes("hủy") || normalized.includes("fail")) {
        return "failed";
    }

    return "pending";
}

export default function DepositHistoryPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showPayment, setShowPayment] = useState(false);

    const fetchLogs = async (targetPage = page) => {
        setLoading(true);
        try {
            const data = await getLogByUser(targetPage);
            setLogs(data.data || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Failed to load deposit logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const handlePaymentSuccess = async () => {
        if (page !== 1) {
            setPage(1);
            await fetchLogs(1);
            return;
        }

        await fetchLogs(1);
    };

    return (
        <>
            <div className="space-y-3">
                <section className="surface-card rounded-2xl p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.14em] text-[#53e5c6]">
                                Nạp tiền
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-white">
                                Nạp tiền vào ví
                            </h1>
                            <p className="mt-1.5 text-sm text-[#a8c0e4]">
                                Tạo QR và theo dõi lịch sử nạp tiền.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowPayment(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff8456] px-4 py-2.5 text-sm font-semibold text-[#08111f] transition hover:bg-[#ff976f]"
                        >
                            <FiPlusCircle size={16} />
                            Tạo giao dịch mới
                        </button>
                    </div>
                </section>

                <section className="space-y-2.5">
                    {loading ? (
                        [...Array(4)].map((_, index) => (
                            <div key={index} className="surface-card h-24 animate-pulse rounded-xl border border-white/10" />
                        ))
                    ) : logs.length === 0 ? (
                        <div className="surface-card rounded-xl px-5 py-12 text-center">
                            <FiCreditCard className="mx-auto text-[#53e5c6]" size={28} />
                            <p className="mt-3 text-base font-semibold text-white">
                                Chưa có giao dịch nạp tiền
                            </p>
                            <p className="mt-1 text-sm text-[#9fb7da]">
                                Lịch sử sẽ hiển thị sau khi bạn tạo giao dịch.
                            </p>
                        </div>
                    ) : (
                        logs.map((log) => {
                            const status = getStatusBadge(log.status);
                            const statusMap = {
                                success: {
                                    label: "Thành công",
                                    icon: FiCheckCircle,
                                    badge: "bg-[#53e5c6]/14 text-[#53e5c6]",
                                },
                                failed: {
                                    label: "Thất bại",
                                    icon: FiXCircle,
                                    badge: "bg-[#ff8456]/14 text-[#ff8456]",
                                },
                                pending: {
                                    label: "Đang chờ",
                                    icon: FiClock,
                                    badge: "bg-[#f6c15b]/14 text-[#f6c15b]",
                                },
                            };
                            const current = statusMap[status];
                            const Icon = current.icon;

                            return (
                                <div key={log.id} className="surface-card rounded-xl p-3.5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                                                Giao dịch #{log.id}
                                            </p>
                                            <p className="mt-1 text-base font-semibold text-white">
                                                {formatCurrency(log.amount)}
                                            </p>
                                            <p className="mt-1 text-xs text-[#9fb7da]">
                                                {new Date(log.created_at).toLocaleString("vi-VN")}
                                            </p>
                                        </div>

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${current.badge}`}
                                        >
                                            <Icon size={14} />
                                            {current.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </section>

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPrev={() => setPage((value) => Math.max(1, value - 1))}
                    onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
                />
            </div>

            {showPayment ? (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020817]/80 p-3 backdrop-blur-md sm:p-4">
                    <div className="max-h-[90vh] w-full overflow-y-auto">
                        <PaymentWallet
                            onClose={() => setShowPayment(false)}
                            onPaymentSuccess={handlePaymentSuccess}
                        />
                    </div>
                </div>
            ) : null}
        </>
    );
}
