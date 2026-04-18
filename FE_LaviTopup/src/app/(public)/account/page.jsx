"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    FiArrowRight,
    FiCalendar,
    FiCreditCard,
    FiEye,
    FiEyeOff,
    FiKey,
    FiMail,
    FiShield,
    FiShoppingBag,
    FiUser,
} from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { ForgotPassword, ResetPassword, getInfo } from "@/services/auth.service";
import { getFinancialSummary } from "@/services/user.service";

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

function LoadingBlock({ height = "h-24" }) {
    return (
        <div className={`surface-card animate-pulse rounded-2xl border border-white/10 ${height}`} />
    );
}

export default function ProfilePage() {
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [financials, setFinancials] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getInfo();
                setUser(response?.user || response || null);

                const financialData = await getFinancialSummary();
                setFinancials(financialData || null);
            } catch (error) {
                console.error("Không thể tải dữ liệu tài khoản", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSendOtp = async () => {
        if (!user?.email) {
            toast.error("Tài khoản chưa có email để nhận OTP");
            return;
        }

        setSendingOtp(true);
        try {
            await ForgotPassword(user.email);
            setOtpSent(true);
            toast.success("Đã gửi OTP về email của bạn");
        } catch (error) {
            toast.error("Không thể gửi OTP, vui lòng thử lại");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleChangePassword = async (event) => {
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

        if (!user?.email) {
            toast.error("Không tìm thấy email tài khoản");
            return;
        }

        setUpdatingPassword(true);
        try {
            await ResetPassword(user.email, otp.trim(), newPassword);
            toast.success("Đổi mật khẩu thành công");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setOtpSent(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (error) {
            toast.error("OTP không đúng hoặc đã hết hạn");
        } finally {
            setUpdatingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                <LoadingBlock height="h-36" />
                <div className="grid gap-3 sm:grid-cols-2">
                    <LoadingBlock />
                    <LoadingBlock />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[...Array(4)].map((_, index) => (
                        <LoadingBlock key={index} />
                    ))}
                </div>
                <LoadingBlock height="h-64" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="surface-card rounded-2xl p-6 text-center">
                <p className="text-xl font-bold text-white">Không tải được thông tin tài khoản</p>
                <p className="mt-2 text-sm text-[#a8c0e4]">
                    Vui lòng đăng nhập lại để tiếp tục.
                </p>
                <Link
                    href="/auth/login"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#53e5c6] px-4 py-2.5 text-sm font-semibold text-[#07142d] transition hover:bg-[#6ff0d5]"
                >
                    Đi tới đăng nhập
                    <FiArrowRight size={16} />
                </Link>
            </div>
        );
    }

    const roleLabel =
        String(user.role || "").toLowerCase() === "admin" ? "Quản trị viên" : "Thành viên";
    const joinedAt = user.createdAt || user.created_at;

    const infoItems = [
        {
            label: "Họ và tên",
            value: user.name || "Chưa cập nhật",
            icon: FiUser,
        },
        {
            label: "Email",
            value: user.email || "Chưa cập nhật",
            icon: FiMail,
        },
        {
            label: "Vai trò",
            value: roleLabel,
            icon: FiShield,
        },
        {
            label: "Ngày tham gia",
            value: joinedAt ? new Date(joinedAt).toLocaleDateString("vi-VN") : "Chưa có dữ liệu",
            icon: FiCalendar,
        },
    ];

    const summaryCards = [
        {
            label: "Tổng tiền nạp",
            value: financials?.tong_nap,
        },
        {
            label: "Đã chi tiêu",
            value: financials?.tong_tieu,
        },
        {
            label: "Nạp tháng này",
            value: financials?.tong_nap_thang,
        },
        {
            label: "Chi tháng này",
            value: financials?.tong_tieu_thang,
        },
    ];

    return (
        <div className="space-y-3">
            <section className="surface-card rounded-2xl p-4 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#53e5c6]">
                            Tài khoản
                        </p>
                        <h1 className="mt-1.5 text-2xl font-bold text-white">
                            Xin chào, {user.name || "bạn"}
                        </h1>

                        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                            {infoItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.label}
                                        className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[#53e5c6]">
                                                <Icon size={15} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                                                    {item.label}
                                                </p>
                                                <p className="mt-1 break-words text-sm font-semibold text-white">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#071529]/70 p-4">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#8fb5ee]">
                            Số dư hiện tại
                        </p>
                        <p className="mt-2 break-words text-3xl font-black text-white">
                            {formatCurrency(user.balance)}
                        </p>
                        <div className="mt-4 space-y-2">
                            <Link
                                href="/account/nap-tien"
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#ff8456] px-4 py-2.5 text-sm font-semibold text-[#08111f] transition hover:bg-[#ff976f]"
                            >
                                Nạp tiền
                                <FiCreditCard size={16} />
                            </Link>
                            <Link
                                href="/account/don-hang"
                                className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                            >
                                Xem đơn hàng
                                <FiShoppingBag size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((item) => (
                    <div key={item.label} className="surface-card rounded-xl p-3.5">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8fb5ee]">
                            {item.label}
                        </p>
                        <p className="mt-1.5 break-words text-base font-bold text-white">
                            {formatCurrency(item.value)}
                        </p>
                    </div>
                ))}
            </section>

            <section className="surface-card rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#53e5c6]">
                            Bảo mật
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-white">Đổi mật khẩu</h2>
                        <p className="mt-1.5 text-sm text-[#a8c0e4]">
                            OTP sẽ được gửi về email: {user.email || "chưa cập nhật"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FiKey size={15} />
                        {sendingOtp ? "Đang gửi OTP..." : otpSent ? "Gửi lại OTP" : "Gửi OTP"}
                    </button>
                </div>

                <form onSubmit={handleChangePassword} className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    <input
                        type="text"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value)}
                        placeholder="Mã OTP (6 số)"
                        className="h-11 rounded-xl border border-white/12 bg-[#071529]/80 px-3 text-sm text-white outline-none placeholder:text-[#7f9fce] focus:border-[#53e5c6]"
                    />

                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="Mật khẩu mới"
                            className="h-11 w-full rounded-xl border border-white/12 bg-[#071529]/80 px-3 pr-10 text-sm text-white outline-none placeholder:text-[#7f9fce] focus:border-[#53e5c6]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8fb5ee]"
                            aria-label="Ẩn/hiện mật khẩu mới"
                        >
                            {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>

                    <div className="relative sm:col-span-2">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                            className="h-11 w-full rounded-xl border border-white/12 bg-[#071529]/80 px-3 pr-10 text-sm text-white outline-none placeholder:text-[#7f9fce] focus:border-[#53e5c6]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8fb5ee]"
                            aria-label="Ẩn/hiện nhập lại mật khẩu"
                        >
                            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>

                    <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                        <button
                            type="submit"
                            disabled={updatingPassword || !otpSent}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#53e5c6] px-4 text-sm font-semibold text-[#07142d] transition hover:bg-[#6ff0d5] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {updatingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}
                        </button>
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm text-[#8fb5ee] hover:text-white"
                        >
                            Quên mật khẩu? Mở trang khôi phục
                        </Link>
                    </div>
                </form>
            </section>
        </div>
    );
}
