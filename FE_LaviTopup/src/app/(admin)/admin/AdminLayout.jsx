"use client";
import Header from "@/components/admin/header";
import Nav from "@/components/admin/navigation";
import { useState, useEffect } from "react";
import { getRole } from "@/services/auth.service";
import { toast } from "react-toastify";

export default function AdminLayout({ children }) {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkRole() {
            try {
                // Token is passed via cookie automatically
                // getRole should be updated to not expect token arg if it did.
                // I updated getRole service previously to not use token arg.

                const res = await getRole();
                if (res.role !== "admin") {
                    toast.error("Bạn không có quyền truy cập");
                    window.location.href = "/";
                    return;
                }

                setLoading(false); // ✅ chỉ admin mới tới đây
            } catch (err) {
                toast.error("Không xác thực được quyền"); // Likely 401 or 403
                window.location.href = "/";
            }
        }
        checkRole();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0F172A]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin"></div>
                    <p className="text-slate-400 animate-pulse">Đang kiểm tra quyền truy cập...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-cyan-500/30">
            <Header onToggleNav={() => setIsNavOpen(!isNavOpen)} />

            <div className="flex h-screen pt-16 overflow-hidden">
                {/* Sidebar Overlay for Mobile */}
                {isNavOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
                        onClick={() => setIsNavOpen(false)}
                    ></div>
                )}

                <aside
                    className={`fixed md:static top-16 left-0 h-[calc(100vh-4rem)] w-72 z-40 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]
                        ${isNavOpen ? "translate-x-0" : "-translate-x-full"}
                        md:translate-x-0 bg-[#0F172A]`}
                >
                    <Nav />
                </aside>

                <main className="flex-1 h-full overflow-y-auto bg-[#0F172A] relative">
                    {/* Background decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-900/20 via-slate-900/0 to-transparent pointer-events-none"></div>

                    <div className="p-6 md:p-8 max-w-7xl mx-auto relative z-10 min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
