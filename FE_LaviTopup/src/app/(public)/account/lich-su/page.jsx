"use client";

import { useEffect, useState } from "react";
import { FiArrowDownRight, FiArrowUpRight, FiClock } from "react-icons/fi";

import { getTransactionHistory } from "@/services/order.service";

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
        <div className="space-y-6">
            <section className="surface-card rounded-[2.4rem] p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#53e5c6]">Biến động số dư</p>
                        <h1 className="mt-2 font-sans text-3xl font-bold tracking-[-0.02em] text-white">Theo dõi mọi thay đổi trong ví</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#a8c0e4]">
                            Tất cả giao dịch cộng và trừ số dư được hiển thị rõ ràng để bạn dễ kiểm tra theo thời gian.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">Giao dịch cộng</p>
                            <p className="mt-2 text-2xl font-black text-white">{creditCount}</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">Giao dịch trừ</p>
                            <p className="mt-2 text-2xl font-black text-white">{debitCount}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                {loading ? (
                    [...Array(4)].map((_, index) => (
                        <div key={index} className="surface-card h-28 animate-pulse rounded-[2rem] border border-white/10" />
                    ))
                ) : transactions.length === 0 ? (
                    <div className="surface-card rounded-[2rem] px-6 py-14 text-center">
                        <FiClock className="mx-auto text-[#53e5c6]" size={30} />
                        <p className="mt-4 font-sans text-xl font-bold text-white">Chưa có giao dịch nào</p>
                        <p className="mt-2 text-sm text-[#9fb7da]">Khi số dư thay đổi, lịch sử sẽ xuất hiện tại đây.</p>
                    </div>
                ) : (
                    transactions.map((item) => {
                        const isCredit = item.type === "credit";
                        const Icon = isCredit ? FiArrowDownRight : FiArrowUpRight;

                        return (
                            <div key={item.id} className="surface-card rounded-[2rem] p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                                isCredit ? "bg-[#53e5c6]/14 text-[#53e5c6]" : "bg-[#ff8456]/14 text-[#ff8456]"
                                            }`}
                                        >
                                            <Icon size={20} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">
                                                {new Date(item.created_at).toLocaleString("vi-VN")}
                                            </p>
                                            <p className="mt-2 text-base font-bold text-white">{item.description}</p>
                                            <p className="mt-2 text-sm text-[#9fb7da]">
                                                Số dư sau giao dịch: <span className="font-semibold text-white">{formatCurrency(item.balance_after)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold ${
                                            isCredit ? "bg-[#53e5c6]/14 text-[#53e5c6]" : "bg-[#ff8456]/14 text-[#ff8456]"
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
