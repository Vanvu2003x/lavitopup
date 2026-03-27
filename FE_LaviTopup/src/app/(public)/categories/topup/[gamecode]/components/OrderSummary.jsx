import React from "react";
import { FiGlobe, FiZap } from "react-icons/fi";

const baseURLAPI = process.env.NEXT_PUBLIC_API_URL;

export default function OrderSummary({
    game,
    selectedPkg,
    rechargeMethod,
    uid,
    username,
    server,
    handleBuyNow,
}) {
    return (
        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
            <div className="lg:sticky lg:top-8 space-y-6">
                {/* Card Details */}
                <div className="bg-gradient-to-br from-[#0f172a]/95 via-[#1e293b]/90 to-[#0f172a]/95 backdrop-blur-xl rounded-3xl border border-cyan-500/30 p-6 shadow-[0_8px_32px_rgba(6,182,212,0.15)] relative overflow-hidden group">
                    {/* Enhanced Decor */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-600/15 to-cyan-500/15 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700"></div>

                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

                    {/* Header with Game Image */}
                    <div className="relative h-36 rounded-2xl overflow-hidden mb-6 border border-white/10 group/img shadow-lg shadow-cyan-500/10">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/95 via-[#0f172a]/40 to-transparent z-10"></div>
                        <img
                            src={game?.thumbnail?.startsWith('http') ? game.thumbnail : (game ? baseURLAPI + game.thumbnail : "/imgs/image.png")}
                            className="w-full h-full object-cover transition-all duration-700 group-hover/img:scale-110 group-hover/img:brightness-110"
                            alt="Game Cover"
                        />
                        <div className="absolute bottom-4 left-4 z-20">
                            <h3 className="text-xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-1">
                                {game?.name || "Loading..."}
                            </h3>
                            <p className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5 bg-cyan-500/20 backdrop-blur-sm px-2 py-1 rounded-full w-fit border border-cyan-400/30">
                                <FiGlobe size={11} /> Máy chủ quốc tế
                            </p>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-5 text-sm mb-6">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <span className="text-slate-400 font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                                Tài khoản
                            </span>
                            <span className="text-white font-semibold truncate max-w-[150px] text-right">
                                {rechargeMethod === "uid"
                                    ? uid || "Chưa nhập"
                                    : username || "Chưa nhập"}
                                {server && (
                                    <span className="text-slate-500 block text-xs font-normal mt-0.5">
                                        Server: {server}
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <span className="text-slate-400 font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                Gói nạp
                            </span>
                            <span className="text-cyan-300 font-bold text-right ml-4">
                                {selectedPkg ? selectedPkg.package_name : "Chưa chọn"}
                            </span>
                        </div>
                    </div>

                    {/* Total - Enhanced */}


                    {/* Button - Enhanced */}
                    <button
                        onClick={handleBuyNow}
                        disabled={!selectedPkg}
                        className={`
                            w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 text-base
                            ${selectedPkg
                                ? "bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-blue-500 shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:shadow-[0_6px_30px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] text-white"
                                : "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/10"
                            }
                        `}
                    >
                        {selectedPkg ? (
                            <>
                                <FiZap className="animate-pulse" />
                                THANH TOÁN NGAY
                            </>
                        ) : (
                            <>
                                Chọn gói để tiếp tục
                            </>
                        )}
                    </button>

                    <p className="text-[10px] text-center text-slate-500 mt-4 flex items-center justify-center gap-1">
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        Đã bao gồm thuế và phí dịch vụ
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    </p>
                </div>
            </div>
        </div>
    );
}
