"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RiGamepadLine, RiShoppingCart2Line, RiLogoutBoxRLine, RiWallet3Line, RiUser3Line, RiHome4Line, RiUserSettingsLine } from "react-icons/ri";
import { useToast } from "@/components/ui/Toast";

export default function Navigation({ className = "flex-col", onLinkClick, userInfo, onLogout, firstGameCode, onOpenTopup }) {
    const pathname = usePathname();
    const router = useRouter();
    const toast = useToast();

    const isActive = (path) => pathname === path;

    const getItemClass = (path, isHighlight = false) => {
        const active = isActive(path);
        const baseClass = "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 w-full font-bold";

        if (isHighlight) {
            return `${baseClass} ${active
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
                : "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100"
                }`;
        }

        return `${baseClass} ${active
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
            : "text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 bg-transparent"
            }`;
    };

    return (
        <div className={`flex flex-col w-full h-full gap-4 ${className}`}>

            {/* 1. Main Navigation Links (Top) */}
            <div className="flex flex-col w-full px-2 gap-2">
                {/* Home Link - Top */}
                <Link href="/" className={getItemClass("/")} onClick={onLinkClick}>
                    <RiHome4Line className="text-xl mb-0.5" />
                    <span>Trang chủ</span>
                </Link>

                {/* Highlighted Links */}
                <button
                    onClick={() => {
                        if (firstGameCode) {
                            onLinkClick && onLinkClick();
                            router.push(`/categories/topup/${firstGameCode}`);
                        } else {
                            toast.error("Hiện tại chưa có game nào khả dụng.");
                        }
                    }}
                    className={getItemClass(firstGameCode ? `/categories/topup/${firstGameCode}` : "#", true)}
                >
                    <RiGamepadLine className={`text-xl mb-0.5 ${(firstGameCode && isActive(`/categories/topup/${firstGameCode}`)) ? "animate-bounce" : ""}`} />
                    <span>Nạp Game</span>
                </button>

                <a href="https://shopgenshin24h.com/" target="_blank" className={getItemClass("/categories/acc", true)} onClick={onLinkClick}>
                    <RiShoppingCart2Line className={`text-xl mb-0.5 ${isActive("/categories/acc") ? "animate-bounce" : ""}`} />
                    <span>Mua Tài Khoản</span>
                </a>


            </div>

            {/* Spacer */}
            <div className="flex-1 min-h-[20px]"></div>

            {/* 2. User Info / Auth Section (Bottom) */}
            <div className="border-t border-gray-100 pt-4 w-full mt-auto mb-2">
                {userInfo ? (
                    <div className="flex flex-col gap-3 px-2">
                        {/* User Avatar & Name & Balance */}
                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4 border border-cyan-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                    {userInfo.username?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 leading-tight">{userInfo.username}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                        <RiUser3Line className="text-[10px]" />
                                        <span>Thành viên</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-3 border border-gray-100/50 shadow-sm flex flex-col items-center text-center">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Số dư ví</span>
                                <span className="text-xl font-black text-cyan-600">
                                    {parseInt(userInfo.balance || 0).toLocaleString()} <span className="text-xs text-gray-400 font-bold">VNĐ</span>
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    onOpenTopup && onOpenTopup();
                                }}
                                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <RiWallet3Line className="text-lg" />
                                Nạp tiền vào ví
                            </button>

                            <Link
                                href="/account"
                                onClick={onLinkClick}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-sm transition-colors border border-gray-100"
                            >
                                <RiUserSettingsLine className="text-lg" />
                                Thông tin tài khoản
                            </Link>

                            <button
                                onClick={() => {
                                    onLinkClick && onLinkClick();
                                    onLogout && onLogout();
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 font-bold text-sm transition-colors border border-red-100"
                            >
                                <RiLogoutBoxRLine className="text-lg" />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-cyan-50 rounded-xl p-4 text-center border border-cyan-100 flex flex-col gap-3 px-2">
                        <p className="text-sm text-gray-500 font-medium">Vui lòng đăng nhập để tiếp tục</p>
                        <Link
                            href="/auth/login"
                            onClick={onLinkClick}
                            className="py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-bold transition-all text-center block shadow-sm"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/auth/register"
                            onClick={onLinkClick}
                            className="py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all text-center block"
                        >
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
