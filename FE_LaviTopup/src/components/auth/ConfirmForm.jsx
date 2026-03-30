"use client";

import { createOrder } from "@/services/order.service";
import { useToast } from "@/components/ui/Toast";
import { connectSocket } from "@/services/websocket.service";
import { FiAlertTriangle, FiCheck, FiClock, FiGlobe, FiInfo, FiKey, FiMessageSquare, FiPackage, FiServer, FiShield, FiUser, FiX, FiArrowRight } from "react-icons/fi";
import React from 'react';
import Link from 'next/link';

export default function ConfirmForm({ data, onClick }) {
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [orderResult, setOrderResult] = React.useState(null);

    const formatPrice = (price) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price || 0);

    // Success State UI - Redesigned
    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md"></div>

                {/* Success Modal - Receipt Style */}
                <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
                    {/* Header Pattern */}
                    <div className="h-32 bg-emerald-500 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                            </svg>
                        </div>
                        <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <FiCheck className="text-emerald-500 text-4xl animate-bounceIn" strokeWidth={3} />
                        </div>
                    </div>

                    <div className="px-8 pt-12 pb-8 text-center">
                        <h2 className="text-2xl font-black text-gray-900 mb-1">Thanh toÃƒÂ¡n thÃƒÂ nh cÃƒÂ´ng!</h2>
                        <p className="text-gray-500 font-medium text-sm">Ã„ÂÃ†Â¡n hÃƒÂ ng Ã„â€˜ang Ã„â€˜Ã†Â°Ã¡Â»Â£c xÃ¡Â»Â­ lÃƒÂ½</p>

                        <div className="my-8 relative">
                            {/* Dotted Line */}
                            <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-gray-100"></div>
                        </div>

                        {/* Order Details */}
                        <div className="bg-gray-50 rounded-2xl p-6 space-y-4 text-left">
                            <div className="flex justify-between items-start">
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">GÃƒÂ³i nÃ¡ÂºÂ¡p</span>
                                <span className="text-gray-900 font-bold text-right flex-1 pl-4 leading-tight">{data.package.package_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">GiÃƒÂ¡ tiÃ¡Â»Ân</span>
                                <span className="text-emerald-600 font-black text-lg">{formatPrice(data.package.price)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">TÃƒÂ i khoÃ¡ÂºÂ£n</span>
                                <span className="text-gray-700 font-medium text-sm font-mono truncate max-w-[150px]">{data.uid || data.username}</span>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <FiClock />
                            <span>DÃ¡Â»Â± kiÃ¡ÂºÂ¿n hoÃƒÂ n thÃƒÂ nh: 1-5 phÃƒÂºt</span>
                        </div>

                        {/* Buttons */}
                        <div className="mt-8 space-y-3">
                            <Link
                                href="/account"
                                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                <FiUser /> QuÃ¡ÂºÂ£n lÃƒÂ½ Ã„â€˜Ã†Â¡n hÃƒÂ ng
                            </Link>

                            <button
                                onClick={onClick}
                                className="block w-full py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors text-sm"
                            >
                                Ã„ÂÃƒÂ³ng cÃ¡Â»Â­a sÃ¡Â»â€¢
                            </button>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
                    @keyframes bounceIn {
                        0% { transform: scale(0); opacity: 0; }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .animate-bounceIn {
                        animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    }
                `}</style>
            </div>
        );
    }

    // Normal Confirm UI
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={!isSubmitting ? onClick : undefined}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-[#151021] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

                {/* Header */}
                <div className="p-6 pb-2 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FiShield className="text-purple-500" /> XÃƒÂ¡c nhÃ¡ÂºÂ­n thanh toÃƒÂ¡n
                        </h2>
                        <button
                            onClick={onClick}
                            disabled={isSubmitting}
                            className="text-slate-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 space-y-4 relative z-10 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Package Info Card */}
                    <div className="bg-[#090514] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                            <FiPackage size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-500 font-bold uppercase mb-0.5">GÃƒÂ³i nÃ¡ÂºÂ¡p</div>
                            <div className="text-white font-bold truncate">{data.package.package_name}</div>
                            <div className="text-xs text-blue-400 font-medium bg-blue-500/10 px-1.5 py-0.5 rounded inline-block mt-1">
                                {data.package.package_type}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-500 font-bold uppercase mb-0.5">GiÃƒÂ¡ tiÃ¡Â»Ân</div>
                            <div className="text-green-400 font-bold text-lg">
                                {formatPrice(data.package.price)}
                            </div>
                        </div>
                    </div>

                    {/* Account Info List */}
                    <div className="space-y-3">
                        {data.server && (
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <FiServer className="text-slate-600" /> Server
                                </span>
                                <span className="text-white font-medium">{data.server}</span>
                            </div>
                        )}
                        {data.paymentMethod && (
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <FiShield className="text-slate-600" /> Thanh toÃƒÂ¡n
                                </span>
                                <span className="text-white font-medium">{data.paymentMethod.label}</span>
                            </div>
                        )}
                        {data.idServer && (
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <FiGlobe className="text-slate-600" /> Zone ID
                                </span>
                                <span className="text-white font-medium">{data.idServer}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-slate-400 text-sm flex items-center gap-2">
                                <FiUser className="text-slate-600" /> UID / TÃƒÂ i khoÃ¡ÂºÂ£n
                            </span>
                            <span className="text-white font-medium text-right max-w-[200px] truncate" title={data.uid || data.username}>
                                {data.uid || data.username}
                            </span>
                        </div>

                        {["LOG", "log"].includes(data.package.package_type) && data.password && (
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <FiKey className="text-slate-600" /> MÃ¡ÂºÂ­t khÃ¡ÂºÂ©u
                                </span>
                                <span className="text-white font-medium font-mono">******</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-slate-400 text-sm flex items-center gap-2">
                                <FiMessageSquare className="text-slate-600" /> Zalo
                            </span>
                            <span className="text-white font-medium">{data.zaloNumber}</span>
                        </div>

                        {data.note && (
                            <div className="py-2">
                                <span className="text-slate-400 text-sm flex items-center gap-2 mb-1">
                                    <FiInfo className="text-slate-600" /> Ghi chÃƒÂº
                                </span>
                                <div className="text-slate-300 text-sm bg-white/5 p-2 rounded italic font-medium">
                                    "{data.note}"
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3">
                        <FiAlertTriangle className="text-yellow-500 shrink-0 mt-0.5" />
                        <p className="text-yellow-200 text-xs leading-relaxed">
                            Vui lÃƒÂ²ng kiÃ¡Â»Æ’m tra kÃ¡Â»Â¹ thÃƒÂ´ng tin. Ã„ÂÃ†Â¡n hÃƒÂ ng sÃ¡ÂºÂ½ khÃƒÂ´ng thÃ¡Â»Æ’ hoÃƒÂ n tiÃ¡Â»Ân nÃ¡ÂºÂ¿u bÃ¡ÂºÂ¡n Ã„â€˜iÃ¡Â»Ân sai thÃƒÂ´ng tin nhÃƒÂ¢n vÃ¡ÂºÂ­t.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 flex gap-3 relative z-10">
                    <button
                        onClick={onClick}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-[#1E1730] hover:bg-[#281f3d] text-slate-300 font-bold rounded-xl transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Quay lÃ¡ÂºÂ¡i
                    </button>

                    <button
                        disabled={isSubmitting}
                        onClick={async () => {
                            if (isSubmitting) return;
                            setIsSubmitting(true);
                            const accountInfo = {
                                uid: data.uid,
                                server: data.server,
                                id_server: data.idServer,
                                payment_method: data.paymentMethod?.id || null,
                                payment_method_label: data.paymentMethod?.label || null,
                                zaloNumber: data.zaloNumber,
                                phone: data.zaloNumber,
                                note: data.note || "",
                            };
                            if (data.username) accountInfo.username = data.username;
                            if (data.password) accountInfo.password = data.password;

                            const payload = {
                                package_id: data.package.id,
                                amount: data.package.price,
                                account_info: JSON.stringify(accountInfo),
                            };

                            try {
                                const result = await createOrder(payload);
                                setOrderResult(result);
                                setIsSuccess(true);

                                connectSocket(localStorage.getItem("token"));
                            } catch (error) {
                                const message = error?.response?.data?.message || "TÃ¡ÂºÂ¡o Ã„â€˜Ã†Â¡n hÃƒÂ ng thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i!";
                                toast.error(message);
                                setIsSubmitting(false);
                            }
                        }}
                        className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Ã„Âang xÃ¡Â»Â­ lÃƒÂ½...</span>
                            </>
                        ) : (
                            <>
                                <FiCheck strokeWidth={3} /> XÃƒÂ¡c thÃ¡Â»Â±c & NÃ¡ÂºÂ¡p
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
