"use client";
import { formatChartData } from "@/utils/formatDateForChart";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
} from "recharts";

export default function LineChartComponent({ rawData }) {
    const data = formatChartData(rawData);
    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
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
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#f1f5f9',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        itemStyle={{ padding: 0 }}
                        formatter={(value, name) =>
                            [`${value.toLocaleString('vi-VN')} đ`, name === "total_amount" ? "Doanh thu" : "Chi phí"]
                        }
                        labelFormatter={(label) => `Ngày ${label}`}
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ color: '#cbd5e1' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="total_amount"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        name="Doanh thu"
                        dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
                        activeDot={{ r: 6, stroke: '#22d3ee', strokeWidth: 2, fill: '#06b6d4' }}
                        animationDuration={1500}
                    />
                    <Line
                        type="monotone"
                        dataKey="total_cost"
                        stroke="#fb7185"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        name="Chi phí"
                        dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
                        activeDot={{ r: 6, stroke: '#fb7185', strokeWidth: 2, fill: '#f43f5e' }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
