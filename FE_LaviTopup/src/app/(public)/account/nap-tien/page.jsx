"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiClock, FiCreditCard, FiPlusCircle, FiXCircle } from "react-icons/fi";

import PaymentWallet from "../components/PaymentWallet";
import { getLogByUser } from "@/services/toup-wallet-logs.service";

const formatCurrency = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))}đ`;

function Pagination({ page, totalPages, onPrev, onNext }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
                type="button"
                onClick={onPrev}
                disabled={page === 1}
                className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
            >
                Trước
            </button>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[#c7d9f5]">
                Trang {page} / {totalPages}
            </span>
            <button
                type="button"
                onClick={onNext}
                disabled={page === totalPages}
                className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
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
            <div className="space-y-6">
                <section className="surface-card rounded-[2.4rem] p-6 sm:p-8">
                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#53e5c6]">Nạp tiền vào ví</p>
                            <h1 className="mt-2 font-sans text-3xl font-bold tracking-[-0.02em] text-white">Tạo giao dịch nạp nhanh</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#a8c0e4]">
                                Chọn số tiền, tạo mã QR và theo dõi lịch sử nạp tiền ngay trong cùng một khu vực tài khoản.
                            </p>
                        </div>

                        <div className="glass-panel rounded-[2rem] p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">Bắt đầu</p>
                            <p className="mt-2 text-sm leading-7 text-[#c4d8f7]">
                                Nhấn nút bên dưới để mở cổng nạp tiền. Hệ thống hỗ trợ nạp tối thiểu từ 10.000đ.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowPayment(true)}
                                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ff8456] px-5 py-3 text-sm font-bold text-[#08111f] transition hover:bg-[#ff976f]"
                            >
                                <FiPlusCircle size={16} />
                                Tạo giao dịch mới
                            </button>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    {loading ? (
                        [...Array(4)].map((_, index) => (
                            <div key={index} className="surface-card h-28 animate-pulse rounded-[2rem] border border-white/10" />
                        ))
                    ) : logs.length === 0 ? (
                        <div className="surface-card rounded-[2rem] px-6 py-14 text-center">
                            <FiCreditCard className="mx-auto text-[#53e5c6]" size={30} />
                            <p className="mt-4 font-sans text-xl font-bold text-white">Chưa có giao dịch nạp tiền</p>
                            <p className="mt-2 text-sm text-[#9fb7da]">Lịch sử nạp tiền sẽ hiển thị tại đây sau khi bạn tạo giao dịch đầu tiên.</p>
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
                                <div key={log.id} className="surface-card rounded-[2rem] p-5">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">
                                                Giao dịch #{log.id}
                                            </p>
                                            <p className="mt-2 text-base font-bold text-white">{formatCurrency(log.amount)}</p>
                                            <p className="mt-2 text-sm text-[#9fb7da]">{new Date(log.created_at).toLocaleString("vi-VN")}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${current.badge}`}>
                                                <Icon size={16} />
                                                {current.label}
                                            </span>
                                        </div>
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
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020817]/80 p-4 backdrop-blur-md">
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
