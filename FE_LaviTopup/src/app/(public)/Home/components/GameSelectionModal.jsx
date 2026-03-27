"use client";

import { FaShoppingCart, FaKey, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GameSelectionModal({ game, isOpen, onClose }) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnimate(true);
            document.body.style.overflow = 'hidden';
        } else {
            setAnimate(false);
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative w-full max-w-2xl bg-[#1E293B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-300 ${animate ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}>

                {/* Header */}
                <div className="relative h-48 sm:h-64">
                    <img
                        src={game?.thumbnail?.startsWith('http') ? game.thumbnail : (game?.thumbnail ? `${process.env.NEXT_PUBLIC_API_URL}${game.thumbnail}` : '/placeholder.jpg')}
                        alt={game?.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] to-transparent"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        <FaTimes />
                    </button>

                    <div className="absolute bottom-6 left-6 right-6">
                        <h2 className="text-3xl font-black text-white mb-2 leading-tight drop-shadow-md">{game?.name}</h2>
                        <p className="text-gray-300 text-sm">Bạn muốn thực hiện dịch vụ gì cho game này?</p>
                    </div>
                </div>

                {/* Options */}
                <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Top-up Option */}
                    <Link
                        href={`/categories/topup/${game?.gamecode}`}
                        className="group relative overflow-hidden rounded-2xl bg-[#0F172A] border border-white/5 hover:border-indigo-500/50 p-6 flex flex-col items-center text-center transition-all hover:bg-[#162032] hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20"
                    >
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-2xl mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                            <FaKey />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Nạp Game</h3>
                        <p className="text-gray-500 text-xs group-hover:text-gray-400">Nạp thẻ, tiền tệ game (Login/UID)</p>
                    </Link>

                    {/* Buy Account Option */}
                    <Link
                        href={`/acc/${game?.gamecode}`}
                        className="group relative overflow-hidden rounded-2xl bg-[#0F172A] border border-white/5 hover:border-purple-500/50 p-6 flex flex-col items-center text-center transition-all hover:bg-[#162032] hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20"
                    >
                        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-2xl mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <FaShoppingCart />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Mua Nick</h3>
                        <p className="text-gray-500 text-xs group-hover:text-gray-400">Mua tài khoản game giá rẻ</p>
                    </Link>

                </div>
            </div>
        </div>
    );
}
