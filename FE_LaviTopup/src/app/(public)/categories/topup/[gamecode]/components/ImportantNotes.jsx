import { FiAlertCircle } from "react-icons/fi";

const isMlbbGame = (game) => {
    const text = `${game?.gamecode || ""} ${game?.name || ""} ${game?.custom_name || ""}`.toLowerCase();
    return /\b(mlbb|mobile\s*legends?|mobilelegends)\b/i.test(text);
};

export default function ImportantNotes({ rechargeMethod, game }) {
    const showMlbbNotice = isMlbbGame(game);

    return (
        <section className="surface-card rounded-3xl p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#fb7185]/12 text-[#fda4af]">
                    <FiAlertCircle size={14} />
                </div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#fda4af]">Lưu ý</p>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-white/90">
                {showMlbbNotice ? (
                    <div className="rounded-[1.25rem] border border-slate-200/70 bg-[#f6f8fc] px-4 py-4 text-slate-700 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#1d4ed8]">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#60a5fa]/25 bg-[#eff6ff] text-[#2563eb]">
                                i
                            </span>
                            <span>Lưu ý</span>
                        </div>

                        <div className="mt-3 space-y-3 text-base font-semibold leading-8 text-[#dc2626]">
                            <p>LƯU Ý CỰC QUAN TRỌNG: Bạn cần phải login đúng bản quốc tế trước, rồi mới lên web bấm nạp.</p>
                            <p>Sau khi nạp thành công, bạn có thể login lại bản Việt.</p>
                            <p>Nếu chưa login bản quốc tế, đơn sẽ tự động hoàn tiền.</p>
                        </div>

                        <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                            <p>Để tải bản Quốc Tế, bạn chuyển vùng Store sang Indo.</p>
                            <p>Gõ MLBB sẽ ra bản Moonton.</p>
                        </div>
                    </div>
                ) : null}

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
