"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function PeriodSelector({ value, onChange }) {
    const periods = [
        { id: 'daily', label: 'Ngày' },
        { id: 'weekly', label: 'Tuần' },
        { id: 'monthly', label: 'Tháng' }
    ];

    return (
        <div className="inline-flex items-center gap-1 bg-[#1E293B]/80 backdrop-blur-xl p-1.5 rounded-xl border border-white/10 shadow-lg">
            {periods.map((period) => (
                <button
                    key={period.id}
                    onClick={() => onChange(period.id)}
                    className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                    {value === period.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-lg border border-cyan-400/50"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className={`relative z-10 ${value === period.id ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}>
                        {period.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
