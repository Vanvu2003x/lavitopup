"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";
import { Register } from "@/services/auth.service";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";

const inputClass =
    "h-[3.25rem] w-full rounded-2xl border border-white/10 bg-[#0a1732]/80 pl-12 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-[#7f9fce] focus:border-[#53e5c6] focus:ring-4 focus:ring-[#53e5c6]/12 sm:h-14 sm:text-base";
const inputIconClass =
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#7f9fce] transition group-focus-within:text-[#53e5c6]";

export default function RegisterPage() {
    const toast = useToast();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!username) return toast.error("Chưa nhập tên người dùng");
        if (!email) return toast.error("Chưa nhập email");
        if (!isValidEmail(email)) return toast.error("Email không hợp lệ");
        if (!password) return toast.error("Chưa nhập mật khẩu");
        if (!rePassword) return toast.error("Chưa nhập lại mật khẩu");
        if (password !== rePassword) return toast.error("Hai mật khẩu không trùng khớp");
        if (isLoading) return;

        setIsLoading(true);

        try {
            const userData = await Register(username, email, password);
            localStorage.setItem("name", userData.name_user);
            toast.success("Đăng ký thành công!");
            window.location.href = "/";
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-[0.96fr_1.04fr]">
            <section className="glass-panel relative hidden overflow-hidden rounded-[2.6rem] p-4 lg:flex lg:min-h-[640px]">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-[-5rem] top-[-5rem] h-44 w-44 rounded-full bg-[#53e5c6]/14 blur-[90px]" />
                    <div className="absolute bottom-[-5rem] right-[-3rem] h-56 w-56 rounded-full bg-[#ff8456]/16 blur-[100px]" />
                </div>

                <div className="relative z-10 h-full w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f]/70 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                    <div className="relative h-full min-h-[608px]">
                        <Image
                            src="/imgs/dangki.png"
                            alt="Minh họa đăng ký LaviTopup"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 48vw"
                            className="object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.08)_0%,rgba(7,17,31,0.38)_100%)]" />
                    </div>
                </div>
            </section>

            <div className="surface-card relative overflow-hidden rounded-[2.4rem] p-7 sm:p-8 md:p-10">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-[-4rem] top-[-4rem] h-36 w-36 rounded-full bg-[#53e5c6]/8 blur-[80px]" />
                    <div className="absolute bottom-[-5rem] right-[-4rem] h-40 w-40 rounded-full bg-[#ff8456]/10 blur-[90px]" />
                </div>

                <div className="relative z-10">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#53e5c6]">
                        Tham gia LaviTopup
                    </div>

                    <div className="mb-8">
                        <h2 className="font-sans text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">Đăng ký tài khoản</h2>
                        <p className="mt-3 text-sm leading-7 text-[#a8c0e4]">
                            Tạo tài khoản để bắt đầu nạp game, theo dõi giao dịch và sử dụng đầy đủ các tiện ích của hệ thống.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="group relative">
                            <MdPerson className={inputIconClass} />
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Họ và tên"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="group relative">
                            <MdEmail className={inputIconClass} />
                            <input
                                type="email"
                                className={inputClass}
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="group relative">
                            <MdLock className={inputIconClass} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`${inputClass} pr-12`}
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f9fce] transition hover:text-[#53e5c6]"
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>

                        <div className="group relative">
                            <MdLock className={inputIconClass} />
                            <input
                                type={showRePassword ? "text" : "password"}
                                className={`${inputClass} pr-12`}
                                placeholder="Xác nhận mật khẩu"
                                value={rePassword}
                                onChange={(e) => setRePassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowRePassword(!showRePassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f9fce] transition hover:text-[#53e5c6]"
                            >
                                {showRePassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>

                        <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-[#9fb7da]">
                            Tài khoản mới sẽ dùng ngay cùng giao diện chung của website sau khi tạo thành công.
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-[#53e5c6] text-sm font-bold text-[#07142d] transition hover:bg-[#6ff0d5] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:h-14 sm:text-base"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="h-5 w-5 animate-spin text-[#07142d]" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"></path>
                                    </svg>
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <>
                                    <span>Tạo tài khoản</span>
                                    <FiArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-white/10 pt-6 text-center">
                        <p className="text-sm text-[#9fb7da]">
                            Đã có tài khoản?{" "}
                            <Link href="/auth/login" className="font-bold text-[#53e5c6] transition hover:text-white">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
