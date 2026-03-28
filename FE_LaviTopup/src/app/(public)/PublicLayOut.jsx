"use client";

import { FaFacebookF } from "react-icons/fa";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function PublicLayout({ children }) {
    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-[-12rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#53e5c6]/8 blur-[120px]" />
                <div className="absolute right-[-12rem] top-[14rem] h-[30rem] w-[30rem] rounded-full bg-[#8b5cf6]/10 blur-[140px]" />
                <div className="absolute bottom-[-14rem] left-[10%] h-[26rem] w-[26rem] rounded-full bg-[#6ab9ff]/8 blur-[120px]" />
                <div className="grid-lines absolute inset-0 opacity-40" />
            </div>

            <Header />
            <main className="relative z-10">{children}</main>
            <Footer />

            <div className="fixed bottom-5 right-4 z-50 flex flex-col gap-3 sm:right-6">
                <a
                    href="https://www.facebook.com/messages/e2ee/t/1484722313227044"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-panel flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-1"
                    title="Messenger LaviTopup"
                >
                    <FaFacebookF className="text-[#ff8456]" />
                    <span>Messenger</span>
                </a>
            </div>
        </div>
    );
}
