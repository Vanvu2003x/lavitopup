"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";
import { useToast } from "@/components/ui/Toast";
import {
    changeRole,
    changeUserBalance,
    getAllUserByKeyword,
    toggleUserLock,
    updateUserLevel,
} from "@/services/user.service";
import { FiCreditCard, FiLock, FiRefreshCw, FiSearch, FiShield, FiUnlock, FiUsers } from "react-icons/fi";

const roleLabels = { user: "Người dùng", agent: "Đại lý", admin: "Quản trị" };
const levelLabels = { 1: "Cơ bản", 2: "Nâng cao", 3: "VIP" };
const pageSize = 8;
const emptySummary = { totalUsers: 0, lockedUsers: 0, vipUsers: 0, totalBalance: 0 };

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function UserManagerPage() {
    const toast = useToast();
    const [role, setRole] = useState("user");
    const [keyword, setKeyword] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState(emptySummary);
    const [pagination, setPagination] = useState({ page: 1, pageSize, totalItems: 0, totalPages: 1 });
    const [expandedId, setExpandedId] = useState(null);
    const [amounts, setAmounts] = useState({});
    const [notes, setNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionKey, setActionKey] = useState("");
    const [error, setError] = useState("");

    const overviewCards = useMemo(
        () => [
            { label: "Tổng tài khoản", value: summary.totalUsers },
            { label: "Tổng số dư", value: formatCurrency(summary.totalBalance) },
            { label: "Tài khoản khóa", value: summary.lockedUsers },
            { label: "Khách VIP", value: summary.vipUsers },
        ],
        [summary]
    );

    const syncBuffers = (rows) => {
        setAmounts((prev) => Object.fromEntries(rows.map((user) => [user.id, prev[user.id] || ""])));
        setNotes((prev) => Object.fromEntries(rows.map((user) => [user.id, prev[user.id] || ""])));
    };

    const loadUsers = async (page = 1, withLoader = false) => {
        try {
            if (withLoader) setLoading(true);
            setError("");

            const res = await getAllUserByKeyword(role, searchTerm, page, pageSize);
            const rows = (res?.users || []).map((user) => ({ ...user, locked: user.status === "banned" }));
            setUsers(rows);
            setSummary(res?.summary || emptySummary);
            setPagination(res?.pagination || { page: 1, pageSize, totalItems: 0, totalPages: 1 });
            syncBuffers(rows);
        } catch (err) {
            console.error(err);
            setError("Không thể tải danh sách khách hàng.");
        } finally {
            if (withLoader) setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(1, true).catch(console.error);
    }, []);

    useEffect(() => {
        setExpandedId(null);
        loadUsers(1, true).catch(console.error);
    }, [role, searchTerm]);

    const refreshAll = async (withLoader = false) => {
        try {
            setRefreshing(true);
            await loadUsers(pagination.page || 1, withLoader);
        } finally {
            setRefreshing(false);
        }
    };

    const submitSearch = (event) => {
        event.preventDefault();
        setSearchTerm(keyword.trim());
    };

    const act = async (key, fn, successMessage) => {
        try {
            setActionKey(key);
            await fn();
            await loadUsers(pagination.page, false);
            toast.success(successMessage);
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Không thể thực hiện thao tác.");
        } finally {
            setActionKey("");
        }
    };

    if (loading && !users.length) {
        return (
            <div className="flex justify-center py-24">
                <div className="h-11 w-11 animate-spin rounded-full border-4 border-cyan-300/20 border-t-cyan-300" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-8">
            <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                            <FiUsers />
                            User manager
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold text-white">Quản lý khách hàng</h1>
                        <p className="mt-1 text-sm text-slate-400">Giữ lại các thao tác chính: lọc, tìm, đổi quyền, khóa/mở khóa, chỉnh level và số dư.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => refreshAll()}
                        disabled={refreshing}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                    >
                        <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                        Làm mới
                    </button>
                </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/40 p-3.5">
                        <p className="text-xs text-slate-400">{item.label}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                    </div>
                ))}
            </section>

            <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <form onSubmit={submitSearch} className="flex w-full flex-col gap-3 xl:flex-row xl:items-center">
                        <div className="inline-flex flex-wrap rounded-xl border border-white/10 bg-slate-950/40 p-1">
                            {["user", "agent", "admin"].map((itemRole) => (
                                <button
                                    key={itemRole}
                                    type="button"
                                    onClick={() => setRole(itemRole)}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                        role === itemRole ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/10"
                                    }`}
                                >
                                    {roleLabels[itemRole]}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full xl:max-w-lg">
                            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="Tìm theo tên hoặc email..."
                                className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
                            />
                        </div>

                        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                            <FiSearch />
                            Tìm
                        </button>
                    </form>
                </div>
            </section>

            {error ? <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

            <section className="space-y-3">
                {users.map((user, index) => {
                    const expanded = expandedId === user.id;
                    const busy = actionKey.startsWith(`${user.id}:`);
                    const amount = amounts[user.id] || "";

                    return (
                        <article key={user.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300">
                                            #{(pagination.page - 1) * pageSize + index + 1}
                                        </span>
                                        <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                                        <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-300">{roleLabels[user.role] || user.role}</span>
                                        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] text-cyan-200">
                                            {levelLabels[Number(user.level)] || "Cơ bản"}
                                        </span>
                                        {user.locked ? (
                                            <span className="rounded-full border border-rose-300/30 bg-rose-500/10 px-3 py-1 text-[11px] text-rose-100">Đã khóa</span>
                                        ) : null}
                                    </div>
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                    <p className="text-sm font-semibold text-cyan-200">{formatCurrency(user.balance)}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {(user.role === "user" || user.role === "agent") ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                act(
                                                    `${user.id}:role`,
                                                    () => changeRole(user.id, user.role === "user" ? "agent" : "user"),
                                                    user.role === "user" ? "Đã nâng lên đại lý." : "Đã hạ xuống người dùng."
                                                )
                                            }
                                            disabled={user.locked || busy}
                                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                                        >
                                            {user.role === "user" ? "Nâng đại lý" : "Hạ người dùng"}
                                        </button>
                                    ) : null}

                                    {user.role === "agent" ? (
                                        <button
                                            type="button"
                                            onClick={() => act(`${user.id}:admin`, () => changeRole(user.id, "admin"), "Đã nâng quyền quản trị.")}
                                            disabled={user.locked || busy}
                                            className="rounded-lg border border-indigo-300/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-500/20 disabled:opacity-50"
                                        >
                                            Nâng quản trị
                                        </button>
                                    ) : null}

                                    {user.role !== "admin" ? (
                                        <button
                                            type="button"
                                            onClick={() => act(`${user.id}:lock`, () => toggleUserLock(user.id), user.locked ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.")}
                                            disabled={busy}
                                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                                                user.locked
                                                    ? "border border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
                                                    : "border border-rose-300/30 bg-rose-500/10 text-rose-100"
                                            }`}
                                        >
                                            {user.locked ? <FiUnlock size={13} /> : <FiLock size={13} />}
                                            {user.locked ? "Mở khóa" : "Khóa"}
                                        </button>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={() => setExpandedId((prev) => (prev === user.id ? null : user.id))}
                                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                                    >
                                        {expanded ? "Thu gọn" : "Chi tiết"}
                                    </button>
                                </div>
                            </div>

                            {expanded ? (
                                <div className="mt-3 grid gap-3 border-t border-white/10 pt-3 xl:grid-cols-[1fr_1fr]">
                                    <div className="space-y-3">
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <InfoBox label="Ngày tham gia" value={user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "Chưa có"} />
                                            <InfoBox label="Tổng nạp" value={formatCurrency(user.tong_amount)} />
                                            <InfoBox label="Thống kê đơn" value={`Mua: ${Number(user.so_don_order || 0)} | Nạp: ${Number(user.so_don_da_nap || 0)}`} />
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                                            <p className="text-xs text-slate-400">Cấp độ khách hàng</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {[1, 2, 3].map((level) => (
                                                    <button
                                                        key={level}
                                                        type="button"
                                                        onClick={() => act(`${user.id}:level:${level}`, () => updateUserLevel(user.id, level), `Đã cập nhật level ${levelLabels[level]}.`)}
                                                        disabled={busy}
                                                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                                                            Number(user.level) === level
                                                                ? "bg-cyan-300 text-slate-950"
                                                                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                                        }`}
                                                    >
                                                        {levelLabels[level]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                                        <p className="text-xs text-slate-400">Điều chỉnh số dư</p>
                                        <p className="mt-1 text-sm text-slate-300">
                                            Số dư hiện tại: <span className="font-semibold text-emerald-200">{formatCurrency(user.balance)}</span>
                                        </p>

                                        <div className="mt-3 space-y-2">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={amount}
                                                onChange={(event) =>
                                                    setAmounts((prev) => ({
                                                        ...prev,
                                                        [user.id]: event.target.value.replace(/[^\d]/g, ""),
                                                    }))
                                                }
                                                className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none focus:border-cyan-300/30"
                                                placeholder="Nhập số tiền..."
                                            />
                                            <textarea
                                                rows={3}
                                                value={notes[user.id] || ""}
                                                onChange={(event) =>
                                                    setNotes((prev) => ({
                                                        ...prev,
                                                        [user.id]: event.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/30"
                                                placeholder="Ghi chú..."
                                            />
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!amount || Number(amount) <= 0) return toast.error("Nhập số tiền hợp lệ.");
                                                        act(
                                                            `${user.id}:credit`,
                                                            () => changeUserBalance(user.id, Number(amount), "credit", notes[user.id] || ""),
                                                            "Đã cộng số dư."
                                                        ).then(() => {
                                                            setAmounts((prev) => ({ ...prev, [user.id]: "" }));
                                                            setNotes((prev) => ({ ...prev, [user.id]: "" }));
                                                        });
                                                    }}
                                                    disabled={busy}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-50"
                                                >
                                                    <FiCreditCard size={14} />
                                                    {actionKey === `${user.id}:credit` ? "Đang cộng..." : "Cộng số dư"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!amount || Number(amount) <= 0) return toast.error("Nhập số tiền hợp lệ.");
                                                        if (Number(user.balance || 0) < Number(amount)) return toast.error("Số dư hiện tại không đủ để trừ.");

                                                        act(
                                                            `${user.id}:debit`,
                                                            () => changeUserBalance(user.id, Number(amount), "debit", notes[user.id] || ""),
                                                            "Đã trừ số dư."
                                                        ).then(() => {
                                                            setAmounts((prev) => ({ ...prev, [user.id]: "" }));
                                                            setNotes((prev) => ({ ...prev, [user.id]: "" }));
                                                        });
                                                    }}
                                                    disabled={busy}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-50"
                                                >
                                                    <FiShield size={14} />
                                                    {actionKey === `${user.id}:debit` ? "Đang trừ..." : "Trừ số dư"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </article>
                    );
                })}
            </section>

            {pagination.totalPages > 1 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <Pagination
                        currentPage={pagination.page}
                        totalPage={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.pageSize}
                        tone="dark"
                        onPageChange={(page) => loadUsers(page, true)}
                    />
                </div>
            ) : null}
        </div>
    );
}

function InfoBox({ label, value }) {
    return (
        <div className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
            <p className="text-[11px] text-slate-500">{label}</p>
            <p className="mt-1 text-sm text-slate-200">{value}</p>
        </div>
    );
}
