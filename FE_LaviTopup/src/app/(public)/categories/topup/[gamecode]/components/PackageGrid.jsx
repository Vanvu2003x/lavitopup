"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Sparkles, Diamond } from "lucide-react";

const baseURLAPI = process.env.NEXT_PUBLIC_API_URL;

const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price || 0);

export default function PackageGrid({ loading, displayPackages, selectedPkg, setSelectedPkg, userLevel = 1 }) {
    const getDisplayPrice = (pkg, level) => {
        if (pkg.display_price) return pkg.display_price;
        if (!level || level === 1) return pkg.price_basic || pkg.price;
        if (level === 2) return pkg.price_pro || pkg.price;
        if (level === 3) return pkg.price_plus || pkg.price;
        return pkg.price;
    };

    const getOriginalPrice = (pkg) => pkg.origin_price || pkg.price_basic || pkg.price;

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <div
                        key={index}
                        className="relative h-[160px] sm:h-[180px] overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md"
                    >
                        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                        <div className="flex h-full flex-col justify-between p-5">
                            <div className="flex gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-white/5" />
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-4 w-2/3 rounded-full bg-white/5" />
                                    <div className="h-3 w-1/3 rounded-full bg-white/5" />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-end">
                                <div className="space-y-2">
                                    <div className="h-3 w-16 rounded-full bg-white/5" />
                                    <div className="h-6 w-24 rounded-full bg-white/5" />
                                </div>
                                <div className="h-10 w-28 rounded-xl bg-white/5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
                {displayPackages.map((pkg, index) => {
                    const finalPrice = getDisplayPrice(pkg, userLevel);
                    const originalPrice = getOriginalPrice(pkg);
                    const isSelected = selectedPkg?.id === pkg.id;
                    const hasDiscount = Number(originalPrice || 0) > Number(finalPrice || 0);
                    const isHot = pkg.sale || index === 0;

                    return (
                        <motion.button
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                                delay: index * 0.05,
                            }}
                            key={pkg.id}
                            type="button"
                            onClick={() => setSelectedPkg({ ...pkg, price: finalPrice })}
                            className={`group relative flex flex-col overflow-hidden rounded-3xl text-left transition-all duration-500 ease-out focus:outline-none ${isSelected
                                ? "bg-gradient-to-r from-transparent via-white/5 to-transparent scale-[1.02] z-10"
                                : "bg-[#0c1a35]/60 hover:bg-[#11244d]/80 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#53e5c6]/10"
                                }`}
                        >
                            {/* Premium Border Wrapper to allow smooth gradient borders */}
                            <div className={`absolute inset-0 rounded-3xl border-2 transition-colors duration-500 ${isSelected ? "border-[#53e5c6]/80 shadow-[inset_0_0_20px_rgba(83,229,198,0.2)]" : "border-white/10 group-hover:border-white/20"
                                }`} />

                            {/* Active Glow Backdrop */}
                            {isSelected && (
                                <div className="absolute -inset-1 -z-10 animate-pulse rounded-3xl bg-[#53e5c6]/30 blur-xl opacity-70" />
                            )}
                            {/* Subtle hover gradient glow */}
                            <div className="absolute -inset-full z-0 block h-full w-full -rotate-45 transform bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 transition-all duration-700 ease-in-out group-hover:left-[150%] group-hover:opacity-100" />

                            <div className="relative z-10 flex flex-1 flex-col p-3 sm:p-5">
                                {/* Top Badges Area */}
                                <div className="mb-4 flex items-center justify-end gap-2 absolute top-3 right-3 sm:top-4 sm:right-4">
                                    {isHot && (
                                        <div className="flex relative">
                                            <div className="absolute inset-0 animate-ping rounded-full bg-[#ff8456] opacity-30" />
                                            <span className="relative flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff8456] to-[#ff5252] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-[0_2px_10px_rgba(255,132,86,0.5)]">
                                                <Zap className="h-3 w-3 fill-current" />
                                                Hot
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                                    {/* Thumbnail Container */}
                                    <div className="relative flex h-12 w-12 sm:h-[72px] sm:w-[72px] shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-1.5 shadow-inner transition-transform duration-500 group-hover:rotate-[-5deg] group-hover:scale-110">
                                        <img
                                            src={
                                                pkg.thumbnail
                                                    ? pkg.thumbnail.startsWith("http")
                                                        ? pkg.thumbnail
                                                        : baseURLAPI + pkg.thumbnail
                                                    : "/imgs/removed_bg.png"
                                            }
                                            alt={pkg.package_name}
                                            className="h-full w-full object-contain filter drop-shadow-md"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/imgs/removed_bg.png";
                                            }}
                                        />
                                        {/* Optional glow behind icon */}
                                        <div className={`absolute inset-0 -z-10 rounded-2xl opacity-40 blur-md transition-opacity duration-500 ${isSelected ? "bg-[#53e5c6]" : "bg-white/20 group-hover:bg-[#53e5c6]/40"}`} />
                                    </div>

                                    {/* Titles */}
                                    <div className="mt-0 sm:mt-1 flex-1 pr-0 sm:pr-12 w-full">
                                        <h3 className={`line-clamp-2 text-sm sm:text-base font-bold leading-snug tracking-tight transition-colors duration-300 ${isSelected ? "text-transparent bg-clip-text bg-gradient-to-r from-white to-[#53e5c6]" : "text-white/90 group-hover:text-white"}`}>
                                            {pkg.package_name}
                                        </h3>
                                        {hasDiscount && (
                                            <div className="mt-1.5 inline-block rounded-md bg-[#53e5c6]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#53e5c6] uppercase tracking-wide border border-[#53e5c6]/20">
                                                Ưu đãi
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                {/* Bottom Pricing Row */}
                                <div className="mt-auto flex items-end justify-between gap-2 sm:gap-3">
                                    <div className="flex flex-col">
                                        {hasDiscount && (
                                            <span className="text-xs font-semibold text-white/30 line-through decoration-white/20 mb-0.5">
                                                {formatPrice(originalPrice)}
                                            </span>
                                        )}
                                        <div className="flex items-baseline gap-1">
                                            <Diamond className={`h-4 w-4 mb-0.5 transition-colors ${isSelected ? "text-[#53e5c6] fill-[#53e5c6]/30" : "text-[#ff8456] fill-[#ff8456]/20"}`} />
                                            <span className={`text-base sm:text-lg font-black tracking-tighter ${isSelected ? "text-white drop-shadow-[0_0_8px_rgba(83,229,198,0.5)]" : "text-white"}`}>
                                                {formatPrice(finalPrice).replace("₫", "")}
                                            </span>
                                            <span className={`text-[10px] sm:text-xs w-4 font-bold ${isSelected ? "text-[#53e5c6]" : "text-white/50"}`}>
                                                VNĐ
                                            </span>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <div
                                        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl h-9 w-9 transition-all duration-300 ${isSelected
                                            ? "bg-gradient-to-r from-[#53e5c6] to-[#3db299] text-[#04151f] shadow-[0_4px_15px_rgba(83,229,198,0.4)] scale-110"
                                            : "bg-white/5 text-white/80 ring-1 ring-inset ring-white/10 group-hover:bg-white/10 group-hover:text-[#53e5c6] group-hover:ring-[#53e5c6]/30 group-hover:scale-110"
                                            }`}
                                    >
                                        <div className="relative z-10 flex items-center justify-center">
                                            {isSelected ? (
                                                <Check className="h-4 w-4" strokeWidth={2.5} />
                                            ) : (
                                                <Check className="h-3.5 w-3.5" strokeWidth={2} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
