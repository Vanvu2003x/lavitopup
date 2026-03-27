"use client";
import { useEffect, useRef, useState } from "react";
import OrderItem from "@/components/admin/toupManager/orderItem";
import Pagination from "@/components/common/Pagination";
import { getAllOrder, getAllOrderByStatus, searchOrder } from "@/services/order.service";
import { toast } from "react-toastify";
import { FiShoppingCart, FiSearch, FiFilter, FiX, FiCreditCard, FiClock, FiLoader, FiCheckCircle, FiXCircle, FiRefreshCw } from "react-icons/fi";

const filterLabels = {
    all: "Tất cả",
    pending: "Chờ xử lý",
    processing: "Đang thực hiện",
    success: "Thành công",
    cancelled: "Đã hủy",
    failed: "Thất bại",
};

const StatCard = ({ title, value, icon, color, bg, borderColor, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
            relative w-full overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-300 group
            ${active
                ? `bg-white border-blue-500 shadow-md transform scale-105`
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}
        `}
    >
        <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg ${active ? 'bg-blue-50' : 'bg-gray-50'} ${color}`}>
                {icon}
            </div>
            {active && <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')} animate-pulse`}></div>}
        </div>
        <div className="space-y-1">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
            <p className={`text-2xl font-black ${active ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                {value}
            </p>
        </div>
    </button>
);

export default function Toup() {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        success: 0,
        cancelled: 0,
        failed: 0,
    });

    const [listOrders, setListOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const listRef = useRef(null);

    const fetchOrders = async () => {
        try {
            if (searchKeyword.trim()) {
                const res = await searchOrder(searchKeyword.trim(), currentPage);
                setListOrders(res.orders?.orders || []);
                setTotalPages(Math.ceil((res.orders?.total || 0) / 10));

                if (!res.orders || res.orders.length === 0) {
                    toast.info("Không tìm thấy đơn hàng phù hợp.");
                }
                return;
            }

            if (activeFilter === "all") {
                const res = await getAllOrder(currentPage);
                setStats({
                    total: res.total,
                    pending: res.stats?.pending || 0,
                    processing: res.stats?.processing || 0,
                    success: res.stats?.success || 0,
                    cancelled: res.stats?.cancelled || 0,
                    failed: res.stats?.failed || 0,
                });

                setListOrders(res.orders || []);
                setTotalPages(Math.ceil(res.total / 10));
            } else {
                const res = await getAllOrderByStatus(activeFilter, currentPage);
                setListOrders(res.orders || []);
                setTotalPages(Math.ceil(res.total / 10));

                if (!res.orders || res.orders.length === 0) {
                    toast.info("📂 Không có đơn hàng trong trạng thái này.");
                }
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
            toast.error("Lỗi khi tải danh sách đơn hàng.");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [currentPage, activeFilter, searchKeyword]);

    useEffect(() => {
        if (listOrders.length > 0 && listRef.current) {
            listRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [listOrders]);

    const handleClickStat = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
        setSearchKeyword("");
    };

    return (
        <div className="space-y-5 animate-[fadeIn_0.5s_ease-out]">
            <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/30 backdrop-blur-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                            <FiShoppingCart />
                            Quản lý đơn nạp
                        </div>
                        <h2 className="mt-3 font-display text-2xl font-semibold text-white">Quản trị đơn nạp</h2>
                        <p className="mt-2 max-w-2xl text-[13px] leading-5 text-slate-400">
                            Tập trung xử lý đơn đang chờ, theo dõi trạng thái và chuyển trang rõ ràng theo từng nhóm giao dịch.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tổng đơn</p>
                            <p className="mt-3 font-display text-2xl font-semibold text-cyan-200">{stats.total}</p>
                        </div>
                        <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Chờ xử lý</p>
                            <p className="mt-3 font-display text-2xl font-semibold text-amber-200">{stats.pending}</p>
                        </div>
                        <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Trang hiện tại</p>
                            <p className="mt-3 font-display text-2xl font-semibold text-emerald-200">{currentPage}/{totalPages}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="relative mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50"></div>

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="mb-2 text-2xl font-black text-gray-900 md:text-3xl">
                            Quản lý đơn nạp
                        </h1>
                        <p className="flex items-center gap-2 text-sm font-medium text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Xử lý đơn tự động và thủ công
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group w-full md:w-96">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
                        <div className="relative bg-gray-50 border border-gray-200 rounded-xl p-1 flex items-center">
                            <FiSearch className="ml-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Tìm kiếm theo mã đơn, email..."
                                className="w-full bg-transparent text-gray-900 px-3 py-2 outline-none placeholder:text-gray-400 font-medium"
                            />
                            {searchKeyword && (
                                <button
                                    onClick={() => setSearchKeyword('')}
                                    className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FiX />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sync All Button */}
                    <button
                        onClick={async () => {
                            if (!confirm("Bạn có chắc muốn quét và đồng bộ lại trạng thái TẤT CẢ các đơn đang xử lý? Quá trình này có thể mất vài giây.")) return;
                            const toastId = toast.loading("Đang đồng bộ dữ liệu...");
                            try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/sync/all`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                });
                                const data = await res.json();
                                if (data.status) {
                                    toast.update(toastId, { render: `Đã đồng bộ: ${data.updated} đơn thay đổi.`, type: "success", isLoading: false, autoClose: 3000 });
                                    fetchOrders();
                                } else {
                                    toast.update(toastId, { render: data.message || "Lỗi đồng bộ", type: "error", isLoading: false, autoClose: 3000 });
                                }
                            } catch (error) {
                                toast.update(toastId, { render: "Lỗi kết nối server", type: "error", isLoading: false, autoClose: 3000 });
                            }
                        }}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-95"
                    >
                        <FiRefreshCw />
                        <span>Đồng bộ trạng thái</span>
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard
                    title="Tổng đơn"
                    value={stats.total}
                    icon={<FiCreditCard />}
                    color="text-gray-600"
                    bg="from-gray-100 to-gray-50"
                    borderColor="border-gray-200"
                    active={activeFilter === 'all'}
                    onClick={() => handleClickStat("all")}
                />
                <StatCard
                    title="Chờ xử lý"
                    value={stats.pending}
                    icon={<FiClock />}
                    color="text-yellow-600"
                    bg="from-yellow-50 to-white"
                    borderColor="border-yellow-200"
                    active={activeFilter === 'pending'}
                    onClick={() => handleClickStat("pending")}
                />
                <StatCard
                    title="Đang thực hiện"
                    value={stats.processing}
                    icon={<FiLoader />}
                    color="text-sky-600"
                    bg="from-sky-50 to-white"
                    borderColor="border-sky-200"
                    active={activeFilter === 'processing'}
                    onClick={() => handleClickStat("processing")}
                />
                <StatCard
                    title="Thành công"
                    value={stats.success}
                    icon={<FiCheckCircle />}
                    color="text-emerald-600"
                    bg="from-emerald-50 to-white"
                    borderColor="border-emerald-200"
                    active={activeFilter === 'success'}
                    onClick={() => handleClickStat("success")}
                />
                <StatCard
                    title="Đã hủy"
                    value={stats.cancelled}
                    icon={<FiXCircle />}
                    color="text-rose-600"
                    bg="from-rose-50 to-white"
                    borderColor="border-rose-200"
                    active={activeFilter === 'cancelled'}
                    onClick={() => handleClickStat("cancelled")}
                />
                <StatCard
                    title="Thất bại"
                    value={stats.failed}
                    icon={<FiXCircle />}
                    color="text-red-600"
                    bg="from-red-50 to-white"
                    borderColor="border-red-200"
                    active={activeFilter === 'failed'}
                    onClick={() => handleClickStat("failed")}
                />
            </div>

            {/* Content Divider */}
            <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <div className="px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    <FiFilter className="text-blue-500" />
                    Đang xem: <span className="text-gray-900">{filterLabels[activeFilter] || activeFilter}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            {/* Order list */}
            <div ref={listRef} className="space-y-4">
                {listOrders.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-4">
                            {listOrders.map((order, index) => (
                                <OrderItem
                                    key={order.id}
                                    order={{ ...order, stt: (currentPage - 1) * 10 + index + 1 }}
                                    onStatusChange={() => {
                                        fetchOrders();
                                        toast.success("Cập nhật trạng thái thành công");
                                    }}
                                />
                            ))}
                        </div>

                        <div className="flex justify-center pt-6 pb-12">
                            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPage={totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-gray-900">Không có đơn nạp nào</h3>
                        <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác</p>
                    </div>
                )}
            </div>
        </div>
    );
}
