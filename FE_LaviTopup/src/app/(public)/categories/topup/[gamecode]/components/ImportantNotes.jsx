import { FiAlertCircle } from "react-icons/fi";

export default function ImportantNotes({ rechargeMethod }) {
    return (
        <section className="surface-card rounded-3xl p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#fb7185]/12 text-[#fda4af]">
                    <FiAlertCircle size={14} />
                </div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#fda4af]">Lưu ý</p>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-white/90">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    ✓ Kiểm tra UID, máy chủ
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    ✓ Xử lý nhanh • Hỗ trợ 24/7
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    {rechargeMethod === "login"
                        ? "✓ Không đăng nhập game khi xử lý"
                        : "✓ Dùng ví số dư"}
                </div>
            </div>
        </section>
    );
}
