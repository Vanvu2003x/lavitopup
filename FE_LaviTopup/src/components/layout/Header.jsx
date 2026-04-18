"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiActivity, FiClock, FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi";
import { RiWallet3Line } from "react-icons/ri";
import { Logout, getInfo } from "@/services/auth.service";
import { getGames } from "@/services/games.service";
import { useToast } from "@/components/ui/Toast";

const isGameActive = (game) => String(game?.status || "active").toLowerCase() === "active";

export default function Header() {
    const [username, setUsername] = useState("");
    const [balance, setBalance] = useState(0);
    const [firstGameCode, setFirstGameCode] = useState(null);
    const [openMobileMenu, setOpenMobileMenu] = useState(false);

    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        const fetchUser = async () => {
            const storedName = typeof window !== "undefined" ? localStorage.getItem("name") : null;
            if (!storedName) return;

            try {
                const data = await getInfo();
                const user = data?.user || data;
                if (!user) return;

                setUsername(user.name || "");
                setBalance(Number(user.balance || 0));
                localStorage.setItem("name", user.name || "");
            } catch (error) {
                console.error("Không thể lấy thông tin người dùng", error);
                setUsername("");
                setBalance(0);
                localStorage.removeItem("name");
            }
        };

        const fetchGamesData = async () => {
            try {
                const games = await getGames();
                const activeGames = Array.isArray(games) ? games.filter(isGameActive) : [];
                if (activeGames.length > 0) {
                    setFirstGameCode(activeGames[0].gamecode);
                }
            } catch (error) {
                console.error("Không thể lấy danh sách game", error);
            }
        };

        fetchUser();
        fetchGamesData();
    }, []);

    const closeMobileMenu = () => setOpenMobileMenu(false);

    const goTopupGame = () => {
        if (!firstGameCode) {
            toast.error("Hiện tại chưa có game khả dụng.");
            return;
        }

        closeMobileMenu();
        router.push(`/categories/topup/${firstGameCode}`);
    };

    const goWallet = () => {
        closeMobileMenu();

        if (!username) {
            toast.info("Vui lòng đăng nhập để nạp tiền.");
            router.push("/auth/login");
            return;
        }

        router.push("/account/nap-tien");
    };

    const logoutHandler = async () => {
        try {
            await Logout();
        } catch (error) {
            console.error("Đăng xuất thất bại", error);
        }

        localStorage.removeItem("name");
        localStorage.removeItem("balance");
        closeMobileMenu();
        window.location.reload();
    };

    const formatBalance = (value) => new Intl.NumberFormat("vi-VN").format(Number(value || 0));

    const navItems = [
        { label: "Trang chủ", href: "/" },
        { label: "Nạp game", onClick: goTopupGame },
        { label: "Liên hệ", href: "/#lien-he" },
        { label: "Hỗ trợ", href: "/#ho-tro" },
    ];

    const renderNavItem = (item, mobile = false) => {
        const baseClass = mobile
            ? "block rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#53e5c6]/40 hover:bg-white/[0.07]"
            : "rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10";

        if (item.onClick) {
            return (
                <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={mobile ? `w-full text-left ${baseClass}` : baseClass}
                >
                    {item.label}
                </button>
            );
        }

        return (
            <Link
                key={item.label}
                href={item.href}
                onClick={mobile ? closeMobileMenu : undefined}
                className={baseClass}
            >
                {item.label}
            </Link>
        );
    };

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07142d]/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <Link href="/" className="flex w-[86px] shrink-0 items-center sm:w-[102px] lg:w-[126px] xl:w-[152px]">
                        <Image
                            src="/imgs/removed_bg.png"
                            alt="LaviTopup"
                            width={340}
                            height={120}
                            className="h-auto w-full object-contain"
                            priority
                        />
                    </Link>

                    <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-2 lg:flex">
                        {navItems.map((item) => renderNavItem(item))}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        {username ? (
                            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-inner">
                                <button
                                    type="button"
                                    onClick={goWallet}
                                    className="flex items-center gap-2 rounded-full bg-[#53e5c6] px-4 py-1.5 text-sm font-bold text-[#07142d] transition hover:bg-[#6ef5dc]"
                                >
                                    <RiWallet3Line />
                                    <span>{formatBalance(balance)} VND</span>
                                    <div className="h-4 w-px bg-[#07142d]/20 mx-0.5" />
                                    <span>Nạp</span>
                                </button>
                                <Link
                                    href="/account"
                                    className="rounded-full px-4 py-1.5 text-sm font-bold text-white transition hover:bg-white/10"
                                >
                                    {username}
                                </Link>
                                <div className="h-4 w-px bg-white/10 mx-0.5" />
                                <button
                                    type="button"
                                    onClick={logoutHandler}
                                    className="rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                                    title="Đăng xuất"
                                >
                                    <FiLogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="rounded-full bg-[#53e5c6] px-4 py-2 text-sm font-semibold text-[#07142d] transition hover:bg-[#6ff0d5]"
                                >
                                    Tạo tài khoản
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="flex min-w-0 items-center gap-2 lg:hidden">
                        {username ? (
                            <div className="flex min-w-0 items-center rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-inner">
                                <button
                                    type="button"
                                    onClick={goWallet}
                                    className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#53e5c6] px-3 text-[11px] font-bold text-[#07142d] transition active:scale-95"
                                >
                                    <RiWallet3Line size={14} />
                                    <span>{formatBalance(balance)} đ</span>
                                </button>
                                <Link
                                    href="/account"
                                    title={username}
                                    className="ml-1 block max-w-[96px] truncate rounded-full px-2 py-1 text-xs font-semibold text-white/95 transition hover:bg-white/10"
                                >
                                    {username}
                                </Link>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={goWallet}
                                className="glass-panel inline-flex h-10 items-center gap-2 rounded-[1rem] px-3 text-xs font-semibold text-white"
                                aria-label="Xem số dư"
                            >
                                <RiWallet3Line className="shrink-0 text-[#53e5c6]" />
                                <span className="whitespace-nowrap">{formatBalance(balance)} VND</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setOpenMobileMenu(true)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-white/12 bg-white/[0.05] text-white transition active:scale-95"
                            aria-label="Mở menu"
                        >
                            <FiMenu size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className={`fixed inset-0 z-[60] lg:hidden ${openMobileMenu ? "pointer-events-auto" : "pointer-events-none"}`}>
                <button
                    type="button"
                    onClick={closeMobileMenu}
                    className={`absolute inset-0 bg-[#020817]/70 backdrop-blur-sm transition ${openMobileMenu ? "opacity-100" : "opacity-0"
                        }`}
                    aria-label="Đóng menu"
                />

                <div
                    className={`surface-card absolute right-0 top-0 h-full w-[88%] max-w-sm rounded-l-[2rem] p-5 transition-transform duration-300 ${openMobileMenu ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="mb-8 flex items-start justify-between gap-3">
                        <Image src="/imgs/removed_bg.png" alt="LaviTopup" width={260} height={92} className="h-auto w-[86px] object-contain sm:w-[102px]" />
                        <button
                            type="button"
                            onClick={closeMobileMenu}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white"
                            aria-label="Đóng"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    <div className="space-y-2">{navItems.map((item) => renderNavItem(item, true))}</div>

                    <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#53e5c6]">Ví của bạn</p>
                        <p className="mt-2 text-2xl font-black text-white">{formatBalance(balance)} VND</p>
                        <p className="mt-1 text-sm text-[#9db3d8]">Điều hướng nhanh tới nạp tiền và tài khoản.</p>
                    </div>

                    {username ? (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <Link
                                href="/account/don-hang"
                                onClick={closeMobileMenu}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-[#cfe0f7] transition hover:bg-white/[0.08]"
                            >
                                <FiClock size={13} className="shrink-0 text-[#53e5c6]" />
                                <span className="truncate">Lịch sử đơn hàng</span>
                            </Link>
                            <Link
                                href="/account/lich-su"
                                onClick={closeMobileMenu}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-[#cfe0f7] transition hover:bg-white/[0.08]"
                            >
                                <FiActivity size={13} className="shrink-0 text-[#53e5c6]" />
                                <span className="truncate">Biến động số dư</span>
                            </Link>
                        </div>
                    ) : null}

                    <div className="mt-6 space-y-2">
                        <button
                            type="button"
                            onClick={goWallet}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff8456] px-4 py-3 text-sm font-bold text-[#08111f]"
                        >
                            <RiWallet3Line />
                            Nạp tiền
                        </button>

                        {username ? (
                            <>
                                <Link
                                    href="/account"
                                    onClick={closeMobileMenu}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white"
                                >
                                    <FiUser />
                                    Trang tài khoản
                                </Link>
                                <button
                                    type="button"
                                    onClick={logoutHandler}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ff8456]/30 bg-[#ff8456]/10 px-4 py-3 text-sm font-semibold text-[#ffb395]"
                                >
                                    <FiLogOut />
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/auth/login"
                                    onClick={closeMobileMenu}
                                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-white"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/auth/register"
                                    onClick={closeMobileMenu}
                                    className="rounded-2xl bg-[#53e5c6] px-4 py-3 text-center text-sm font-semibold text-[#07142d]"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
