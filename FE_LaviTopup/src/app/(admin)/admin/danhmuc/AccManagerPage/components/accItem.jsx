"use client"
import ReactMarkdown from "react-markdown"
import { useState } from "react"
import api from "@/utils/axios"
import { FiTrash2, FiMaximize2, FiDollarSign, FiTag, FiEdit, FiClock, FiCheckCircle } from "react-icons/fi"
import { useToast } from "@/components/ui/Toast"
import DOMPurify from "dompurify"

export default function AccItem({ acc, onDelete, onEdit }) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
    const toast = useToast()
    const [status, setStatus] = useState(acc.status)
    const [showModal, setShowModal] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc muốn xóa account này không?")) return
        setDeleteLoading(true)
        try {
            const token = localStorage.getItem("token")
            await api.delete(`/api/acc/${acc.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success("Xóa tài khoản thành công!")
            if (onDelete) onDelete(acc.id)
        } catch (error) {
            console.error("Lỗi khi xóa account:", error)
            toast.error("Lỗi khi xóa tài khoản: " + (error.response?.data?.message || error.message))
        } finally {
            setDeleteLoading(false)
        }
    }

    const isSold = status === 'sold'

    return (
        <>
            <div className={`
                group relative w-full h-full flex flex-col
                bg-white border border-gray-200 rounded-2xl overflow-hidden
                hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10
                transition-all duration-300 transform hover:-translate-y-1
            `}>
                {/* Image Section */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    {acc.image ? (
                        <img
                            src={acc.image?.startsWith('http') ? acc.image : `${apiBaseUrl}/uploads/${acc.image}`}
                            alt={`Acc #${acc.id}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-4xl">🎮</span>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`
                            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border
                            ${isSold
                                ? "bg-gray-100 text-gray-500 border-gray-200"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"}
                        `}>
                            {isSold ? "Đã bán" : "Có sẵn"}
                        </span>
                    </div>

                    {/* ID Badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="bg-white/90 backdrop-blur-md text-gray-900 text-xs font-mono font-bold px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                            #{acc.id}
                        </span>
                    </div>

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[1px]">
                        <button
                            onClick={() => setShowModal(true)}
                            className="p-3 rounded-full bg-white text-gray-700 shadow-lg hover:scale-110 transition-transform"
                            title="Xem ảnh lớn"
                        >
                            <FiMaximize2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 flex flex-col">
                    {/* Price and Metadata */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">
                                {Number(acc.price).toLocaleString('vi-VN')}
                                <span className="text-sm text-gray-500 font-medium ml-1">₫</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 mb-4"></div>

                    {/* Info Text */}
                    <div className="flex-1 relative mb-4">
                        <div className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-3">
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(acc.info || '') }} />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto grid grid-cols-2 gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                            type="button"
                            onClick={() => onEdit && onEdit(acc)}
                            className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 py-2.5 rounded-xl text-sm font-bold transition-all border border-gray-200 hover:border-gray-300"
                        >
                            <FiEdit /> Edit
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl text-sm font-bold transition-all border border-rose-100 hover:border-rose-200"
                        >
                            {deleteLoading ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <FiTrash2 />
                            )}
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Image Zoom */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-[fadeIn_0.2s_ease-out]"
                    onClick={() => setShowModal(false)}
                >
                    <img
                        src={acc.image?.startsWith('http') ? acc.image : `${apiBaseUrl}/uploads/${acc.image}`}
                        alt="acc full"
                        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-md"
                        onClick={() => setShowModal(false)}
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>
            )}
        </>
    )
}

function FiX({ className }) {
    return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
}
