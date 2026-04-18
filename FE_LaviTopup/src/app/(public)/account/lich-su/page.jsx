"use client";

import { useEffect, useState } from "react";
import { FiArrowDownRight, FiArrowUpRight, FiClock } from "react-icons/fi";

import { getTransactionHistory } from "@/services/order.service";

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

export default function TransactionHistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const data = await getTransactionHistory(page);
                setTransactions(data.transactions || []);
                setTotalPages(data.totalPages || 1);
            } catch (error) {
                console.error("Failed to load transaction history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [page]);

    const creditCount = transactions.filter((item) => item.type === "credit").length;
    const debitCount = transactions.filter((item) => item.type !== "credit").length;

    return (
        <div className="space-y-3">
            <section className="surface-card rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#53e5c6]">
                            Biến động số dư
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-white">Lịch sử ví</h1>
                        <p className="mt-1.5 text-sm text-[#a8c0e4]">
                            Theo dõi các giao dịch cộng/trừ số dư.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                                Cộng
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">{creditCount}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                                Trừ
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">{debitCount}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-2.5">
                {loading ? (
                    [...Array(4)].map((_, index) => (
                        <div key={index} className="surface-card h-24 animate-pulse rounded-xl border border-white/10" />
                    ))
                ) : transactions.length === 0 ? (
                    <div className="surface-card rounded-xl px-5 py-12 text-center">
                        <FiClock className="mx-auto text-[#53e5c6]" size={28} />
                        <p className="mt-3 text-base font-semibold text-white">Chưa có giao dịch nào</p>
                        <p className="mt-1 text-sm text-[#9fb7da]">
                            Khi số dư thay đổi, lịch sử sẽ xuất hiện tại đây.
                        </p>
                    </div>
                ) : (
                    transactions.map((item) => {
                        const isCredit = item.type === "credit";
                        const Icon = isCredit ? FiArrowDownRight : FiArrowUpRight;

                        return (
                            <div key={item.id} className="surface-card rounded-xl p-3.5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                                isCredit
                                                    ? "bg-[#53e5c6]/14 text-[#53e5c6]"
                                                    : "bg-[#ff8456]/14 text-[#ff8456]"
                                            }`}
                                        >
                                            <Icon size={17} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                                                {new Date(item.created_at).toLocaleString("vi-VN")}
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-white">
                                                {item.description}
                                            </p>
                                            <p className="mt-1 text-xs text-[#9fb7da]">
                                                Số dư sau giao dịch:{" "}
                                                <span className="font-semibold text-white">
                                                    {formatCurrency(item.balance_after)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                                            isCredit
                                                ? "bg-[#53e5c6]/14 text-[#53e5c6]"
                                                : "bg-[#ff8456]/14 text-[#ff8456]"
                                        }`}
                                    >
                                        {isCredit ? "+" : "-"}
                                        {formatCurrency(item.amount)}
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
    );
}
