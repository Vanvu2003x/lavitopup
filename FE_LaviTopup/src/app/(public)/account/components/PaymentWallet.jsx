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
import { getSocket } from "@/services/websocket.service";

const presetAmounts = [20000, 50000, 100000, 200000, 500000];
const formatCurrency = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

export default function PaymentWallet({ onClose }) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handlePaymentSuccess = (data) => {
            setPaymentSuccess(data);
            toast.success("Nạp tiền thành công!");
        };

        socket.on("payment_success", handlePaymentSuccess);

        return () => {
            socket.off("payment_success", handlePaymentSuccess);
        };
    }, [toast]);

    const handlePayment = async () => {
        if (!amount || Number(amount) < 10000) {
            toast.error("Vui lòng nạp tối thiểu 10.000đ");
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
            toast.error("Có lỗi xảy ra khi tạo mã thanh toán");
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
            toast.error("Không thể sao chép nội dung");
        }
    };

    return (
        <div className="surface-card relative w-full max-w-4xl overflow-hidden rounded-[2.4rem] border border-white/12 shadow-[0_30px_100px_rgba(2,8,23,0.45)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-5rem] top-[-5rem] h-44 w-44 rounded-full bg-[#53e5c6]/12 blur-[100px]" />
                <div className="absolute bottom-[-5rem] right-[-5rem] h-52 w-52 rounded-full bg-[#ff8456]/14 blur-[110px]" />
            </div>

            <div className="relative z-10 border-b border-white/10 px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#53e5c6]">Nạp tiền vào ví</p>
                        <h2 className="mt-2 font-sans text-2xl font-bold tracking-[-0.02em] text-white">Tạo thanh toán nhanh</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
                        aria-label="Đóng nạp tiền"
                    >
                        <FiX size={20} />
                    </button>
                </div>
            </div>

            <div className="relative z-10 p-6 sm:p-8">
                {paymentSuccess ? (
                    <div className="flex flex-col items-center justify-center gap-5 py-8 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#53e5c6]/14 text-[#53e5c6]">
                            <FiCheckCircle size={42} />
                        </div>
                        <div>
                            <h3 className="font-sans text-2xl font-bold text-white">Nạp tiền thành công</h3>
                            <p className="mt-2 text-sm leading-7 text-[#a8c0e4]">Số dư mới đã được cộng vào tài khoản của bạn.</p>
                        </div>
                        <div className="glass-panel w-full max-w-md rounded-[1.8rem] p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">Số dư hiện tại</p>
                            <p className="mt-3 text-3xl font-black text-white">{formatCurrency(paymentSuccess.balance)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full bg-[#53e5c6] px-5 py-3 text-sm font-bold text-[#07142d] transition hover:bg-[#6ff0d5]"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                ) : !qrData ? (
                    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="space-y-4">
                            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">Lưu ý</p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[#c0d4f2]">
                                    <li>Nạp tối thiểu 10.000đ cho mỗi giao dịch.</li>
                                    <li>Hệ thống sẽ tự động cộng tiền sau khi thanh toán thành công.</li>
                                    <li>Giữ đúng nội dung chuyển khoản để giao dịch được xử lý nhanh.</li>
                                </ul>
                            </div>

                            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">Mức nạp nhanh</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {presetAmounts.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setAmount(String(value))}
                                            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#53e5c6]/40 hover:text-[#53e5c6]"
                                        >
                                            {new Intl.NumberFormat("vi-VN").format(value)}đ
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#53e5c6]">Bước 1</p>
                            <h3 className="mt-2 font-sans text-2xl font-bold text-white">Nhập số tiền muốn nạp</h3>

                            <div className="mt-5">
                                <label className="block text-sm font-semibold text-[#d6e5ff]">Số tiền</label>
                                <div className="relative mt-2">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Ví dụ: 100000"
                                        className="h-14 w-full rounded-2xl border border-white/12 bg-[#071529]/80 px-4 pr-24 text-base font-semibold text-white outline-none transition placeholder:text-[#7f9fce] focus:border-[#53e5c6] focus:ring-4 focus:ring-[#53e5c6]/12"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8fb5ee]">VND</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePayment}
                                disabled={loading}
                                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff8456] text-base font-bold text-[#08111f] transition hover:bg-[#ff976f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <FiLoader className="animate-spin" size={18} />
                                        <span>Đang tạo mã thanh toán...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCreditCard size={18} />
                                        <span>Tạo mã QR</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                        <div className="glass-panel rounded-[2rem] p-5 text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#53e5c6]">Bước 2</p>
                            <h3 className="mt-2 font-sans text-2xl font-bold text-white">Quét mã để thanh toán</h3>
                            <p className="mt-3 text-sm text-[#a8c0e4]">Số tiền cần thanh toán</p>
                            <p className="mt-2 text-3xl font-black text-white">{formatCurrency(amount)}</p>

                            <div className="mx-auto mt-6 flex h-[240px] w-[240px] items-center justify-center rounded-[2rem] bg-white p-4 shadow-[0_12px_30px_rgba(255,255,255,0.08)]">
                                {qrData.urlPayment || qrData.qrCode ? (
                                    <img
                                        src={qrData.urlPayment || qrData.qrCode}
                                        alt="Mã QR thanh toán"
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-slate-100 px-4 text-center text-sm text-slate-500">
                                        Không thể tải mã QR
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    label: "Ngân hàng",
                                    value: qrData.bank_name || qrData.bankName || "MBBank",
                                    canCopy: false,
                                },
                                {
                                    label: "Số tài khoản",
                                    value: qrData.accountNumber || "---",
                                    canCopy: true,
                                },
                                {
                                    label: "Chủ tài khoản",
                                    value: qrData.accountHolder || qrData.accountName || "Vu DINH VAN",
                                    canCopy: false,
                                },
                                {
                                    label: "Nội dung chuyển khoản",
                                    value: qrData.memo || qrData.description || "---",
                                    canCopy: true,
                                },
                            ].map((item) => (
                                <div key={item.label} className="surface-card rounded-[1.8rem] p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">{item.label}</p>
                                            <p className="mt-2 break-all text-lg font-bold text-white">{item.value}</p>
                                        </div>
                                        {item.canCopy ? (
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(item.value)}
                                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] text-[#53e5c6] transition hover:bg-white/[0.08]"
                                                aria-label={`Sao chép ${item.label}`}
                                            >
                                                <FiCopy size={18} />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))}

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setQrData(null)}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                >
                                    <FiArrowLeft size={16} />
                                    Quay lại nhập số tiền
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#ff8456] px-5 py-3 text-sm font-bold text-[#08111f] transition hover:bg-[#ff976f]"
                                >
                                    <FiCreditCard size={16} />
                                    Đóng cửa sổ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}