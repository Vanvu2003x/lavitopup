"use client";

import { FiArrowRight } from "react-icons/fi";

const baseURLAPI = process.env.NEXT_PUBLIC_API_URL;

export default function StickyBottomBar({
    selectedPkg,
    selectedPaymentMethod,
    handleBuyNow,
    game,
    canCheckout,
}) {
    const formatPrice = (price) => `${new Intl.NumberFormat("vi-VN").format(Number(price) || 0)} VNĐ`;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#06101f]/92 backdrop-blur-xl">
            <div className="mx-auto max-w-[1280px] px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="glass-panel flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
                            {selectedPkg ? (
                                <img
                                    src={
                                        selectedPkg.thumbnail
                                            ? selectedPkg.thumbnail.startsWith("http")
                                                ? selectedPkg.thumbnail
                                                : baseURLAPI + selectedPkg.thumbnail
                                            : "/imgs/removed_bg.png"
                                    }
                                    alt={selectedPkg.package_name}
                                    className="h-9 w-9 object-contain"
                                    onError={(event) => {
                                        event.target.onerror = null;
                                        event.target.src = "/imgs/removed_bg.png";
                                    }}
                                />
                            ) : (
                                <img src="/imgs/removed_bg.png" alt="LaviTopup" className="h-9 w-9 object-contain" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5eead4]">Đơn đang chọn</p>
                            <p className="truncate text-sm font-semibold text-white">
                                {selectedPkg ? selectedPkg.package_name : `Chọn gói nạp cho ${game?.name || "game"}`}
                            </p>
                            <p className="truncate text-xs text-[#9fb8db]">
                                {selectedPaymentMethod ? `Thanh toán bằng ${selectedPaymentMethod.label}` : "Thanh toán bằng ví"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:text-right">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fa9cb]">Tổng tiền</p>
                            <p className="mt-1 text-xl font-extrabold text-white">{selectedPkg ? formatPrice(selectedPkg.price) : "--"}</p>
                        </div>

                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={!canCheckout}
                            className={`flex h-[3.25rem] items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition sm:min-w-[220px] ${canCheckout
                                    ? "bg-[#5eead4] text-[#04151f] shadow-[0_10px_30px_rgba(94,234,212,0.25)] hover:bg-[#7af5e1]"
                                    : "cursor-not-allowed border border-white/10 bg-white/[0.05] text-[#7f9fce]"
                                }`}
                        >
                            <span>Xác nhận nạp</span>
                            <FiArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
