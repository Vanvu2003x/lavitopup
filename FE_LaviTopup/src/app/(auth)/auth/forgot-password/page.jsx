"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ForgotPassword, ResetPassword } from "@/services/auth.service";
import { FaArrowLeft, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { MdEmail, MdLock, MdKey } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";

export default function ForgotPasswordPage() {
    const toast = useToast();
    const router = useRouter();

    // Step 1: Email
    const [email, setEmail] = useState("");

    // Step 2: Reset
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendEmail = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Vui lòng nhập email");
        setIsLoading(true);
        try {
            await ForgotPassword(email);
            toast.success("Mã OTP đã được gửi tới email của bạn");
            setStep(2);
        } catch (err) {
            toast.error("Gửi email thất bại. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword || !confirmPassword)
            return toast.error("Vui lòng điền đầy đủ thông tin");
        if (newPassword !== confirmPassword)
            return toast.error("Mật khẩu nhập lại không khớp");

        setIsLoading(true);
        try {
            await ResetPassword(email, otp, newPassword);
            toast.success("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
            router.push("/auth/login");
        } catch (err) {
            toast.error("OTP không đúng hoặc hết hạn.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[480px] bg-white dark:bg-[#1a1a2e] rounded-xl shadow-2xl shadow-cyan-600/5 border border-[#e7e7f4] dark:border-white/5 p-8 md:p-10 animate-[fadeIn_0.5s_ease-out]">
            {/* Header Section */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-600">
                    <FaShieldAlt size={28} />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Khôi phục mật khẩu</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                    {step === 1
                        ? "Nhập email của bạn để nhận mã xác thực đặt lại mật khẩu."
                        : "Kiểm tra email và nhập mã OTP cùng mật khẩu mới."}
                </p>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.form
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleSendEmail}
                        className="space-y-6"
                    >
                        <div className="relative group">
                            <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-600 transition-colors text-xl" />
                            <input
                                type="email"
                                className="w-full bg-[#f5f5f8] dark:bg-[#101022]/50 border border-[#cecee8] dark:border-white/10 rounded-lg h-14 pl-12 pr-4 text-base focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-14 rounded-lg font-bold text-lg shadow-lg shadow-cyan-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"></path>
                                    </svg>
                                    <span>Đang gửi mã...</span>
                                </>
                            ) : (
                                "Gửi Mã Xác Thực"
                            )}
                        </button>
                    </motion.form>
                ) : (
                    <motion.form
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleResetPassword}
                        className="space-y-4"
                    >
                        {/* OTP */}
                        <div className="relative group">
                            <MdKey className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 text-xl" />
                            <input
                                type="text"
                                className="w-full bg-white border-2 border-cyan-100 dark:border-cyan-900/30 rounded-lg h-14 pl-12 pr-4 text-center text-xl font-bold tracking-[0.5em] text-cyan-700 focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all outline-none placeholder-cyan-300"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                            />
                        </div>

                        {/* New Password */}
                        <div className="relative group">
                            <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-600 transition-colors text-xl" />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                className="w-full bg-[#f5f5f8] dark:bg-[#101022]/50 border border-[#cecee8] dark:border-white/10 rounded-lg h-12 pl-12 pr-12 focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium"
                                placeholder="Mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                            >
                                {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative group">
                            <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-600 transition-colors text-xl" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="w-full bg-[#f5f5f8] dark:bg-[#101022]/50 border border-[#cecee8] dark:border-white/10 rounded-lg h-12 pl-12 pr-12 focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                            >
                                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-14 rounded-lg font-bold text-lg shadow-lg shadow-cyan-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"></path>
                                    </svg>
                                    <span>Đang cập nhật...</span>
                                </>
                            ) : (
                                "Đổi Mật Khẩu"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-cyan-600 hover:text-cyan-700 font-bold text-xs uppercase tracking-wider py-2"
                        >
                            Quay lại
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="text-center mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                <Link href="/auth/login" className="flex items-center justify-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors text-sm font-semibold">
                    <FaArrowLeft size={12} />
                    <span>Quay về đăng nhập</span>
                </Link>
            </div>
        </div>
    );
}
