"use client"
import { BuyAcc } from "@/services/accOrder"
import { useState } from "react"
import { useToast } from "@/components/ui/Toast"
import { FiZap, FiShoppingCart, FiX, FiMaximize2, FiPhone, FiMail, FiMessageSquare, FiEye, FiCheckCircle, FiShield, FiStar } from "react-icons/fi"
import Link from "next/link"
import DOMPurify from "dompurify"

export default function AccCardItem({ acc, userLevel, onBuySuccess }) {
    const toast = useToast()
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
    const [showImageModal, setShowImageModal] = useState(false)
    const [showBuyModal, setShowBuyModal] = useState(false)
    const [buying, setBuying] = useState(false)

    // Calculate Price Logic
    const getFinalPrice = () => {
        const level = Number(userLevel) || 1
        let final = acc.price
        if (level === 2 && acc.price_pro) final = acc.price_pro
        if (level === 3 && acc.price_plus) final = acc.price_plus
        // Basic override if exists (rare)
        if (level === 1 && acc.price_basic) final = acc.price_basic
        return parseInt(final)
    }

    const finalPrice = getFinalPrice()
    const originalPrice = parseInt(acc.price)

    // Parse highlights if string JSON
    let highlights = []
    try {
        if (acc.highlights) {
            highlights = JSON.parse(acc.highlights)
        }
    } catch (e) { }

    const [contactInfo, setContactInfo] = useState({
        phone: "",
        email: "",
        zalo: "",
        note: ""
    })

    const handleChange = (e) => {
        setContactInfo({ ...contactInfo, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        if (!contactInfo.phone || !contactInfo.email || !contactInfo.zalo) {
            toast.error("Vui lòng nhập đầy đủ số điện thoại, email và Zalo")
            return
        }

        const payload = {
            acc_id: acc.id,
            contact_info: {
                phone: contactInfo.phone,
                email: contactInfo.email,
                zalo: contactInfo.zalo,
                note: contactInfo.note || ""
            }
        }

        setBuying(true)
        try {
            await BuyAcc(payload)
            setShowBuyModal(false)
            toast.success("Đặt hàng thành công! Chúng tôi sẽ liên hệ bạn sớm")
            setContactInfo({ phone: "", email: "", zalo: "", note: "" })
            if (onBuySuccess) onBuySuccess()
        } catch (error) {
            toast.error(error.response?.data?.message || "Đặt hàng thất bại")
        } finally {
            setBuying(false)
        }
    }

    return (
        <>
            {/* CARD - New Clean Design */}
            <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all duration-300 overflow-hidden flex flex-col relative">

                {/* Hero Image */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {(() => {
                        let displayImage = acc.image
                        // Safe parse if image is a JSON string of array
                        try {
                            if (displayImage && (displayImage.startsWith('[') || displayImage.startsWith('{'))) {
                                const parsed = JSON.parse(displayImage)
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    displayImage = parsed[0]
                                }
                            }
                        } catch (e) {
                            // Keep original if parse fails
                        }

                        if (displayImage) {
                            const imgSrc = displayImage.startsWith("http")
                                ? displayImage
                                : `${apiBaseUrl}/uploads/${displayImage}`;

                            return (
                                <>
                                    <img
                                        src={imgSrc}
                                        alt={`Acc #${acc.id}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/600x400?text=No+Image"
                                        }}
                                    />
                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-gray-100">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> #{acc.id}
                                    </div>

                                    {finalPrice < originalPrice && (
                                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                                            SAVE {Math.round((1 - finalPrice / originalPrice) * 100)}%
                                        </div>
                                    )}

                                    {/* Quick View Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <button
                                            onClick={() => setShowImageModal(true)}
                                            className="bg-white text-gray-900 hover:bg-cyan-600 hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 shadow-lg"
                                        >
                                            <FiEye size={18} /> Xem ảnh
                                        </button>
                                    </div>
                                </>
                            )
                        } else {
                            return (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 font-medium">
                                    NO IMAGE
                                </div>
                            )
                        }
                    })()}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <Link href={`/acc/detail/${acc.id}`} className="font-bold text-gray-900 leading-tight line-clamp-2 text-base group-hover:text-cyan-600 transition-colors block flex-1">
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(acc.info || `Tài khoản #${acc.id}`) }} />
                        </Link>
                        <div className="shrink-0 flex items-center justify-center bg-cyan-50 text-cyan-600 w-8 h-8 rounded-lg" title="Details">
                            <FiStar size={16} />
                        </div>
                    </div>

                    {/* Stats Row (Simulated from placeholders or logic if needed) */}
                    <div className="flex items-center gap-4 py-3 border-y border-dashed border-gray-100">
                        {/* We can show highlights here if available, else static badges for design */}
                        {highlights.length > 0 ? (
                            <div className="flex gap-2 overflow-hidden">
                                {highlights.slice(0, 2).map((h, i) => (
                                    <div key={i} className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded truncate max-w-[100px]">{h}</div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                    <FiShield className="text-emerald-500" /> Verified
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                    <FiCheckCircle className="text-blue-500" /> Instant
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-1">
                        <div>
                            <p className="text-2xl font-black text-cyan-600">{finalPrice.toLocaleString("vi-VN")} <span className="text-xs font-bold text-gray-400 align-top">VNĐ</span></p>
                            {finalPrice < originalPrice && (
                                <p className="text-xs text-gray-400 line-through">{originalPrice.toLocaleString("vi-VN")} đ</p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowBuyModal(true)}
                            className="bg-gray-50 hover:bg-cyan-600 hover:text-white text-gray-900 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-cyan-500/25"
                        >
                            <FiShoppingCart size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* IMAGE MODAL */}
            {showImageModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
                    onClick={() => setShowImageModal(false)}
                >
                    <button
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-colors"
                        onClick={() => setShowImageModal(false)}
                    >
                        <FiX size={24} />
                    </button>
                    {(() => {
                        let displayImage = acc.image
                        // Safe parse if image is a JSON string of array
                        try {
                            if (displayImage && (displayImage.startsWith('[') || displayImage.startsWith('{'))) {
                                const parsed = JSON.parse(displayImage)
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    displayImage = parsed[0]
                                }
                            }
                        } catch (e) { }

                        const imgSrc = displayImage?.startsWith("http") ? displayImage : `${apiBaseUrl}/uploads/${displayImage}`;
                        return (
                            <img
                                src={imgSrc}
                                alt="Full acc"
                                className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl animate-[scaleIn_0.3s_ease-out]"
                                onClick={(e) => e.stopPropagation()}
                            />
                        )
                    })()}
                </div>
            )}

            {/* BUY MODAL */}
            {showBuyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-[scaleIn_0.3s_ease-out] overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FiShoppingCart className="text-cyan-600" />
                                Đặt mua tài khoản #{acc.id}
                            </h2>
                            <button
                                onClick={() => setShowBuyModal(false)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700">
                                    <FiPhone className="text-cyan-600" />
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={contactInfo.phone}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại của bạn"
                                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700">
                                    <FiMail className="text-cyan-600" />
                                    Email/Facebook <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    value={contactInfo.email}
                                    onChange={handleChange}
                                    placeholder="Nhập email hoặc link Facebook"
                                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700">
                                    <FiMessageSquare className="text-cyan-600" />
                                    Zalo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="zalo"
                                    value={contactInfo.zalo}
                                    onChange={handleChange}
                                    placeholder="Nhập số Zalo để liên hệ"
                                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700">
                                    <FiMessageSquare className="text-cyan-600" />
                                    Ghi chú thêm
                                </label>
                                <textarea
                                    name="note"
                                    value={contactInfo.note}
                                    onChange={handleChange}
                                    placeholder="Lời nhắn cho admin..."
                                    rows="2"
                                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium resize-none"
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={buying}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {buying ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle size={20} />
                                        Xác nhận đặt hàng
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
