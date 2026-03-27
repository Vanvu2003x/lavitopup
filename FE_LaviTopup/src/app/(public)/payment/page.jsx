"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/services/websocket.service";
import { useToast } from "@/components/ui/Toast";
import { cancelPaymentAPI } from "@/services/payment.service";
import { FiCopy, FiClock, FiCheckCircle, FiAlertTriangle, FiX, FiShield, FiCreditCard } from "react-icons/fi";

export default function ThanhToan() {
    const toast = useToast();
    const [tttt, setTttt] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [successCountdown, setSuccessCountdown] = useState(15);
    const router = useRouter();

    const redirectBack = () => {
        toast.warn("Trang thanh toán đã hết hạn!", { position: "top-center", autoClose: 3000 });
        setTimeout(() => router.back(), 3000);
    };

    const cancelPayment = async () => {
        if (!tttt) return;
        try {
            await cancelPaymentAPI(tttt.id);
            localStorage.removeItem("tttt");
            setTttt(null);
            toast.info("Bạn đã hủy thanh toán.", { position: "top-center", autoClose: 2000 });
            setTimeout(() => router.back(), 2500);
        } catch (error) {
            console.error("Lỗi khi hủy thanh toán:", error);
            toast.error("Hủy thanh toán thất bại!", { position: "top-center" });
        }
    };

    // Lấy dữ liệu thanh toán khi load trang
    useEffect(() => {
        const value = localStorage.getItem("tttt");
        if (value) {
            try {
                const parsed = JSON.parse(value);
                if (!parsed.createdAt) {
                    parsed.createdAt = Date.now();
                    localStorage.setItem("tttt", JSON.stringify(parsed));
                }
                const elapsed = Math.floor((Date.now() - parsed.createdAt) / 1000);
                const remaining = 1200 - elapsed;
                if (remaining <= 0) {
                    localStorage.removeItem("tttt");
                    redirectBack();
                } else {
                    setTttt(parsed);
                    setCountdown(remaining);
                }
            } catch (e) {
                console.error("Dữ liệu localStorage không hợp lệ:", e);
            }
        }
    }, []);

    // Đếm ngược thời gian còn lại của trang thanh toán
    useEffect(() => {
        if (!tttt || countdown === null) return;
        if (countdown <= 0) {
            localStorage.removeItem("tttt");
            setTttt(null);
            redirectBack();
            return;
        }
        const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [countdown, tttt]);

    // Socket lắng nghe kết quả thanh toán
    useEffect(() => {
        const socket = getSocket();
        socket.on("payment_success", (data) => {
            if (data.balance != null) {
                localStorage.setItem("balance", String(data.balance));
            }
            localStorage.removeItem("tttt");
            toast.success(data.message || "Thanh toán thành công!", { position: "top-center", autoClose: 2000 });
            setPaymentSuccess(true);
        });
        return () => socket.off("payment_success");
    }, []);

    // Đếm ngược 15 giây khi ở trang success
    useEffect(() => {
        if (!paymentSuccess) return;
        if (successCountdown <= 0) {
            router.back();
            return;
        }
        const timer = setInterval(() => {
            setSuccessCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [paymentSuccess, successCountdown]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã sao chép!", { autoClose: 1000, position: "bottom-center" });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations - Subtle */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-100/40 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px]"></div>
            </div>

            {!paymentSuccess && tttt && (
                <div className="w-full max-w-5xl relative z-10 animate-[fadeInUp_0.4s_ease-out]">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">

                        {/* Left Column: Order Summary (Dark/Gradient Theme) */}
                        <div className="lg:w-2/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wide uppercase text-xs">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                        Thanh toán an toàn
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                                        <FiClock className="text-cyan-400" />
                                        <span>{formatTime(countdown)}</span>
                                    </div>
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold mb-1">Xác nhận thanh toán</h1>
                                    <p className="text-slate-400 text-sm">Vui lòng hoàn tất thanh toán trước khi hết giờ.</p>
                                </div>

                                <div className="space-y-4 py-6 border-t border-white/10 border-b">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Mã đơn hàng</span>
                                        <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded select-all">#{tttt.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Khách hàng</span>
                                        <span className="text-white font-medium">{tttt.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Email</span>
                                        <span className="text-white font-medium">{tttt.email}</span>
                                    </div>
                                </div>

                                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5">
                                    <div className="text-xs text-cyan-300 font-medium mb-1">Tổng tiền thanh toán</div>
                                    <div className="text-3xl font-bold text-white tracking-tight">
                                        {Number(tttt.amount).toLocaleString("vi-VN")} <span className="text-base font-normal text-cyan-200/70">VNĐ</span>
                                    </div>
                                    <div className="mt-3 text-sm text-cyan-200/80 leading-relaxed">
                                        {tttt.description}
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
                                <div className="flex gap-3">
                                    <button
                                        onClick={cancelPayment}
                                        className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <FiX /> Hủy đơn hàng
                                    </button>
                                </div>
                                <p className="text-center text-xs text-slate-500 mt-4">
                                    Cần hỗ trợ? <a href="#" className="text-cyan-400 hover:underline">Liên hệ CSKH</a>
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Payment Details (Light Theme) */}
                        <div className="lg:w-3/5 bg-white p-8 lg:p-10 flex flex-col">
                            <div className="text-center mb-8">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-700 font-bold text-xs uppercase tracking-wider border border-cyan-100 mb-4">
                                    Quét QR để thanh toán
                                </span>
                                <h3 className="text-xl font-bold text-gray-900">Thông tin chuyển khoản</h3>
                            </div>

                            <div className="flex-1 flex flex-col items-center">
                                {/* QR Container */}
                                <div className="relative group p-4 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 mb-8 transition-transform hover:scale-[1.02] duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity -z-10"></div>
                                    <img src={tttt.urlPayment} alt="QR Code" className="w-56 h-56 object-contain mix-blend-darken" />
                                </div>

                                {/* Bank Details Cards */}
                                <div className="w-full max-w-sm space-y-3">
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between group hover:border-cyan-200 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Ngân hàng</span>
                                            <span className="font-bold text-gray-800 text-sm">{tttt.bank_name}</span>
                                        </div>
                                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-400">
                                            <FiShield size={14} />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between group hover:border-cyan-200 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Chủ tài khoản</span>
                                            <span className="font-bold text-gray-800 text-sm">{decodeURIComponent(tttt.accountHolder)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex items-center justify-between group hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => copyToClipboard(tttt.accountNumber)}>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-blue-400 font-bold tracking-wider">Số tài khoản</span>
                                            <span className="font-mono font-bold text-blue-600 text-lg tracking-wide">{tttt.accountNumber}</span>
                                        </div>
                                        <button className="p-2 bg-white text-blue-500 rounded-lg shadow-sm hover:bg-blue-500 hover:text-white transition-colors">
                                            <FiCopy size={16} />
                                        </button>
                                    </div>

                                    <div className="bg-cyan-50/50 rounded-xl p-3 border border-cyan-100 flex items-center justify-between group hover:border-cyan-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => copyToClipboard(tttt.memo)}>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-cyan-500 font-bold tracking-wider">Nội dung chuyển khoản</span>
                                            <span className="font-bold text-cyan-700 text-sm selection:bg-cyan-200">{tttt.memo}</span>
                                        </div>
                                        <button className="p-2 bg-white text-cyan-500 rounded-lg shadow-sm hover:bg-cyan-500 hover:text-white transition-colors">
                                            <FiCopy size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                                    <FiCheckCircle size={14} />
                                    <span>Tự động xác nhận sau 1-3 phút</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {paymentSuccess && tttt && (
                <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-2xl animate-scaleIn">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-sm border border-green-100">
                        <FiCheckCircle size={40} />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
                    <p className="text-gray-500 text-sm mb-6">Đơn hàng của bạn đã được xác nhận.</p>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Mã đơn hàng</span>
                            <span className="text-gray-900 font-mono font-medium">#{tttt.id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Số tiền</span>
                            <span className="text-green-600 font-bold">{Number(tttt.amount).toLocaleString("vi-VN")} đ</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 text-left text-sm text-gray-600">
                            {tttt.description}
                        </div>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all"
                    >
                        Quay về trang chủ ({successCountdown}s)
                    </button>
                </div>
            )}

            {!tttt && !paymentSuccess && (
                <div className="text-center p-8 bg-white rounded-3xl border border-gray-200 shadow-xl max-w-md">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <FiX size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                    <p className="text-gray-500 text-sm mb-6">Đơn hàng đã hết hạn hoặc không tồn tại.</p>
                    <button onClick={() => router.push('/')} className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl">
                        Trở về trang chủ
                    </button>
                </div>
            )}
        </div>
    );
}

