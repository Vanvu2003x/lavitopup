"use client"
import { useState, useEffect } from "react"
import api from "@/utils/axios"
import RichTextEditor from "@/components/common/richtexteditor"
import { FiPlus, FiEdit, FiX, FiUpload, FiImage } from "react-icons/fi"
import { useToast } from "@/components/ui/Toast"

export default function AccForm({ gameList, selectedGame, onSuccess, onClose, editMode = false, accData = null }) {
    const toast = useToast()
    const [formData, setFormData] = useState({
        info: "",
        price: "",
        price_basic: "",
        price_pro: "",
        price_plus: "",
        game_id: selectedGame?.id || "",
        status: "selling"
    })
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)

    // Initialize form with edit data
    useEffect(() => {
        if (editMode && accData) {
            setFormData({
                info: accData.info || "",
                price: accData.price || "",
                price_basic: accData.price_basic || "",
                price_pro: accData.price_pro || "",
                price_plus: accData.price_plus || "",
                game_id: accData.game_id || selectedGame?.id || "",
                status: accData.status || "selling"
            })
            // Set preview to existing image
            if (accData.image) {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
                setPreview(accData.image?.startsWith('http') ? accData.image : `${apiBaseUrl}/uploads/${accData.image}`)
            }
        } else if (selectedGame) {
            setFormData(prev => ({ ...prev, game_id: selectedGame.id }))
        }
    }, [editMode, accData, selectedGame])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            // SECURITY: Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(selectedFile.type)) {
                toast.error('Chỉ chấp nhận file ảnh JPG, PNG, GIF hoặc WebP')
                e.target.value = ''
                return
            }



            setFile(selectedFile)
            const reader = new FileReader()
            reader.onloadend = () => setPreview(reader.result)
            reader.readAsDataURL(selectedFile)
        } else {
            // If editing and no new file, keep existing preview
            if (editMode && accData?.image) {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
                setPreview(accData.image?.startsWith('http') ? accData.image : `${apiBaseUrl}/uploads/${accData.image}`)
            } else {
                setPreview(null)
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.info || formData.info.trim() === "") {
            toast.error("Vui lòng nhập thông tin tài khoản")
            return
        }
        if (!formData.price || formData.price <= 0) {
            toast.error("Vui lòng nhập giá hợp lệ")
            return
        }
        if (!editMode && !file) {
            toast.error("Vui lòng chọn ảnh mô tả")
            return
        }

        setLoading(true)
        try {
            const formDataToSend = new FormData()
            formDataToSend.append("info", formData.info)
            formDataToSend.append("price", formData.price)
            formDataToSend.append("price_basic", formData.price_basic)
            formDataToSend.append("price_pro", formData.price_pro)
            formDataToSend.append("price_plus", formData.price_plus)
            formDataToSend.append("status", formData.status)
            formDataToSend.append("game_id", formData.game_id)

            // Only append image if a new file was selected
            if (file) {
                formDataToSend.append("image", file)
            }

            const token = localStorage.getItem("token")
            let res

            if (editMode) {
                // Update existing account
                res = await api.put(`/api/acc/${accData.id}`, formDataToSend, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    }
                })
                toast.success("Cập nhật tài khoản thành công!")
            } else {
                // Create new account
                res = await api.post("/api/acc", formDataToSend, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    }
                })
                toast.success("Thêm tài khoản mới thành công!")
            }

            // Call success callback with new/updated data
            if (onSuccess) onSuccess(res.data.data)

            // Reset form
            if (!editMode) {
                setFormData({
                    info: "",
                    price: "",
                    price_basic: "",
                    price_pro: "",
                    price_plus: "",
                    game_id: selectedGame?.id || "",
                    status: "selling"
                })
                setFile(null)
                setPreview(null)
            }

            // Close modal if in edit mode
            if (editMode && onClose) {
                onClose()
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            const errorMsg = error.response?.data?.message || error.message || "Đã xảy ra lỗi"
            toast.error(editMode ? `Lỗi cập nhật: ${errorMsg}` : `Lỗi thêm mới: ${errorMsg}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {editMode ? (
                        <>
                            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                <FiEdit size={20} />
                            </div>
                            <span>Chỉnh sửa tài khoản <span className="text-blue-600">#{accData?.id}</span></span>
                        </>
                    ) : (
                        <>
                            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                <FiPlus size={20} />
                            </div>
                            Thêm tài khoản mới
                        </>
                    )}
                </h3>
                {editMode && onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                    >
                        <FiX size={24} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                    <label className="block font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">Thông tin tài khoản <span className="text-red-500">*</span></label>
                    <div className="prose-sm">
                        <RichTextEditor
                            value={formData.info}
                            onChange={(html) => setFormData(prev => ({ ...prev, info: html }))}
                        />
                    </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block font-bold text-gray-700 mb-2 text-xs uppercase tracking-wide">Giá Basic (Mặc định) <span className="text-red-500">*</span></label>
                        <div className="relative group">
                            <input
                                type="number"
                                className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pl-8 font-semibold"
                                value={formData.price}
                                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="0"
                                min="1"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₫</span>
                        </div>
                    </div>
                    <div>
                        <label className="block font-bold text-gray-700 mb-2 text-xs uppercase tracking-wide">Giá Pro (Opt)</label>
                        <div className="relative group">
                            <input
                                type="number"
                                className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pl-8 font-semibold"
                                value={formData.price_pro}
                                onChange={e => setFormData(prev => ({ ...prev, price_pro: e.target.value }))}
                                placeholder="Auto"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₫</span>
                        </div>
                    </div>
                    <div>
                        <label className="block font-bold text-gray-700 mb-2 text-xs uppercase tracking-wide">Giá VIP (Opt)</label>
                        <div className="relative group">
                            <input
                                type="number"
                                className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pl-8 font-semibold"
                                value={formData.price_plus}
                                onChange={e => setFormData(prev => ({ ...prev, price_plus: e.target.value }))}
                                placeholder="Auto"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₫</span>
                        </div>
                    </div>
                </div>

                {/* Status Select - Only in Edit Mode */}
                {editMode && (
                    <div className="md:col-span-2">
                        <label className="block font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">Trạng thái</label>
                        <select
                            className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all cursor-pointer font-medium appearance-none"
                            value={formData.status}
                            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="selling">Chưa bán (Selling)</option>
                            <option value="sold">Đã bán (Sold)</option>
                        </select>
                    </div>
                )}

                <div className="md:col-span-2">
                    <label className="block font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                        Hình ảnh mô tả {!editMode && <span className="text-red-500">*</span>}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl p-6 transition-all text-center cursor-pointer relative group bg-gray-50">
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.webp"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {!preview ? (
                            <div className="text-gray-500 group-hover:text-blue-600 transition-colors">
                                <div className="p-3 bg-white rounded-full shadow-sm inline-block mb-3">
                                    <FiImage className="text-3xl" />
                                </div>
                                <div className="font-semibold text-lg mb-1">Click để tải ảnh lên</div>
                                <p className="text-xs text-gray-400">PNG, JPG, GIF, WEBP - Không giới hạn dung lượng</p>
                            </div>
                        ) : (
                            <div className="relative inline-block">
                                <img src={preview} alt="Preview" className="h-40 rounded-lg object-contain shadow-md bg-white p-1" />
                                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 py-1 px-3 rounded-full">
                                    <FiUpload />
                                    <span>Thay đổi hình ảnh</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                {editMode && onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                        disabled={loading}
                    >
                        Hủy bỏ
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            {editMode ? <FiEdit /> : <FiPlus />}
                            {editMode ? "Cập nhật" : "Đăng bán ngay"}
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
