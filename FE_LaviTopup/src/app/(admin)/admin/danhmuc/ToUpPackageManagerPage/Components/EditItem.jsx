"use client"

import { useRef, useState } from "react"
import { toast } from "react-toastify"
import { updatePkg } from "@/services/toup_package.service"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

export default function EditPkg({ pkg, onCancel }) {
    const [form, setForm] = useState({
        package_name: pkg.package_name,
        price: pkg.price,
        origin_price: pkg.origin_price,
        package_type: pkg.package_type,
        sale: pkg.sale || false, // <-- boolean
    })

    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(pkg.thumbnail?.startsWith('http') ? pkg.thumbnail : `${apiBaseUrl}${pkg.thumbnail}`)
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
        inputFileRef.current?.click()
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
        if (!form.package_name || !form.price || !form.origin_price || !form.package_type) {
            toast.error("Vui lòng nhập đầy đủ thông tin!")
            return
        }

        const formData = new FormData()
        formData.append("package_name", form.package_name)
        formData.append("price", form.price)
        formData.append("origin_price", form.origin_price)
        formData.append("package_type", form.package_type)
        formData.append("sale", form.sale) // <-- gửi boolean
        if (imageFile) {
            formData.append("image", imageFile)
        }

        setLoading(true)
        try {
            await updatePkg(pkg.id, formData)
            toast.success("Cập nhật thành công!")
            onCancel()
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err) {
            console.error(err)
            toast.error("Lỗi khi cập nhật gói nạp!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-between items-center gap-6 p-4 w-full border">
            {/* Ảnh thumbnail */}
            <div className="relative w-24 h-24 cursor-pointer">
                <img
                    src={imagePreview}
                    alt="ảnh tạm"
                    className="w-full h-full object-cover border"
                    title="Click để thay ảnh"
                    onClick={handleChooseImage}
                />
                <div
                    onClick={handleChooseImage}
                    className="w-full h-full text-4xl bg-gray-300 absolute z-20 top-0 left-0 opacity-70 flex items-center justify-center"
                >
                    +
                </div>
                <input
                    type="file"
                    ref={inputFileRef}
                    onChange={handleImageChange}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="hidden"
                />
            </div>

            {/* Thông tin gói */}
            <div className="flex-1 space-y-2">
                <input
                    name="package_name"
                    value={form.package_name}
                    onChange={handleChange}
                    placeholder="Tên gói"
                    className="w-full text-black font-bold outline-none border-b pb-1"
                />

                <div className="text-sm text-gray-600 flex items-center gap-2">
                    Giá nạp:
                    <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        className="text-blue-600 outline-none border-b px-1 w-32"
                    />
                    đ
                </div>

                <div className="text-sm text-gray-600 flex items-center gap-2">
                    Giá gốc:
                    <input
                        name="origin_price"
                        type="number"
                        value={form.origin_price}
                        onChange={handleChange}
                        className="text-red-400 outline-none border-b px-1 w-32"
                    />
                    đ
                </div>

                <div className="text-sm text-black flex items-center gap-2">
                    Kiểu nạp:
                    <select
                        name="package_type"
                        value={form.package_type}
                        onChange={handleChange}
                        className="font-semibold bg-transparent outline-none border px-2 py-1 rounded"
                    >
                        <option value="LOG">LOG</option>
                        <option value="UID">UID</option>
                    </select>
                </div>

                {/* Checkbox Sale */}
                <div className="text-sm text-black flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="sale"
                        checked={form.sale}
                        onChange={handleChange}
                    />
                    <span>Sale</span>
                </div>
            </div>

            {/* Nút hành động */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {loading ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                    onClick={onCancel}
                    className="px-3 py-1 text-sm text-black border border-gray-400 rounded hover:bg-gray-200"
                >
                    Hủy
                </button>
            </div>
        </div>
    )
}
