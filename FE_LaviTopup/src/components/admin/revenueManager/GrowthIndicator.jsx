"use client";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { motion } from "framer-motion";

export default function GrowthIndicator({ value, label, inverted = false }) {
    if (value === null || value === undefined) return null;

    const isPositive = inverted ? value < 0 : value >= 0;
    const color = isPositive ? 'text-emerald-400' : 'text-rose-400';
    const bgColor = isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10';
    const borderColor = isPositive ? 'border-emerald-500/30' : 'border-rose-500/30';
    const Icon = isPositive ? FiTrendingUp : FiTrendingDown;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 ${bgColor} ${borderColor} border px-3 py-1.5 rounded-lg`}
        >
            <Icon className={color} size={16} />
            <div className="flex items-baseline gap-1">
                <span className={`${color} font-bold text-lg`}>
                    {value >= 0 ? '+' : ''}{value.toFixed(1)}%
                </span>
                {label && <span className="text-slate-400 text-xs">{label}</span>}
            </div>
        </motion.div>
    );
}
