'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logout } from '@/services/auth.service';
import {
    FiHome,
    FiGrid,
    FiPackage,
    FiUser,
    FiDollarSign,
    FiChevronDown,
    FiChevronRight,
    FiMonitor,
    FiFolder,
    FiArchive,
    FiCreditCard,
    FiClipboard,
    FiLogOut,
} from 'react-icons/fi';
import { FaGamepad } from 'react-icons/fa';

export default function Nav() {
    const [openMenus, setOpenMenus] = useState({
        category: true, // Default open for better UX
        orders: false
    });
    const router = useRouter();
    const pathname = usePathname();

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menu]: !prev[menu],
        }));
    };

    const handleLogout = async () => {
        try {
            await Logout();
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            window.location.href = "/login";
        }
    };

    const isActive = (path) => pathname === path;

    const NavItem = ({ href, icon: Icon, label }) => (
        <Link
            href={href}
            className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${isActive(href)
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}
            `}
        >
            <Icon size={20} className={isActive(href) ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300 transition-colors"} />
            <span>{label}</span>
            {isActive(href) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>}
        </Link>
    );

    const SubItem = ({ href, icon: Icon, label }) => (
        <Link
            href={href}
            className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ml-2 border-l-2
                ${isActive(href)
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                    : "border-slate-700 text-slate-500 hover:text-slate-300 hover:bg-white/5 hover:border-slate-500"}
            `}
        >
            <Icon size={16} />
            <span>{label}</span>
        </Link>
    );

    return (
        <nav className="h-full bg-[#0F172A] border-r border-white/5 flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                <NavItem href="/admin" icon={FiHome} label="Tổng quan" />

                {/* Separator */}
                <div className="h-px bg-white/5 my-4 mx-2"></div>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quản lý</div>

                {/* Danh mục Group */}
                <div className="space-y-1">
                    <button
                        onClick={() => toggleMenu('category')}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                            ${openMenus['category'] ? "text-slate-200 bg-white/5" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}
                        `}
                    >
                        <FiGrid size={20} className={openMenus['category'] ? "text-indigo-400" : "text-slate-500"} />
                        <span>Danh mục</span>
                        {openMenus['category'] ? <FiChevronDown className="ml-auto text-slate-500" /> : <FiChevronRight className="ml-auto text-slate-600" />}
                    </button>

                    <div className={`space-y-1 pl-2 overflow-hidden transition-all duration-300 ${openMenus['category'] ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                        <SubItem href="/admin/danhmuc/GameManagerPage" icon={FaGamepad} label="Quản lý Game" />
                        <SubItem href="/admin/danhmuc/ToUpPackageManagerPage" icon={FiPackage} label="Gói nạp" />
                        <SubItem href="/admin/danhmuc/AccManagerPage" icon={FiMonitor} label="Acc Game" />
                    </div>
                </div>

                {/* Giao dịch Group */}
                <div className="space-y-1 mt-2">
                    <button
                        onClick={() => toggleMenu('orders')}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                            ${openMenus['orders'] ? "text-slate-200 bg-white/5" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}
                        `}
                    >
                        <FiArchive size={20} className={openMenus['orders'] ? "text-emerald-400" : "text-slate-500"} />
                        <span>Giao dịch</span>
                        {openMenus['orders'] ? <FiChevronDown className="ml-auto text-slate-500" /> : <FiChevronRight className="ml-auto text-slate-600" />}
                    </button>

                    <div className={`space-y-1 pl-2 overflow-hidden transition-all duration-300 ${openMenus['orders'] ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                        <SubItem href="/admin/danhmuc/WalletManagerPage" icon={FiCreditCard} label="Lịch sử Nạp ví" />
                        <SubItem href="/admin/danhmuc/ToUpManagerPage" icon={FiClipboard} label="Quản lý Đơn hàng" />
                        <SubItem href="/admin/danhmuc/AccSellingPage" icon={FiUser} label="Đơn Bán acc" />
                    </div>
                </div>

                {/* Others */}
                <div className="h-px bg-white/5 my-4 mx-2"></div>
                <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hệ thống</div>

                <NavItem href="/admin/danhmuc/UserManagerPage" icon={FiUser} label="Khách hàng" />
                <NavItem href="/admin/danhmuc/RevenueManagerPage" icon={FiDollarSign} label="Doanh thu" />
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-900/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-bold border border-red-500/20"
                >
                    <FiLogOut size={18} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </nav>
    );
}
