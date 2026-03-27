import { changeStatus, delPkg } from "@/services/toup_package.service"
import { useState } from "react"
import { toast } from "react-toastify"
import EditPkg from "./EditItem"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

export default function ItemsPkg({ pkg }) {
    const [status, setStatus] = useState(pkg.status)
    const [isEdit, setIsEdit] = useState(false)
    const [statusLoading, setStatusLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleStatusChange = async (e) => {
        if (statusLoading) return;
        const newStatus = e.target.value
        setStatus(newStatus)
        setStatusLoading(true)
        try {
            await changeStatus(pkg.id, newStatus);
            toast.success("Thay đổi trạng thái thành công")
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            toast.error("Thay đổi trạng thái thất bại")
        } finally {
            setStatusLoading(false)
        }
    }

    const HandleDelete = async () => {
        if (deleteLoading) return;
        if (!confirm("Bạn có chắc muốn xóa gói nạp này?")) return;

        setDeleteLoading(true)
        try {
            const result = await delPkg(pkg.id)
            toast.success(result.message)
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error(error.message)
            toast.error("Lỗi khi xóa")
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <>
            {isEdit ? (
                // Hiển thị nội dung khi đang ở chế độ edit
                <EditPkg
                    pkg={pkg}
                    onCancel={() => setIsEdit(false)}
                    onSave={() => {
                        // có thể refetch lại hoặc cập nhật dữ liệu
                        setIsEdit(false)
                    }}
                />

            ) : (
                // Hiển thị nội dung khi không edit
                <div className="flex justify-between items-center gap-6 p-4 bg-white w-full">
                    {/* Ảnh thumbnail */}
                    {/* Ảnh thumbnail */}
                    <div className="relative w-24 h-24">
                        <img
                            src={pkg.thumbnail?.startsWith('http') ? pkg.thumbnail : `${apiBaseUrl}${pkg.thumbnail}`}
                            alt={pkg.package_name}
                            className="w-24 h-24 object-cover"
                        />
                        {pkg.sale ? (
                            <span className="absolute top-1 left-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                Sale
                            </span>
                        ) : (
                            null
                        )}
                    </div>

                    {/* Thông tin gói */}
                    <div className="flex-1 space-y-1">
                        <div className="font-bold text-black mb-2">{pkg.package_name}</div>
                        <div className="text-sm text-gray-400">
                            Giá nạp: <span className="text-blue-600">{(pkg.price || 0).toLocaleString()}đ</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            Giá gốc: <span className="text-red-400">{(pkg.origin_price || 0).toLocaleString()}đ</span>
                        </div>
                        <div className="text-smmt-4 text-black">
                            Kiểu nạp: <span className="font-semibold">{pkg.package_type}</span>
                        </div>
                    </div>

                    {/* Trạng thái + Hành động */}
                    <div>
                        {/* Trạng thái */}
                        <select
                            value={status}
                            onChange={handleStatusChange}
                            disabled={statusLoading}
                            className={`px-3 py-2 text-sm font-medium border transition ${status === "active"
                                ? "bg-green-100 text-green-700 border-green-400"
                                : "bg-red-100 text-red-700 border-red-400"
                                } ${statusLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Tạm ngưng</option>
                        </select>

                        {/* Nút hành động */}
                        <div className="flex gap-2 justify-between mt-5">
                            <button
                                onClick={() => { setIsEdit(true) }}
                                className="px-3 py-1 border text-sm text-blue-600 border-blue-600 hover:bg-blue-50">
                                Sửa
                            </button>
                            <button
                                onClick={HandleDelete}
                                disabled={deleteLoading}
                                className={`px-3 py-1 border text-sm text-red-600 border-red-600 hover:bg-red-50 ${deleteLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
                                {deleteLoading ? "Đang xóa..." : "Xóa"}
                            </button>
                        </div>
                    </div>
                </div >
            )
            }

        </>
    )
}
