"use client";

import { FaSearch, FaGamepad, FaKey, FaIdCard, FaShoppingCart } from "react-icons/fa";

export const FILTERS = [
    { label: "Tất cả", value: "all", icon: <FaGamepad /> },
    { label: "Mua Nick", value: "ACC", icon: <FaShoppingCart /> },
    { label: "Nạp Login", value: "LOG", icon: <FaKey /> },
    { label: "Nạp UID", value: "UID", icon: <FaIdCard /> },
];

export default function GameFilter({ activeFilter, setActiveFilter, searchTerm, setSearchTerm }) {
    return (
        <div id="games" className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    className="w-full bg-slate-50 text-slate-900 pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 transition-all font-medium text-base"
                    placeholder="Tìm kiếm game..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        ✕
                    </button>
                )}
            </div>


        </div>
    );
}
