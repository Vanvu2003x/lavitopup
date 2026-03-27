"use client";
import { FiUser, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";

const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        currencyDisplay: "code",
        minimumFractionDigits: 0,
    }).format(value).replace('VND', 'đ');
};

export default function TopSourcesWidget({ sources = [], loading = false }) {
    if (loading) {
        return (
            <div className="bg-[#1E293B]/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl h-full">
                <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-amber-400" />
                    Top Nguồn Thu
                </h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-16 bg-slate-700/30 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!sources || sources.length === 0) {
        return (
            <div className="bg-[#1E293B]/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl h-full flex items-center justify-center">
                <p className="text-slate-500">Chưa có dữ liệu</p>
            </div>
        );
    }

    const maxAmount = Math.max(...sources.map(s => s.total_deposited));

    return (
        <div className="bg-[#1E293B]/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl h-full">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-amber-400" />
                Top Nguồn Thu
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sources.map((source, index) => {
                    const percentage = (source.total_deposited / maxAmount) * 100;

                    return (
                        <motion.div
                            key={source.user_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-slate-800/30 hover:bg-slate-800/50 p-3 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all duration-300"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/50 rounded-full flex items-center justify-center">
                                    <span className="text-amber-300 text-xs font-bold">#{index + 1}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-200 font-medium text-sm truncate">{source.name || source.email}</p>
                                    <p className="text-slate-500 text-xs truncate">{source.email}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-amber-300 font-bold text-sm">{formatCurrency(source.total_deposited)}</p>
                                    <p className="text-slate-500 text-xs">{source.transaction_count} giao dịch</p>
                                </div>
                            </div>

                            <div className="relative h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.05 }}
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
