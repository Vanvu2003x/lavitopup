"use client";

import Link from "next/link";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="flex flex-col items-center text-center space-y-6 z-10 animate-[fadeIn_0.5s_ease-out]">
                {/* 404 Number */}
                <div className="relative">
                    <h1 className="text-[120px] sm:text-[180px] font-black leading-none bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent select-none drop-shadow-sm">
                        404
                    </h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 blur-3xl opacity-20 -z-10 rounded-full"></div>
                </div>

                {/* Message */}
                <div className="space-y-3 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 text-gray-800 text-xl md:text-2xl font-bold uppercase tracking-wide">
                        <FaExclamationTriangle className="text-amber-500 animate-pulse" />
                        <span>Trang không tồn tại</span>
                    </div>
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed">
                        Oops! Có vẻ như bạn đang lạc vào một vùng không gian chưa được khai phá.
                        Đường dẫn này không tồn tại hoặc đã bị xóa.
                    </p>
                </div>

                {/* Action Button */}
                <Link
                    href="/"
                    className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full overflow-hidden hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FaHome className="text-white/90 text-lg group-hover:scale-110 transition-transform" />
                    <span className="font-bold tracking-wide">
                        Trở về trang chủ
                    </span>
                </Link>
            </div>

            {/* Footer decoration */}
            <div className="absolute bottom-8 text-gray-400 text-xs font-mono tracking-widest opacity-60">
                ERROR CODE: 404_NOT_FOUND
            </div>
        </div>
    );
}
