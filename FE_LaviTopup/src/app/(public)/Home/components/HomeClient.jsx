"use client";

import { useEffect, useState } from "react";
import { FaFacebookF } from "react-icons/fa";
import { FiArrowRight, FiCheckCircle, FiSearch } from "react-icons/fi";

import { getGames } from "@/services/games.service";

import CardGame from "./CardGame";
import HeroSection from "./HeroSection";

const supportLinks = [
    {
        title: "Messenger",
        description: "Lien he truc tiep de kiem tra don hang hoac nhan ho tro nhanh.",
        href: "https://www.facebook.com/messages/e2ee/t/1484722313227044",
        icon: FaFacebookF,
        iconWrapper: "bg-[#ff8456]/12 text-[#ff8456]",
    },
];

const topupNotes = [
    "Chon game phu hop tu danh sach dang hien thi.",
    "Di toi trang nap de nhap dung thong tin nhan vat.",
    "Chon goi va hoan tat thanh toan ngay tren giao dien.",
];

const sectionLabelClass = "font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#53e5c6]";
const sectionTitleClass = "mt-2 font-sans text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl";
const cardTitleClass = "mt-2 font-sans text-[1.7rem] font-bold tracking-[-0.02em] text-white";
const sectionTextClass = "mt-3 max-w-2xl font-sans text-sm leading-7 text-[#a8c0e4]";

export default function HomeClient({ games: initialGames = [] }) {
    const [games, setGames] = useState(initialGames);
    const [loading, setLoading] = useState(initialGames.length === 0);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchGames = async () => {
            try {
                setLoading(true);
                const data = await getGames();
                setGames(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Khong the tai danh sach game:", error);
                if (initialGames.length > 0) {
                    setGames(initialGames);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [initialGames]);

    const filteredGames = games.filter((game) => {
        if (!searchTerm.trim()) {
            return true;
        }

        const query = searchTerm.toLowerCase();
        const gameName = String(game?.name || "").toLowerCase();
        const publisher = String(game?.publisher || "").toLowerCase();

        return gameName.includes(query) || publisher.includes(query);
    });

    return (
        <section className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="mx-auto max-w-[1360px] space-y-8 lg:space-y-10">
                <HeroSection />

                <section id="danh-muc-game" className="surface-card scroll-mt-28 rounded-[2.5rem] p-6 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className={sectionLabelClass}>Danh sach game</p>
                            <h2 className={sectionTitleClass}>Chon game ban muon nap</h2>
                            <p className={sectionTextClass}>Tim theo ten game hoac nha phat hanh. Bam vao game de di toi trang nap tien.</p>
                        </div>

                        <div className="relative w-full lg:max-w-sm">
                            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#86a6d7]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Tim ten game..."
                                className="h-[3.25rem] w-full rounded-2xl border border-white/5 bg-white/[0.02] pl-11 pr-4 text-sm font-medium text-white outline-none transition-all placeholder:text-[#8aa7d5] focus:border-[#53e5c6]/50 focus:bg-white/[0.04] focus:shadow-[0_0_20px_rgba(83,229,198,0.15)]"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white">
                            Tong game: <span className="text-[#53e5c6]">{games.length}</span>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white">
                            Dang hien thi: <span className="text-[#ff8456]">{filteredGames.length}</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        {loading ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {[...Array(8)].map((_, index) => (
                                    <div key={index} className="surface-card h-[280px] animate-pulse rounded-[2rem] border border-white/10" />
                                ))}
                            </div>
                        ) : filteredGames.length === 0 ? (
                            <div className="rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-14 text-center">
                                <FiSearch className="mx-auto text-[#53e5c6]" size={28} />
                                <p className="mt-4 font-sans text-xl font-bold text-white">Khong tim thay game phu hop</p>
                                <p className="mt-2 font-sans text-sm text-[#9fb7da]">Thu tim bang tu khoa khac de xem them ket qua.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {filteredGames.map((game) => (
                                    <CardGame key={game.id} game={game} type="TOPUP" />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section id="giao-dien" className="grid scroll-mt-28 gap-6 lg:grid-cols-2">
                    <div className="surface-card rounded-[2.3rem] p-6">
                        <p className={sectionLabelClass}>Can ho tro?</p>
                        <h3 className={cardTitleClass}>Lien he nhanh khi can ho tro</h3>
                        <p className={sectionTextClass}>
                            Neu can kiem tra don hang, xac nhan thong tin hoac can ho tro them, ban co the lien he nhanh qua kenh ben duoi.
                        </p>

                        <div className="mt-5 space-y-3">
                            {supportLinks.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <a
                                        key={item.title}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="glass-panel flex items-center justify-between rounded-[1.6rem] border-transparent px-4 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconWrapper}`}>
                                                <Icon size={18} />
                                            </div>
                                            <div>
                                                <p className="font-sans text-sm font-bold">{item.title}</p>
                                                <p className="font-sans text-xs text-[#9fb7da]">{item.description}</p>
                                            </div>
                                        </div>
                                        <FiArrowRight size={18} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    <div className="surface-card rounded-[2.3rem] p-6">
                        <p className={sectionLabelClass}>Nap game</p>
                        <h3 className={cardTitleClass}>Cac buoc de bat dau nap</h3>
                        <div className="mt-5 space-y-3">
                            {topupNotes.map((item) => (
                                <div
                                    key={item}
                                    className="glass-panel flex items-start gap-3 rounded-[1.5rem] border-transparent px-4 py-4 transition-all hover:border-white/10 hover:bg-white/[0.03]"
                                >
                                    <FiCheckCircle className="mt-0.5 shrink-0 text-[#53e5c6]" size={18} />
                                    <p className="font-sans text-sm leading-6 text-white">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
}
