"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowLeft, FiEye, FiEyeOff, FiKey, FiLock, FiMail } from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { ForgotPassword, ResetPassword } from "@/services/auth.service";

export default function ForgotPasswordPage() {
    const toast = useToast();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendEmail = async (event) => {
        event.preventDefault();
        if (!email) {
            toast.error("Vui lòng nhập email");
            return;
        }

        setIsLoading(true);
        try {
            await ForgotPassword(email.trim());
            toast.success("Đã gửi OTP về email của bạn");
            setStep(2);
        } catch (error) {
            toast.error("Gửi OTP thất bại, vui lòng thử lại");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();

        if (!otp.trim() || !newPassword || !confirmPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Mật khẩu mới cần ít nhất 6 ký tự");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu nhập lại chưa khớp");
            return;
        }

        setIsLoading(true);
        try {
            await ResetPassword(email.trim(), otp.trim(), newPassword);
            toast.success("Đổi mật khẩu thành công, vui lòng đăng nhập lại");
            router.push("/auth/login");
        } catch (error) {
            toast.error("OTP không đúng hoặc đã hết hạn");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[460px] rounded-2xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-[#101522] sm:p-7">
            <div className="mb-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-400">
                    Khôi phục tài khoản
                </p>
                <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    Quên mật khẩu
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    {step === 1
                        ? "Nhập email để nhận OTP đặt lại mật khẩu."
                        : "Nhập OTP và mật khẩu mới để hoàn tất."}
                </p>
            </div>

            {step === 1 ? (
                <form onSubmit={handleSendEmail} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </label>
                    <div className="relative">
                        <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="name@example.com"
                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-10 text-sm outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-[#0b1020] dark:text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-1 h-11 w-full rounded-xl bg-cyan-600 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? "Đang gửi OTP..." : "Gửi OTP"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        OTP
                    </label>
                    <div className="relative">
                        <FiKey className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={otp}
                            onChange={(event) => setOtp(event.target.value)}
                            placeholder="Nhập 6 số OTP"
                            maxLength={6}
                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-10 text-sm outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-[#0b1020] dark:text-white"
                        />
                    </div>

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mật khẩu mới
                    </label>
                    <div className="relative">
                        <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-10 pr-10 text-sm outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-[#0b1020] dark:text-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            aria-label="Ẩn/hiện mật khẩu mới"
                        >
                            {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nhập lại mật khẩu
                    </label>
                    <div className="relative">
                        <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-10 pr-10 text-sm outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-[#0b1020] dark:text-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            aria-label="Ẩn/hiện nhập lại mật khẩu"
                        >
                            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-1 h-11 w-full rounded-xl bg-cyan-600 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="h-10 w-full rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                        Quay lại nhập email
                    </button>
                </form>
            )}

            <div className="mt-5 border-t border-gray-100 pt-4 dark:border-white/10">
                <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-cyan-600 dark:text-gray-300"
                >
                    <FiArrowLeft size={14} />
                    Quay về đăng nhập
                </Link>
            </div>
        </div>
    );
}
