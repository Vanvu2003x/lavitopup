"use client";

import { useRouter } from "next/navigation";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { getImageSrc } from "@/utils/imageHelper";

export default function CardGame({ game, type, onClick }) {
    const router = useRouter();

    const handleClick = (selectedGame) => {
        if (onClick) {
            onClick(selectedGame);
            return;
        }

        if (type === "ACC") {
            router.push(`/categories/acc?gamecode=${selectedGame.gamecode}`);
            return;
        }

        router.push(`/categories/topup/${selectedGame.gamecode}`);
    };

    const actionLabel = type === "ACC" ? "Xem tài khoản" : "Nạp ngay";
    const cardLabel = type === "ACC" ? "TÀI KHOẢN" : "NẠP GAME";
    const helperText = type === "ACC" ? "Mở trang xem tài khoản nhanh" : "Mở trang nạp game để tiếp tục";

    return (
        <article
            onClick={() => handleClick(game)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleClick(game);
                }
            }}
            role="button"
            className="surface-card shine-effect group cursor-pointer overflow-hidden rounded-[2rem] p-4 transition-all duration-300 hover:-translate-y-2 hover:border-[#53e5c6]/40 hover:shadow-[0_12px_40px_rgba(83,229,198,0.15)]"
        >
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-[#0b1738]">
                <img
                    src={getImageSrc(game.thumbnail)}
                    onError={(event) => {
                        event.target.onerror = null;
                        event.target.src = "/imgs/removed_bg.png";
                    }}
                    alt={game.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07142d] via-[#07142d]/15 to-transparent" />

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-[#07142d]/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white">
                        {cardLabel}
                    </span>
                    {game.is_hot ? (
                        <span className="rounded-full bg-[#fbbf24] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#07142d]">
                            Hot
                        </span>
                    ) : null}
                    <span className="rounded-full border border-[#53e5c6]/20 bg-[#53e5c6]/12 px-3 py-1 text-[11px] font-bold text-[#53e5c6]">
                        24/7
                    </span>
                </div>
            </div>

            <div className="mt-5">
                <h3 className="line-clamp-2 text-xl font-black leading-tight text-white transition group-hover:text-[#53e5c6]">
                    {game.name}
                </h3>
                <p className="mt-2 line-clamp-1 text-sm text-[#98b3dc]">{game.publisher || "Nhà phát hành đang cập nhật"}</p>

                <div className="mt-4 flex items-center gap-2 text-sm text-[#a8c0e4]">
                    <FiCheckCircle className="shrink-0 text-[#53e5c6]" size={16} />
                    <span>{helperText}</span>
                </div>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#53e5c6]/30 bg-[#53e5c6]/10 px-4 py-2.5 text-sm font-bold text-[#53e5c6] transition-all duration-300 group-hover:border-[#53e5c6] group-hover:bg-[#53e5c6] group-hover:text-[#07142d] group-hover:shadow-[0_0_20px_rgba(83,229,198,0.4)]">
                    {actionLabel}
                    <FiArrowRight size={16} />
                </div>
            </div>
        </article>
    );
}
