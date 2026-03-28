"use client";
import { useEffect, useState } from "react";
import { FaCrown, FaDragon, FaTrophy, FaFire, FaMedal, FaHeadset, FaStar } from "react-icons/fa";
import { FiTrendingUp, FiUsers, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { getLeaderboard, getBestSellers, getQuickStats } from "@/services/statistics.service";
import Link from "next/link";
import { getImageSrc } from "@/utils/imageHelper";

export default function Sidebar() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [quickStats, setQuickStats] = useState({ total_users: 0, total_orders: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lbRes, bsRes, qsRes] = await Promise.all([
                    getLeaderboard(),
                    getBestSellers(),
                    getQuickStats(),
                ]);
                if (lbRes?.data) setLeaderboard(lbRes.data);
                if (bsRes?.data) setBestSellers(bsRes.data);
                if (qsRes?.data) setQuickStats(qsRes.data);
            } catch (error) {
                console.error("Sidebar Data Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3600000);
        return () => clearInterval(interval);
    }, []);

    const maskID = (id) => {
        if (!id) return "***";
        return `${id.substring(0, 3)}***${id.substring(id.length - 2)}`;
    };

    const maskName = (name) => {
        if (!name) return "***";
        if (name.length <= 3) return name.charAt(0) + "***";
        return name.substring(0, 2) + "***" + name.charAt(name.length - 1);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
    };

    if (loading)
        return (
            <aside className="w-full flex flex-col gap-6 animate-pulse">
                <div className="bg-slate-100 h-64 rounded-2xl"></div>
                <div className="bg-slate-100 h-64 rounded-2xl"></div>
            </aside>
        );

    return (
        <aside className="w-full flex flex-col gap-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-center items-center text-center shadow-xl shadow-cyan-100/10 hover:shadow-2xl hover:shadow-cyan-200/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden group/stat">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-white opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-3 group-hover/stat:bg-cyan-100 group-hover/stat:rotate-12 transition-all duration-500 mx-auto shadow-inner border border-white">
                            <FiUsers className="text-cyan-600 text-xl" />
                        </div>
                        <p className="text-xl font-semibold text-slate-800 mb-0.5 group-hover/stat:text-cyan-600 transition-colors">
                            {quickStats.total_users?.toLocaleString() || 0}
                        </p>
                        <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider group-hover/stat:text-cyan-500 transition-colors">Thành Viên</p>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-center items-center text-center shadow-xl shadow-cyan-100/10 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden group/stat">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 group-hover/stat:bg-blue-100 group-hover/stat:-rotate-12 transition-all duration-500 mx-auto shadow-inner border border-white">
                            <FiShoppingBag className="text-blue-600 text-xl" />
                        </div>
                        <p className="text-xl font-semibold text-slate-800 mb-0.5 group-hover/stat:text-blue-600 transition-colors">
                            {quickStats.total_orders?.toLocaleString() || 0}
                        </p>
                        <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider group-hover/stat:text-blue-500 transition-colors">Gói Đã Bán</p>
                    </div>
                </div>
            </div>

            {/* Leaderboard Card */}
            <div className="bg-white rounded-[2rem] p-1 border border-cyan-100 shadow-xl shadow-cyan-100/20 flex flex-col h-full overflow-hidden relative group">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-cyan-200/40 transition-colors duration-700"></div>

                <div className="p-6 pb-2 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center shadow-inner border border-white">
                            <FaDragon className="text-cyan-600 text-xl drop-shadow-sm" />
                        </div>
                        <div>
                            <h3 className="text-slate-800 font-semibold text-sm">Top Cao Thủ</h3>
                            <p className="text-[9px] text-cyan-600 font-medium">Xếp hạng nạp</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-6 space-y-2 relative z-10">
                    {leaderboard.length > 0 ? (
                        leaderboard.slice(0, 5).map((user, index) => {
                            const isTop1 = index === 0;
                            const isTop2 = index === 1;
                            const isTop3 = index === 2;

                            let itemClass = "bg-gray-50/50 border-gray-100 hover:border-cyan-200 hover:bg-white";
                            let numberClass = "bg-white border border-gray-100 text-slate-500 shadow-sm";

                            if (isTop1) {
                                itemClass = "bg-gradient-to-r from-cyan-50 to-white border-cyan-200 shadow-sm shadow-cyan-100/30";
                                numberClass = "bg-white border border-yellow-200 text-yellow-500 shadow-yellow-100/50";
                            } else if (isTop2) {
                                itemClass = "bg-gradient-to-r from-blue-50 to-white border-blue-100";
                                numberClass = "bg-white border border-slate-200 text-slate-400";
                            } else if (isTop3) {
                                itemClass = "bg-gradient-to-r from-sky-50 to-white border-sky-100";
                                numberClass = "bg-white border border-orange-100 text-orange-400";
                            }

                            return (
                                <div
                                    key={user.id}
                                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-300 group/item ${itemClass}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-6 h-6 rounded-md flex items-center justify-center font-medium text-[10px] ${numberClass}`}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-slate-700 font-medium text-[11px] truncate max-w-[100px]">{maskName(user.name)}</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`font-medium text-[11px] ${index < 3 ? 'text-cyan-600' : 'text-slate-500'}`}
                                    >
                                        {formatCurrency(user.total_amount)}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-slate-400 py-6 text-xs font-normal">Chưa có dữ liệu xếp hạng</div>
                    )}
                </div>
            </div>

            {/* Best Sellers */}
            <div className="bg-white rounded-2xl p-1 border border-cyan-100 shadow-lg shadow-cyan-100/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-blue-200/40 transition-colors"></div>

                <div className="p-3 pb-1 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center border border-white">
                            <FaStar className="text-yellow-500 text-[10px]" />
                        </div>
                        <div>
                            <h3 className="text-slate-800 font-medium text-xs">Gói Bán Chạy</h3>
                            <p className="text-[8px] text-orange-500 font-normal">Săn deal hời</p>
                        </div>
                    </div>
                </div>

                <div className="px-2 pb-3 space-y-1 relative z-10">
                    {bestSellers.length > 0 ? (
                        bestSellers.slice(0, 5).map((pack, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-cyan-50/50 transition-all cursor-pointer group/item"
                            >
                                <div className="relative w-7 h-7 rounded-md bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                                    {pack.thumbnail || pack.game_image ? (
                                        <img
                                            src={getImageSrc(pack.thumbnail || pack.game_image)}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/imgs/image.png";
                                            }}
                                            alt={pack.package_name}
                                            className="w-full h-full object-cover group-hover/item:scale-125 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs">💎</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-700 font-normal text-[9px] group-hover/item:text-cyan-600 transition-colors line-clamp-1">
                                        {pack.package_name}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[6px] text-cyan-600 bg-cyan-50 px-1 rounded font-normal">
                                            {pack.game_name || "Game"}
                                        </p>
                                        <p className="text-cyan-600 font-medium text-[9px]">{formatCurrency(pack.price)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-400 py-3 text-[9px]">Chưa có gói bán chạy</div>
                    )}
                </div>
            </div>

            {/* Support CTA */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-6 text-center shadow-xl shadow-slate-900/50 relative overflow-hidden group border border-slate-700/50">
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>

                <div className="relative z-10 py-2">
                    <div className="w-14 h-14 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl backdrop-blur-sm shadow-inner border border-slate-700 group-hover:-translate-y-1 group-hover:rotate-6 transition-all duration-500 ring-2 ring-cyan-500/20">
                        <FaHeadset className="text-cyan-400 drop-shadow-md" />
                    </div>
                    <h3 className="text-white font-semibold text-base mb-1">Hỗ Trợ 24/7</h3>
                    <p className="text-slate-400 text-[11px] mb-4 font-normal">Nạp lỗi? Gặp sự cố? <span className="text-cyan-400 font-medium">Admin xử lý ngay!</span></p>
                    <a
                        href="https://www.facebook.com/messages/e2ee/t/1484722313227044"
                        target="_blank"
                        className="block w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all text-xs shadow-md"
                    >
                        Chat Với Admin
                    </a>
                </div>
            </div>
        </aside>
    );
}
