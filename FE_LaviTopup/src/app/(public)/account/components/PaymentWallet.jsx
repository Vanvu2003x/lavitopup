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
            toast.success("Náº¡p tiá»n thÃ nh cÃ´ng!");
        };

        socket.on("payment_success", handlePaymentSuccess);

        return () => {
            socket.off("payment_success", handlePaymentSuccess);
        };
    }, [toast]);

    const handlePayment = async () => {
        if (!amount || Number(amount) < 10000) {
            toast.error("Vui lÃ²ng náº¡p tá»‘i thiá»ƒu 10.000Ä‘");
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
            toast.error("CÃ³ lá»—i xáº£y ra khi táº¡o mÃ£ thanh toÃ¡n");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            toast.success("ÄÃ£ sao chÃ©p");
        } catch (error) {
            console.error("Copy error:", error);
            toast.error("KhÃ´ng thá»ƒ sao chÃ©p ná»™i dung");
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
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#53e5c6]">Náº¡p tiá»n vÃ o vÃ­</p>
                        <h2 className="mt-2 font-sans text-2xl font-bold tracking-[-0.02em] text-white">Táº¡o thanh toÃ¡n nhanh</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
                        aria-label="ÄÃ³ng náº¡p tiá»n"
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
                            <h3 className="font-sans text-2xl font-bold text-white">Náº¡p tiá»n thÃ nh cÃ´ng</h3>
                            <p className="mt-2 text-sm leading-7 text-[#a8c0e4]">Sá»‘ dÆ° má»›i Ä‘Ã£ Ä‘Æ°á»£c cá»™ng vÃ o tÃ i khoáº£n cá»§a báº¡n.</p>
                        </div>
                        <div className="glass-panel w-full max-w-md rounded-[1.8rem] p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">Sá»‘ dÆ° hiá»‡n táº¡i</p>
                            <p className="mt-3 text-3xl font-black text-white">{formatCurrency(paymentSuccess.balance)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full bg-[#53e5c6] px-5 py-3 text-sm font-bold text-[#07142d] transition hover:bg-[#6ff0d5]"
                        >
                            ÄÃ³ng cá»­a sá»•
                        </button>
                    </div>
                ) : !qrData ? (
                    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="space-y-4">
                            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">LÆ°u Ã½</p>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-[#c0d4f2]">
                                    <li>Náº¡p tá»‘i thiá»ƒu 10.000Ä‘ cho má»—i giao dá»‹ch.</li>
                                    <li>Há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng cá»™ng tiá»n sau khi thanh toÃ¡n thÃ nh cÃ´ng.</li>
                                    <li>Giá»¯ Ä‘Ãºng ná»™i dung chuyá»ƒn khoáº£n Ä‘á»ƒ giao dá»‹ch Ä‘Æ°á»£c xá»­ lÃ½ nhanh.</li>
                                </ul>
                            </div>

                            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fb5ee]">Má»©c náº¡p nhanh</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {presetAmounts.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setAmount(String(value))}
                                            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#53e5c6]/40 hover:text-[#53e5c6]"
                                        >
                                            {new Intl.NumberFormat("vi-VN").format(value)}Ä‘
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#53e5c6]">BÆ°á»›c 1</p>
                            <h3 className="mt-2 font-sans text-2xl font-bold text-white">Nháº­p sá»‘ tiá»n muá»‘n náº¡p</h3>

                            <div className="mt-5">
                                <label className="block text-sm font-semibold text-[#d6e5ff]">Sá»‘ tiá»n</label>
                                <div className="relative mt-2">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="VÃ­ dá»¥: 100000"
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
                                        <span>Äang táº¡o mÃ£ thanh toÃ¡n...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCreditCard size={18} />
                                        <span>Táº¡o mÃ£ QR</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                        <div className="glass-panel rounded-[2rem] p-5 text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#53e5c6]">BÆ°á»›c 2</p>
                            <h3 className="mt-2 font-sans text-2xl font-bold text-white">QuÃ©t mÃ£ Ä‘á»ƒ thanh toÃ¡n</h3>
                            <p className="mt-3 text-sm text-[#a8c0e4]">Sá»‘ tiá»n cáº§n thanh toÃ¡n</p>
                            <p className="mt-2 text-3xl font-black text-white">{formatCurrency(amount)}</p>

                            <div className="mx-auto mt-6 flex h-[240px] w-[240px] items-center justify-center rounded-[2rem] bg-white p-4 shadow-[0_12px_30px_rgba(255,255,255,0.08)]">
                                {qrData.urlPayment || qrData.qrCode ? (
                                    <img
                                        src={qrData.urlPayment || qrData.qrCode}
                                        alt="MÃ£ QR thanh toÃ¡n"
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-slate-100 px-4 text-center text-sm text-slate-500">
                                        KhÃ´ng thá»ƒ táº£i mÃ£ QR
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    label: "NgÃ¢n hÃ ng",
                                    value: qrData.bank_name || qrData.bankName || "MBBank",
                                    canCopy: false,
                                },
                                {
                                    label: "Sá»‘ tÃ i khoáº£n",
                                    value: qrData.accountNumber || "---",
                                    canCopy: true,
                                },
                                {
                                    label: "Chá»§ tÃ i khoáº£n",
                                    value: qrData.accountHolder || qrData.accountName || "Vu DINH VAN",
                                    canCopy: false,
                                },
                                {
                                    label: "Ná»™i dung chuyá»ƒn khoáº£n",
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
                                                aria-label={`Sao chÃ©p ${item.label}`}
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
                                    Quay láº¡i nháº­p sá»‘ tiá»n
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#ff8456] px-5 py-3 text-sm font-bold text-[#08111f] transition hover:bg-[#ff976f]"
                                >
                                    <FiCreditCard size={16} />
                                    ÄÃ³ng cá»­a sá»•
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
