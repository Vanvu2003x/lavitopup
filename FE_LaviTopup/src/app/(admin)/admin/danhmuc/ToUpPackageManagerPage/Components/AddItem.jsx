"use client"

import { addPkg } from "@/services/toup_package.service"
import { useState, useRef } from "react"
import { FiEdit, FiX } from "react-icons/fi"
import { toast } from "react-toastify"

export default function AddItemUI({ onCancel, game_id }) {
    const [form, setForm] = useState({
        package_name: "",
        price: "",
        origin_price: "",
        package_type: "",
        id_server: false, // mặc định là false
        sale: false       // thêm mặc định là false
    })

    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const inputFileRef = useRef(null)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleChooseImage = () => {
        inputFileRef.current.click()
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // SECURITY: Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                toast.error('Chỉ chấp nhận file ảnh JPG, PNG, GIF hoặc WebP')
                e.target.value = ''
                return
            }

            // SECURITY: Validate file size (30MB)
            if (file.size > 30 * 1024 * 1024) {
                toast.error('Dung lượng file tối đa là 30MB')
                e.target.value = ''
                return
            }

            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async () => {
        if (!form.package_name || !form.price || !form.origin_price || !form.package_type || !imageFile) {
            toast.error("Vui lòng nhập đầy đủ thông tin và chọn ảnh!")
            return
        }

        const formData = new FormData()
        formData.append("package_name", form.package_name)
        formData.append("game_id", game_id)
        formData.append("price", form.price)
        formData.append("origin_price", form.origin_price)
        formData.append("package_type", form.package_type)
        formData.append("image", imageFile)
        formData.append("id_server", form.id_server) // true hoặc false
        formData.append("sale", form.sale)           // true hoặc false

        setLoading(true)

        try {
            const result = await addPkg(formData)
            onCancel()
            if (result.id) {
                toast.success("Thêm gói nạp thành công!")
                setTimeout(() => {
                    window.location.reload()
                }, 2000)
            }
        } catch (err) {
            console.error(err)
            toast.error("Lỗi khi thêm gói nạp!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="border p-5 bg-gray-50 rounded mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-base">Thêm gói nạp mới</h3>
                <button onClick={onCancel} className="text-gray-500 hover:text-black">
                    <FiX size={20} />
                </button>
            </div>

            <div className="flex gap-6 flex-wrap">
                {/* Ảnh thumbnail */}
                <div className="w-48 border p-3 flex flex-col items-center">
                    {imagePreview ? (
                        <img
                            src={imagePreview}
                            alt="preview"
                            className="w-40 h-40 object-cover border cursor-pointer"
                            onClick={handleChooseImage}
                            title="Click để thay ảnh"
                        />
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center gap-2 w-40 h-40 border-2 border-dashed cursor-pointer"
                            onClick={handleChooseImage}
                        >
                            <FiEdit size={24} />
                            <span className="text-gray-600 text-sm">Thêm ảnh</span>
                        </div>
                    )}
                    <input
                        ref={inputFileRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>

                {/* Thông tin gói */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 border-b pb-1">
                        <FiEdit className="text-gray-500" />
                        <input
                            name="package_name"
                            value={form.package_name}
                            onChange={handleChange}
                            placeholder="Tên gói"
                            className="w-full outline-none py-1"
                        />
                    </div>

                    <div className="flex items-center gap-2 border-b pb-1">
                        <FiEdit className="text-gray-500" />
                        <select
                            name="package_type"
                            value={form.package_type}
                            onChange={handleChange}
                            className="w-full outline-none py-1 bg-transparent"
                        >
                            <option value="">-- Chọn kiểu nạp --</option>
                            <option value="LOG">LOG</option>
                            <option value="UID">UID</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 border-b pb-1">
                        <FiEdit className="text-gray-500" />
                        <input
                            name="price"
                            type="number"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="Giá nạp"
                            className="w-full outline-none py-1"
                        />
                    </div>

                    <div className="flex items-center gap-2 border-b pb-1">
                        <FiEdit className="text-gray-500" />
                        <input
                            name="origin_price"
                            type="number"
                            value={form.origin_price}
                            onChange={handleChange}
                            placeholder="Giá gốc"
                            className="w-full outline-none py-1"
                        />
                    </div>

                    {/* Checkbox ID Server */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="id_server"
                            checked={form.id_server}
                            onChange={handleChange}
                        />
                        <label className="text-sm">Có Zone ID</label>
                    </div>

                    {/* Checkbox Sale */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="sale"
                            checked={form.sale}
                            onChange={handleChange}
                        />
                        <label className="text-sm">Gói Sale</label>
                    </div>
                </div>

                {/* Hành động */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${loading && "opacity-50 cursor-not-allowed"}`}
                    >
                        {loading ? "Đang lưu..." : "Lưu gói nạp"}
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    )
}
