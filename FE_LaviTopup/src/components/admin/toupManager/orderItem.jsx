"use client";

import { changeStatus, acceptOrder, completeOrder, cancelOrder1 } from "@/services/order.service";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { FiClock, FiUser, FiPackage, FiMonitor, FiPlay, FiCheck, FiX, FiRefreshCw, FiAlertTriangle } from "react-icons/fi";

const urlBaseAPI = process.env.NEXT_PUBLIC_API_URL;

export default function OrderItem({ order, onStatusChange }) {
    const toast = useToast();
    const [showAccount, setShowAccount] = useState(false);
    const [orderStatus, setOrderStatus] = useState(order.status);
    const [loading, setLoading] = useState(false);
    const [isManualMode, setIsManualMode] = useState(false);

    const getDotColor = (status) => {
        switch (status) {
            case "pending": return "text-yellow-500";
            case "processing": return "text-sky-500";
            case "partial": return "M?t ph?n";
            case "partial": return "text-orange-500";
            case "success": return "text-emerald-500";
            case "cancelled":
            case "cancel": return "text-pink-500";
            default: return "text-slate-500";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending": return "Chờ xử lý";
            case "processing": return "Đang thực hiện";
            case "success": return "Thành công";
            case "cancelled":
            case "cancel": return "Đã hủy";
            default: return status;
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);


    // 1. Accept Order
    const handleAccept = async () => {
        if (!confirm("Admin xác nhận NHẬN ĐƠN này để xử lý?")) return;
        setLoading(true);
        try {
            await acceptOrder(order.id);
            toast.success("Đã nhận đơn! Bắt đầu xử lý.");
            setOrderStatus("processing");
            onStatusChange?.(order.id, "processing");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi nhận đơn");
        }
        setLoading(false);
    };

    // 2. Complete Order
    const handleComplete = async () => {
        if (!confirm("Xác nhận đã NẠP XONG cho khách?")) return;
        setLoading(true);
        try {
            await completeOrder(order.id);
            toast.success("Đã hoàn thành đơn hàng!");
            setOrderStatus("success");
            onStatusChange?.(order.id, "success");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi hoàn thành đơn");
        }
        setLoading(false);
    };

    // 3. Cancel Order
    const handleCancel = async () => {
        if (!confirm("Xác nhận HỦY ĐƠN và HOÀN TIỀN cho khách?")) return;
        setLoading(true);
        try {
            await cancelOrder1(order.id);
            toast.success("Đã hủy và hoàn tiền thành công!");
            setOrderStatus("cancelled"); // BE might return 'cancelled'
            onStatusChange?.(order.id, "cancelled");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi hủy đơn");
        }
        setLoading(false);
    };

    // 4. Manual Change (Fallback)
    const handleManualChange = async (newStatus) => {
        if (newStatus === orderStatus) return;
        setLoading(true);
        try {
            await changeStatus(order.id, newStatus);
            toast.success("Đã cập nhật trạng thái (Thủ công)");
            setOrderStatus(newStatus);
            onStatusChange?.(order.id, newStatus);
        } catch (error) {
            toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
        }
        setLoading(false);
    };

    // 5. Sync with partner source
    const handleSync = async () => {
        setLoading(true);
        try {
            // Call API to sync (You might need to add this function to order.service.js on FE)
            // For now, using direct fetch or assuming a service function exists
            const res = await fetch(`${urlBaseAPI}/api/order/${order.id}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure auth
                }
            });
            const data = await res.json();

            if (data.status) {
                toast.success(data.message || "Đồng bộ thành công!");
                if (data.updated) {
                    onStatusChange?.(order.id, data.remote_status);
                }
            } else {
                toast.error(data.message || "Lỗi đồng bộ");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi kết nối khi đồng bộ");
        }
        setLoading(false);
    };

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-200 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg overflow-hidden">
            {/* Status Color Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getDotColor(orderStatus).replace('text-', 'bg-')} transition-colors duration-300`}></div>

            <div className="p-5 pl-7">
                <div className="flex flex-col md:flex-row gap-5 items-start">
                    {/* Image */}
                    <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative group/img shadow-sm">
                        {order.thumbnail ? (
                            <img
                                src={order.thumbnail?.startsWith('http') ? order.thumbnail : urlBaseAPI + order.thumbnail}
                                alt="Package"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                <FiPackage size={28} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/5 group-hover/img:bg-transparent transition-colors"></div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                        #{order.id}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {order.package_name || "Gói không tên"}
                                    </h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                        <FiUser className="text-blue-500" />
                                        <span className="text-gray-700 font-medium">{order.user_name || order.user_email}</span>
                                    </div>
                                    <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
                                    <div className="flex items-center gap-1.5">
                                        <FiClock className="text-gray-400" />
                                        <span>{order.update_at ? new Date(order.update_at).toLocaleString("vi-VN") : "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                    {/* Action Buttons based on status */}
                                    {orderStatus === 'pending' && !isManualMode && (
                                        <>
                                            <button
                                                onClick={handleAccept}
                                                disabled={loading}
                                                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1 transition-all"
                                            >
                                                <FiPlay size={12} /> Nhận đơn
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={loading}
                                                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
                                            >
                                                Hủy
                                            </button>
                                        </>
                                    )}

                                    {orderStatus === 'processing' && !isManualMode && (
                                        <>
                                            <button
                                                onClick={handleComplete}
                                                disabled={loading}
                                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1 transition-all"
                                            >
                                                <FiCheck size={12} /> Xong
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={loading}
                                                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
                                            >
                                                Hủy
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => setIsManualMode(!isManualMode)}
                                        className={`p-1.5 rounded-lg transition-colors ${isManualMode ? 'bg-orange-50 text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
                                        title="Chế độ thủ công"
                                    >
                                        <FiRefreshCw size={14} />
                                    </button>

                                    {/* Sync Button */}
                                    <button
                                        onClick={handleSync}
                                        disabled={loading}
                                        className="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors"
                                        title="??ng b? tr?ng th?i ??n"
                                    >
                                        <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
                                    </button>
                                </div>

                                {/* Manual Dropdown (Visible only in manual mode or terminal states) */}
                                {(isManualMode || orderStatus === 'success' || orderStatus === 'cancelled' || orderStatus === 'cancel') && (
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${orderStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            orderStatus === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                orderStatus === 'processing' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                                    'bg-pink-50 text-pink-600 border-pink-100'
                                            }`}>
                                            {getStatusLabel(orderStatus)}
                                        </span>
                                        {isManualMode && (
                                            <select
                                                value={orderStatus}
                                                onChange={(e) => handleManualChange(e.target.value)}
                                                disabled={loading}
                                                className="bg-white border border-orange-200 text-orange-600 text-xs py-1 px-2 rounded-lg outline-none focus:border-orange-500 cursor-pointer"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="success">Success</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-gray-100 mb-4"></div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Giá trị đơn</span>
                                <span className="text-blue-600 font-bold font-mono text-base">{formatCurrency(order.amount)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Lợi nhuận</span>
                                <span className="text-emerald-600 font-bold font-mono text-base">{formatCurrency(order.profit || 0)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Game</span>
                                <span className="text-gray-700 font-medium truncate">{order.game_name || "N/A"}</span>
                            </div>
                            <div className="flex justify-end items-center">
                                <button
                                    onClick={() => setShowAccount(!showAccount)}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                        ${showAccount
                                            ? "bg-cyan-50 text-cyan-600 border border-cyan-100"
                                            : "bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"}
                                    `}
                                >
                                    <FiMonitor size={14} />
                                    {showAccount ? "Đóng info" : "Xem info"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Account Info */}
            <div className={`
                overflow-hidden transition-all duration-300 ease-in-out bg-gray-50 border-t border-gray-100
                ${showAccount ? "max-h-96 opacity-100 p-5 pl-7" : "max-h-0 opacity-0"}
             `}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {order.user_nap_name && (
                        <div className="md:col-span-2 mb-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                            <span className="text-emerald-600 text-xs font-bold uppercase flex items-center gap-2">
                                <FiUser /> Người thực hiện nạp
                            </span>
                            <span className="text-gray-900 font-bold">{order.user_nap_name}</span>
                        </div>
                    )}

                    {order.account_info ? (
                        <>
                            {(() => {
                                try {
                                    // Handle if account_info is already object or string
                                    const info = typeof order.account_info === 'string'
                                        ? JSON.parse(order.account_info)
                                        : order.account_info;

                                    return Object.entries(info).map(([key, value]) => (
                                        <div key={key} className="flex flex-col group/item">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <div className="relative">
                                                <div className="p-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-mono text-sm select-all hover:border-cyan-500/30 transition-colors truncate">
                                                    {String(value) || "Trống"}
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                } catch (e) {
                                    return <div className="text-red-400 text-xs">Lỗi hiển thị thông tin</div>;
                                }
                            })()}
                        </>
                    ) : (
                        <div className="col-span-2 text-center text-gray-400 italic py-4">
                            Không có thông tin tài khoản đính kèm
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
