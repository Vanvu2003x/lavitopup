"use client";

import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiShield, FiZap } from "react-icons/fi";

const benefits = [
    {
        title: "Nap tu dong",
        description: "Tao don nhanh, thao tac gon va de theo doi tren he thong.",
        icon: FiZap,
        iconColor: "text-[#ff8456]",
    },
    {
        title: "Nhieu game",
        description: "Danh sach game hien thi ro rang de ban chon nhanh hon.",
        icon: FiCheckCircle,
        iconColor: "text-[#53e5c6]",
    },
    {
        title: "Ho tro nhanh",
        description: "Co the lien he ngay khi can kiem tra don hang hoac thong tin nap.",
        icon: FiShield,
        iconColor: "text-[#6ab9ff]",
    },
];

const quickSteps = ["Tim game muon nap", "Nhap ID nhan vat", "Chon goi va thanh toan"];

export default function HeroSection() {
    return (
        <section className="glass-panel relative overflow-hidden rounded-[2.6rem] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-8rem] top-[-6rem] h-64 w-64 rounded-full bg-[#53e5c6]/14 blur-[100px]" />
                <div className="absolute right-[-7rem] top-[3rem] h-64 w-64 rounded-full bg-[#6ab9ff]/12 blur-[100px]" />
            </div>

            <div className="relative z-10">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                    <div className="rise-up">
                        <div className="overflow-hidden rounded-[2.1rem] border border-white/5 shadow-2xl">
                            <img
                                src="/banner/logo.png"
                                alt="Banner game LaviTopup"
                                className="w-full object-cover transition duration-700 hover:scale-105 sm:min-h-[300px] lg:min-h-[360px]"
                            />
                        </div>
                    </div>

                    <div className="rise-up" style={{ animationDelay: "120ms" }}>
                        <div className="glass-panel overflow-hidden rounded-[1.8rem] p-5 sm:p-6">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#53e5c6]">Chi can 3 buoc</p>
                            <div className="mt-4 space-y-3">
                                {quickSteps.map((item, index) => (
                                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.08]">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#53e5c6]/20 text-sm font-black text-[#53e5c6]">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm font-semibold text-white/90">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="#danh-muc-game"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#53e5c6] px-6 py-3.5 text-sm font-bold text-[#07142d] shadow-[0_0_20px_rgba(83,229,198,0.25)] transition hover:scale-105 hover:bg-[#6ff0d5] hover:shadow-[0_0_30px_rgba(83,229,198,0.4)]"
                            >
                                Xem danh sach game
                                <FiArrowRight size={16} />
                            </Link>
                            <a
                                href="#giao-dien"
                                className="inline-flex items-center justify-center rounded-full border border-white/5 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-white transition hover:scale-105 hover:bg-white/[0.06]"
                            >
                                Xem cach nap
                            </a>
                        </div>
                    </div>
                </div>

                <div className="rise-up mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" style={{ animationDelay: "180ms" }}>
                    {benefits.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="surface-card rounded-[1.7rem] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#53e5c6]/30 sm:p-6"
                            >
                                <Icon className={item.iconColor} size={24} />
                                <p className="mt-4 text-base font-bold text-white sm:text-lg">{item.title}</p>
                                <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-[#9eb5d8]">{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
