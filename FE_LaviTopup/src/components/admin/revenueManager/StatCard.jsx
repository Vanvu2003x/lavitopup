"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const AnimatedNumber = ({ value, duration = 1000 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            setDisplayValue(Math.floor(progress * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [value, duration]);

    return <span>{displayValue.toLocaleString('vi-VN')}</span>;
};

const TrendIndicator = ({ change, isPositive = true }) => {
    if (change === undefined || change === null) return null;

    const color = isPositive ? (change >= 0 ? 'text-emerald-400' : 'text-rose-400') : (change >= 0 ? 'text-rose-400' : 'text-emerald-400');
    const icon = change >= 0 ? '↑' : '↓';

    return (
        <div className={`flex items-center gap-1 text-sm ${color} font-medium`}>
            <span>{icon}</span>
            <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
    );
};

export default function StatCard({
    title,
    value,
    icon,
    trend,
    trendPositive = true,
    gradient = "from-blue-500/20 to-cyan-500/20",
    iconColor = "text-blue-400",
    borderColor = "border-blue-500/50"
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            className={`group relative bg-gradient-to-br ${gradient} 
                backdrop-blur-xl p-6 rounded-2xl border ${borderColor} shadow-xl
                hover:shadow-2xl hover:border-opacity-100 transition-all duration-300
                overflow-hidden`}
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
                    <h3 className="text-3xl font-bold text-white mb-2">
                        <AnimatedNumber value={value} />
                        <span className="text-sm ml-1 text-slate-400">đ</span>
                    </h3>
                    {trend !== undefined && trend !== null && (
                        <TrendIndicator change={trend} isPositive={trendPositive} />
                    )}
                </div>

                <div className={`${iconColor} opacity-80 group-hover:opacity-100 
                    transition-all duration-300 group-hover:scale-110`}>
                    {icon}
                </div>
            </div>

            {/* Sparkle effect on hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    );
}
