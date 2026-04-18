"use client";

import { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiCopy,
    FiCreditCard,
    FiLoader,
    FiX,
} from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { getUrlPayment } from "@/services/payment.service";
import { connectSocket } from "@/services/websocket.service";

const presetAmounts = [20000, 50000, 100000, 200000, 500000];
const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

export default function PaymentWallet({ onClose, onPaymentSuccess }) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const handlePaymentSuccess = (data) => {
            setPaymentSuccess(data);
            onPaymentSuccess?.(data);
            toast.success("Nạp tiền thành công");
        };

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const connection = connectSocket(token, undefined, undefined, handlePaymentSuccess);

        return () => {
            connection?.unsubscribe?.();
        };
    }, [onPaymentSuccess, toast]);

    const handlePayment = async () => {
        if (!amount || Number(amount) < 10000) {
            toast.error("Vui lòng nhập tối thiểu 10.000đ");
            return;
        }

        setLoading(true);

        try {
            const res = await getUrlPayment({
                amount: Number(amount),
                description: "Nap tien vao vi",
            });

            setQrData(res || null);
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Có lỗi khi tạo mã thanh toán");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            toast.success("Đã sao chép");
        } catch (error) {
            console.error("Copy error:", error);
            toast.error("Không thể sao chép");
        }
    };

    return (
        <div className="surface-card relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/12 shadow-[0_20px_70px_rgba(2,8,23,0.45)]">
            <div className="border-b border-white/10 px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#53e5c6]">
                            Nạp tiền vào ví
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-white">Thanh toán nhanh</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
                        aria-label="Đóng nạp tiền"
                    >
                        <FiX size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                {paymentSuccess ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#53e5c6]/14 text-[#53e5c6]">
                            <FiCheckCircle size={34} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Nạp tiền thành công</h3>
                            <p className="mt-1 text-sm text-[#a8c0e4]">
                                Số dư mới đã được cộng vào tài khoản của bạn.
                            </p>
                        </div>
                        <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#071529]/70 p-4">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                                Số dư hiện tại
                            </p>
                            <p className="mt-1.5 text-2xl font-bold text-white">
                                {formatCurrency(paymentSuccess.balance)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-[#53e5c6] px-4 py-2.5 text-sm font-semibold text-[#07142d] transition hover:bg-[#6ff0d5]"
                        >
                            Đóng
                        </button>
                    </div>
                ) : !qrData ? (
                    <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                                Lưu ý
                            </p>
                            <ul className="mt-2 space-y-1.5 text-sm text-[#c0d4f2]">
                                <li>Nạp tối thiểu 10.000đ mỗi giao dịch.</li>
                                <li>Hệ thống cộng tiền tự động khi thanh toán thành công.</li>
                                <li>Giữ đúng nội dung chuyển khoản.</li>
                            </ul>

                            <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                                Mức nạp nhanh
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {presetAmounts.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setAmount(String(value))}
                                        className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white transition hover:border-[#53e5c6]/40 hover:text-[#53e5c6]"
                                    >
                                        {new Intl.NumberFormat("vi-VN").format(value)}đ
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#071529]/70 p-4">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-[#53e5c6]">Bước 1</p>
                            <h3 className="mt-1 text-xl font-bold text-white">Nhập số tiền nạp</h3>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-[#d6e5ff]">Số tiền</label>
                                <div className="relative mt-1.5">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Ví dụ: 100000"
                                        className="h-12 w-full rounded-xl border border-white/12 bg-[#071529]/80 px-3.5 pr-16 text-base text-white outline-none transition placeholder:text-[#7f9fce] focus:border-[#53e5c6]"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8fb5ee]">VND</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePayment}
                                disabled={loading}
                                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ff8456] text-sm font-semibold text-[#08111f] transition hover:bg-[#ff976f] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <FiLoader className="animate-spin" size={16} />
                                        <span>Đang tạo mã thanh toán...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCreditCard size={16} />
                                        <span>Tạo mã QR</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
                        <div className="rounded-xl border border-white/10 bg-[#071529]/70 p-4 text-center">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-[#53e5c6]">Bước 2</p>
                            <h3 className="mt-1 text-xl font-bold text-white">Quét mã để thanh toán</h3>
                            <p className="mt-2 text-sm text-[#a8c0e4]">Số tiền cần thanh toán</p>
                            <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(amount)}</p>

                            <div className="mx-auto mt-4 flex h-[210px] w-[210px] items-center justify-center rounded-xl bg-white p-3">
                                {qrData.urlPayment || qrData.qrCode ? (
                                    <img
                                        src={qrData.urlPayment || qrData.qrCode}
                                        alt="Mã QR thanh toán"
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 px-3 text-center text-xs text-slate-500">
                                        Không thể tải mã QR
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            {[
                                {
                                    label: "Ngân hàng",
                                    value: qrData.bank_name || qrData.bankName || "MBBank",
                                    canCopy: false,
                                },
                                {
                                    label: "Số tài khoản",
                                    value: qrData.accountNumber || "0989214946",
                                    canCopy: true,
                                },
                                {
                                    label: "Chủ tài khoản",
                                    value: qrData.accountHolder || qrData.accountName || "LUU VAN QUANG",
                                    canCopy: false,
                                },
                                {
                                    label: "Nội dung chuyển khoản",
                                    value: qrData.memo || qrData.description || "---",
                                    canCopy: true,
                                },
                            ].map((item) => (
                                <div key={item.label} className="surface-card rounded-xl p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                                                {item.label}
                                            </p>
                                            <p className="mt-1 break-all text-sm font-semibold text-white">
                                                {item.value}
                                            </p>
                                        </div>
                                        {item.canCopy ? (
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(item.value)}
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] text-[#53e5c6] transition hover:bg-white/[0.08]"
                                                aria-label={`Sao chép ${item.label}`}
                                            >
                                                <FiCopy size={14} />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))}

                            <div className="flex flex-wrap gap-2 pt-0.5">
                                <button
                                    type="button"
                                    onClick={() => setQrData(null)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-white transition hover:bg-white/[0.08]"
                                >
                                    <FiArrowLeft size={14} />
                                    Quay lại
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff8456] px-3 py-2 text-sm font-semibold text-[#08111f] transition hover:bg-[#ff976f]"
                                >
                                    <FiCreditCard size={14} />
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
