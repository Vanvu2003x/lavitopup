"use client";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { formatChartData } from "@/utils/formatDateForChart";

const formatCurrency = (value) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
};

export default function ProfitMarginChart({ rawData }) {
    const data = formatChartData(rawData);

    // Calculate profit for each data point
    const chartData = data.map(item => ({
        ...item,
        profit: (item.total_amount || 0) - (item.total_cost || 0),
        total_amount: item.total_amount || 0,
        total_cost: item.total_cost || 0
    }));

    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />

                    <XAxis
                        dataKey="date"
                        padding={{ left: 40, right: 40 }}
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickLine={{ stroke: '#94a3b8' }}
                        axisLine={{ stroke: '#475569' }}
                    />

                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickLine={{ stroke: '#94a3b8' }}
                        axisLine={{ stroke: '#475569' }}
                        tickFormatter={formatCurrency}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#f1f5f9',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '12px',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                            padding: '12px'
                        }}
                        formatter={(value, name) => {
                            const labels = {
                                total_amount: "Doanh thu",
                                total_cost: "Chi phí",
                                profit: "Lợi nhuận"
                            };
                            return [
                                `${value.toLocaleString('vi-VN')} đ`,
                                labels[name] || name
                            ];
                        }}
                        labelFormatter={(label) => `Ngày ${label}`}
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />

                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ color: '#cbd5e1', paddingBottom: '10px' }}
                    />

                    <Area
                        type="monotone"
                        dataKey="total_amount"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                        name="Doanh thu"
                        animationDuration={1500}
                    />

                    <Area
                        type="monotone"
                        dataKey="total_cost"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="url(#colorCost)"
                        name="Chi phí"
                        animationDuration={1500}
                    />

                    <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fill="url(#colorProfit)"
                        name="Lợi nhuận"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
