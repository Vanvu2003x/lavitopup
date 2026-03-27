"use client";

import { FiCheckCircle, FiCreditCard, FiShield, FiZap } from "react-icons/fi";

const walletPaymentMethod = {
    id: "wallet-balance",
    label: "Ví số dư",
    description: "Hệ thống sẽ trừ trực tiếp từ số dư tài khoản ngay sau khi bạn xác nhận đơn nạp.",
};

export { walletPaymentMethod };

export default function PaymentMethodGrid() {
    return (
        <section className="surface-card rounded-3xl p-4 sm:p-5">
            <div className="mb-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#5eead4]">Thanh toán</p>
                    <span className="rounded-full border border-[#5eead4]/30 bg-[#5eead4]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5eead4]">
                        Mặc định
                    </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-[#8aa0d0]">
                    Ví số dư • Không chọn cổng
                </p>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <FiCheckCircle size={14} className="shrink-0 text-[#5eead4]" />
                    <span className="text-white/90">Không chọn cổng</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <FiZap size={14} className="shrink-0 text-[#60a5fa]" />
                    <span className="text-white/90">Xác nhận nhanh</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <FiShield size={14} className="shrink-0 text-[#fb7185]" />
                    <span className="text-white/90">Bảo mật</span>
                </div>
            </div>
        </section>
    );
}
