"use client";

import { usePathname } from "next/navigation";
import { Menu, ShieldCheck } from "lucide-react";

const pathMeta = {
    "/admin/dashboard": {
        title: "Tổng quan quản trị",
        description: "Bảng điều khiển tổng hợp cho hệ thống nạp game.",
    },
    "/admin/danhmuc/UserManagerPage": {
        title: "Quản trị khách hàng",
        description: "Theo dõi tài khoản, vai trò và số dư ví.",
    },
    "/admin/danhmuc/GameManagerPage": {
        title: "Quản trị game",
        description: "Quản lý danh mục game và cấu hình lợi nhuận.",
    },
    "/admin/danhmuc/ToUpPackageManagerPage": {
        title: "Quản trị gói nạp",
        description: "Kiểm soát giá bán, khuyến mãi và ảnh minh họa.",
    },
    "/admin/danhmuc/ToUpManagerPage": {
        title: "Quản trị đơn nạp",
        description: "Xử lý đơn hàng và đồng bộ trạng thái giao dịch.",
    },
    "/admin/danhmuc/WalletManagerPage": {
        title: "Quản trị nạp ví",
        description: "Theo dõi, lọc và xử lý các giao dịch nạp tiền vào ví.",
    },
    "/admin/danhmuc/RevenueManagerPage": {
        title: "Quản trị doanh thu",
        description: "Báo cáo doanh thu, lợi nhuận và top đóng góp.",
    },
};

export default function AdminHeader({ onMenuToggle }) {
    const pathname = usePathname();
    const meta =
        pathMeta[pathname] ?? {
            title: "Trang quản trị",
            description: "Không gian điều hành dành cho quản trị viên.",
        };

    return (
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 md:hidden"
                        onClick={onMenuToggle}
                    >
                        <Menu className="h-4.5 w-4.5" />
                    </button>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Bảng quản trị</span>
                        </div>
                        <h1 className="mt-1 truncate text-xl font-semibold text-white sm:text-2xl">{meta.title}</h1>
                        <p className="truncate text-[13px] text-slate-400">{meta.description}</p>
                    </div>
                </div>

                <div className="text-xs text-slate-500">Admin</div>
            </div>
        </header>
    );
}
