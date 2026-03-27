"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";
import { Login } from "@/services/auth.service";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { MdEmail, MdLock } from "react-icons/md";

const inputClass =
    "h-14 w-full rounded-2xl border border-white/10 bg-[#0a1732]/80 pl-12 pr-4 text-base text-white outline-none transition placeholder:text-[#7f9fce] focus:border-[#53e5c6] focus:ring-4 focus:ring-[#53e5c6]/12";
const inputIconClass =
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#7f9fce] transition group-focus-within:text-[#53e5c6]";

export default function LoginPage() {
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);

        try {
            const userData = await Login(email, password);
            localStorage.setItem("name", userData.name_user);
            toast.success("Đăng nhập thành công");
            window.location.href = "/";
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <section className="glass-panel relative hidden overflow-hidden rounded-[2.6rem] p-4 lg:flex lg:min-h-[620px]">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-[-6rem] top-[-4rem] h-48 w-48 rounded-full bg-[#53e5c6]/12 blur-[90px]" />
                    <div className="absolute bottom-[-5rem] right-[-4rem] h-56 w-56 rounded-full bg-[#ff8456]/14 blur-[100px]" />
                </div>

                <div className="relative z-10 h-full w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f]/70 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                    <div className="relative h-full min-h-[588px]">
                        <Image
                            src="/imgs/dangnhap.png"
                            alt="Minh họa đăng nhập LaviTopup"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 52vw"
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
                        Chào mừng trở lại
                    </div>

                    <div className="mb-8">
                        <h2 className="font-sans text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">Đăng nhập</h2>
                        <p className="mt-3 text-sm leading-7 text-[#a8c0e4]">
                            Tiếp tục vào tài khoản để nạp game, theo dõi số dư và kiểm tra giao dịch của bạn.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#d6e5ff]">Email</label>
                            <div className="group relative">
                                <MdEmail className={inputIconClass} />
                                <input
                                    type="email"
                                    className={inputClass}
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <label className="text-sm font-semibold text-[#d6e5ff]">Mật khẩu</label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm font-semibold text-[#53e5c6] transition hover:text-white"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <div className="group relative">
                                <MdLock className={inputIconClass} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`${inputClass} pr-12`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f9fce] transition hover:text-[#53e5c6]"
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[#a8c0e4]">
                            <input
                                type="checkbox"
                                id="remember"
                                className="h-4 w-4 rounded border-white/20 bg-transparent text-[#53e5c6] focus:ring-[#53e5c6]"
                            />
                            <span>Ghi nhớ đăng nhập</span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff8456] text-base font-bold text-[#08111f] transition hover:bg-[#ff976f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="h-5 w-5 animate-spin text-[#08111f]" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"></path>
                                    </svg>
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <>
                                    <span>Đăng nhập</span>
                                    <FiArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-white/10 pt-6 text-center">
                        <p className="text-sm text-[#9fb7da]">
                            Bạn chưa có tài khoản?{" "}
                            <Link href="/auth/register" className="font-bold text-[#53e5c6] transition hover:text-white">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
