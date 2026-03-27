"use client"
import { useState, useEffect, useCallback } from "react"
import Pagination from "@/components/common/Pagination"
import api from "@/utils/axios"
import { FiTrendingUp, FiCreditCard, FiActivity, FiUsers } from "react-icons/fi"

export default function RevenueManagerPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get("/api/statistics/revenue/dashboard")
            if (res.data?.status) {
                setStats(res.data.data)
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const formatVND = (amount) => {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M'
        }
        if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K'
        }
        return new Intl.NumberFormat('vi-VN').format(amount || 0)
    }

    const formatFullVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount || 0)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header - Compact Design */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                {/* Background Glow Effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Animated Icon Container */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg blur-lg opacity-50 animate-pulse"></div>
                            <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/25">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>

                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent sm:text-xl">
                                Báo cáo doanh thu
                            </h1>
                            <p className="text-gray-500 text-xs mt-0.5">Thống kê chi tiết doanh thu, chi phí và lợi nhuận</p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-700 text-xs font-medium">Đang cập nhật</span>
                    </div>
                </div>
            </div>

            {/* Row 1: Tổng (All Time) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <TotalCard
                    icon={FiTrendingUp}
                    label="Tổng doanh thu"
                    value={formatFullVND(stats?.total?.revenue)}
                    color="from-green-500 to-emerald-600"
                />
                <TotalCard
                    icon={FiCreditCard}
                    label="Tổng chi phí"
                    value={formatFullVND(stats?.total?.spending)}
                    color="from-blue-500 to-cyan-600"
                />
                <TotalCard
                    icon={FiActivity}
                    label="Tổng lợi nhuận"
                    value={formatFullVND(stats?.total?.profit)}
                    color="from-purple-500 to-pink-600"
                />
                <TotalCard
                    icon={FiUsers}
                    label="Số dư khách hàng"
                    value={formatFullVND(stats?.total_user_balance)}
                    color="from-orange-500 to-amber-600"
                />
            </div>

            {/* Row 2: 3 Columns - Ngày / Tuần / Tháng */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <PeriodCard
                    title="Hôm nay"
                    revenue={stats?.today?.revenue}
                    spending={stats?.today?.spending}
                    profit={stats?.today?.profit}
                    formatVND={formatVND}
                />
                <PeriodCard
                    title="Tuần này"
                    revenue={stats?.this_week?.revenue}
                    spending={stats?.this_week?.spending}
                    profit={stats?.this_week?.profit}
                    formatVND={formatVND}
                />
                <PeriodCard
                    title="Tháng này"
                    revenue={stats?.this_month?.revenue}
                    spending={stats?.this_month?.spending}
                    profit={stats?.this_month?.profit}
                    formatVND={formatVND}
                />
            </div>

            {/* Chart - Biểu đồ 30 ngày */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent sm:text-lg">
                            <span className="text-xl">📈</span> Lợi nhuận 30 ngày
                        </h2>
                        <p className="text-gray-500 text-xs mt-0.5">Xu hướng theo thời gian</p>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></div>
                            <span className="text-gray-600 text-[10px] font-medium">Thu</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>
                            <span className="text-gray-600 text-[10px] font-medium">Chi</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm"></div>
                            <span className="text-gray-600 text-[10px] font-medium">Lãi</span>
                        </div>
                    </div>
                </div>

                <SimpleBarChart data={stats?.chart || []} />
            </div>

            {/* Top Customers Section */}
            <TopCustomersTable />
        </div>
    )
}

function TopCustomersTable() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5

    useEffect(() => {
        const fetchTopUsers = async () => {
            try {
                const res = await api.get("/api/statistics/revenue/top-sources")
                if (res.data?.status) {
                    setUsers(res.data.data)
                }
            } catch (error) {
                console.error("Error fetching top users:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTopUsers()
    }, [])

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(users.length / pageSize))
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, pageSize, users.length])

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)
    }

    if (loading) return null
    if (!users || users.length === 0) return null

    const totalPages = Math.max(1, Math.ceil(users.length / pageSize))
    const pagedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 bg-clip-text text-transparent sm:text-lg">
                        <span className="text-xl">🏆</span> Khách hàng nổi bật
                    </h2>
                    <p className="text-gray-500 text-xs mt-0.5">Top đóng góp doanh thu</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
                        <tr>
                            <th className="py-3 px-4">Khách hàng</th>
                            <th className="py-3 px-4">Số đơn</th>
                            <th className="py-3 px-4">Tổng chi tiêu</th>
                            <th className="py-3 px-4">Lợi nhuận</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {pagedUsers.map((user, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm
                                            ${(currentPage - 1) * pageSize + index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white ring-1 ring-yellow-500/30' :
                                                (currentPage - 1) * pageSize + index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white ring-1 ring-gray-400/30' :
                                                    (currentPage - 1) * pageSize + index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-700 text-white ring-1 ring-orange-500/30' :
                                                        'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </div>
                                        <div>
                                            <div className="text-gray-900 font-medium text-sm group-hover:text-purple-600 transition-colors">{user.username || 'Ẩn danh'}</div>
                                            <div className="text-gray-500 text-[10px]">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-medium border border-gray-200">
                                        {user.total_orders}
                                    </span>
                                </td>
                                <td className="py-3 px-4 font-bold text-emerald-600 text-xs">{formatVND(user.total_spent)}</td>
                                <td className="py-3 px-4 font-bold text-purple-600 text-xs">{formatVND(user.total_profit)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-950 p-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPage={totalPages}
                        totalItems={users.length}
                        pageSize={pageSize}
                        tone="dark"
                        onPageChange={setCurrentPage}
                    />
                </div>
            ) : null}
        </div>
    )
}

// Total Card (Row 1)
function TotalCard({ icon: Icon, label, value, color }) {
    return (
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${color} p-3.5 text-white shadow-md group`}>
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-12 h-12" />
            </div>
            <div className="relative z-10 flex items-center gap-2 mb-2">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium opacity-90">{label}</span>
            </div>
            <p className="relative z-10 text-lg font-bold tracking-tight sm:text-xl">{value}</p>
        </div>
    )
}

// Period Card (Row 2 - Ngày/Tuần/Tháng)
function PeriodCard({ title, revenue, spending, profit, formatVND }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 transition-all hover:shadow-md">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center justify-between">
                {title}
                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">Thống kê</span>
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center group">
                    <span className="text-gray-500 text-xs group-hover:text-gray-700 transition-colors">Doanh thu</span>
                    <span className="text-emerald-600 font-bold text-sm group-hover:text-emerald-700 transition-colors">{formatVND(revenue)}</span>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
                </div>

                <div className="flex justify-between items-center group">
                    <span className="text-gray-500 text-xs group-hover:text-gray-700 transition-colors">Chi phí</span>
                    <span className="text-blue-600 font-bold text-sm group-hover:text-blue-700 transition-colors">{formatVND(spending)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                    <span className="text-gray-700 text-xs font-medium">Lợi nhuận</span>
                    <span className="text-purple-600 font-bold text-base">{formatVND(profit)}</span>
                </div>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// PREMIUM BAR CHART COMPONENT
// -------------------------------------------------------------
function SimpleBarChart({ data }) {
    const [selectedIndex, setSelectedIndex] = useState(null)

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="bg-gray-50 p-3 rounded-full mb-3 border border-gray-100">
                    <span className="text-2xl">📊</span>
                </div>
                <p className="text-sm">Chưa có dữ liệu thống kê</p>
            </div>
        )
    }

    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date))

    useEffect(() => {
        if (data && data.length > 0 && selectedIndex === null) {
            setSelectedIndex(data.length - 1)
        }
    }, [data])

    // Find max value for scaling
    const maxValue = Math.max(...sortedData.flatMap(d => [d.revenue || 0, d.spending || 0, Math.abs(d.profit) || 0]), 1)

    const formatVND = (amount) => {
        if (Math.abs(amount) >= 1000000000) return (amount / 1000000000).toFixed(1) + 'B'
        if (Math.abs(amount) >= 1000000) return (amount / 1000000).toFixed(1) + 'M'
        if (Math.abs(amount) >= 1000) return (amount / 1000).toFixed(0) + 'K'
        return new Intl.NumberFormat('vi-VN').format(amount || 0)
    }

    const selectedData = selectedIndex !== null ? sortedData[selectedIndex] : null

    return (
        <div className="space-y-4">
            {/* Selected Date Detail Card */}
            <div className={`transition-all duration-300 transform ${selectedData ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 h-0 overflow-hidden'}`}>
                {selectedData && (
                    <div className="bg-white border border-gray-200 rounded-xl p-1 shadow-md relative overflow-hidden group">

                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors duration-500"></div>

                        <div className="relative p-3 flex flex-col md:flex-row items-center justify-between gap-4">

                            {/* Date Display */}
                            <div className="flex items-center gap-3 min-w-[150px]">
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-center min-w-[50px]">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Tháng {new Date(selectedData.date).getMonth() + 1}</div>
                                    <div className="text-lg font-bold text-gray-900">{new Date(selectedData.date).getDate()}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Thống kê ngày</div>
                                    <div className="text-sm font-semibold text-gray-900 capitalize">
                                        {new Date(selectedData.date).toLocaleDateString('vi-VN', { weekday: 'long' })}
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="flex-1 w-full grid grid-cols-3 gap-1 md:gap-3 divide-x divide-gray-200">
                                <div className="px-2 text-center">
                                    <div className="text-[10px] text-emerald-600 mb-0.5 font-medium tracking-wide">DOANH THU</div>
                                    <div className="text-sm md:text-base font-bold text-gray-900">{formatVND(selectedData.revenue)}</div>
                                </div>
                                <div className="px-2 text-center">
                                    <div className="text-[10px] text-blue-600 mb-0.5 font-medium tracking-wide">CHI PHÍ</div>
                                    <div className="text-sm md:text-base font-bold text-gray-900">{formatVND(selectedData.spending)}</div>
                                </div>
                                <div className="px-2 text-center">
                                    <div className={`text-[10px] mb-0.5 font-medium tracking-wide ${selectedData.profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>LỢI NHUẬN</div>
                                    <div className={`text-sm md:text-base font-bold ${selectedData.profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                        {selectedData.profit > 0 ? '+' : ''}{formatVND(selectedData.profit)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bar Chart Visualization */}
            <div className="h-48 flex items-end justify-between gap-1 pb-1 pl-1 overflow-x-auto relative">
                {/* Y-Axis Lines (Background) */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0 opacity-10">
                    <div className="w-full border-t border-gray-400"></div>
                    <div className="w-full border-t border-gray-400"></div>
                    <div className="w-full border-t border-gray-400"></div>
                    <div className="w-full border-t border-gray-400"></div>
                </div>

                {sortedData.map((item, index) => {
                    const revenueHeight = ((item.revenue || 0) / maxValue) * 100
                    const spendingHeight = ((item.spending || 0) / maxValue) * 100
                    const profitHeight = (Math.abs(item.profit || 0) / maxValue) * 100
                    const date = new Date(item.date)
                    const isSelected = selectedIndex === index

                    return (
                        <div
                            key={index}
                            className={`group flex flex-col items-center justify-end h-full flex-1 min-w-[16px] cursor-pointer transition-all duration-300 z-10 ${isSelected ? 'scale-105 mx-0.5' : 'hover:scale-105'}`}
                            onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
                        >
                            {/* Bars Container */}
                            <div className="w-full flex items-end justify-center gap-[1px] h-[85%] relative">

                                {/* Revenue Bar */}
                                <div
                                    className={`w-1 md:w-2 rounded-t-[2px] transition-all duration-500 ease-out relative group-hover:shadow-[0_0_10px_rgba(16,185,129,0.5)] ${isSelected ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md' : 'bg-emerald-500/60 hover:bg-emerald-500'}`}
                                    style={{ height: `${Math.max(revenueHeight, 5)}%` }}
                                ></div>

                                {/* Spending Bar */}
                                <div
                                    className={`w-1 md:w-2 rounded-t-[2px] transition-all duration-500 ease-out relative group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] ${isSelected ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-md' : 'bg-blue-500/60 hover:bg-blue-500'}`}
                                    style={{ height: `${Math.max(spendingHeight, 5)}%` }}
                                ></div>

                                {/* Profit Bar */}
                                <div
                                    className={`w-1 md:w-2 rounded-t-[2px] transition-all duration-500 ease-out relative
                                        ${item.profit >= 0
                                            ? (isSelected ? 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-md' : 'bg-purple-500/60 hover:bg-purple-500')
                                            : (isSelected ? 'bg-gradient-to-t from-red-600 to-red-400 shadow-md' : 'bg-red-500/60 hover:bg-red-500')
                                        }`}
                                    style={{ height: `${Math.max(profitHeight, 5)}%` }}
                                ></div>

                                {/* Tooltip (Only on hover, not selected) */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-gray-900 border border-gray-700 rounded-lg p-1.5 z-50 pointer-events-none shadow-xl min-w-[80px] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] text-gray-400">{date.getDate()}/{date.getMonth() + 1}</span>
                                    <span className="text-[10px] font-bold text-white">{formatVND(item.revenue)}</span>
                                </div>
                            </div>

                            {/* Date Label */}
                            <div className={`mt-1 text-[8px] md:text-[9px] font-medium transition-colors ${isSelected ? 'text-gray-900 bg-gray-200 px-1 py-0.5 rounded' : 'text-gray-400'}`}>
                                {date.getDate()}/{date.getMonth() + 1}
                            </div>

                            {/* Selection indicator line */}
                            {isSelected && <div className="w-1 h-1 bg-gray-400 rounded-full mt-0.5"></div>}
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500 px-2 mt-2 pt-2 border-t border-gray-100">
                <span>Dữ liệu 30 ngày gần nhất</span>
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Cập nhật tự động
                </span>
            </div>
        </div>
    )
}
