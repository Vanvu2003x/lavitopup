"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Pagination from "@/components/common/Pagination";
import { useToast } from "@/components/ui/Toast";
import { getRevenueDashboard } from "@/services/revenue.service";
import { changeRole, changeUserBalance, getAllUserByKeyword, toggleUserLock, updateUserLevel } from "@/services/user.service";
import { FiActivity, FiArrowRight, FiCalendar, FiCreditCard, FiDollarSign, FiLock, FiMail, FiMinusCircle, FiMoreVertical, FiRefreshCw, FiSearch, FiShield, FiStar, FiTrendingUp, FiUnlock, FiUsers, FiZap } from "react-icons/fi";

const roleLabels = { user: "Nguoi dung", agent: "Dai ly", admin: "Quan tri" };
const levelLabels = { 1: "Co ban", 2: "Nang cao", 3: "VIP" };
const emptySummary = { totalUsers: 0, lockedUsers: 0, vipUsers: 0, totalBalance: 0 };
const emptyRevenue = { total_user_balance: 0, today: { revenue: 0 }, this_month: { revenue: 0, profit: 0 } };
const pageSize = 8;
const formatCurrency = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function UserManagerPage() {
    const toast = useToast();
    const [role, setRole] = useState("user");
    const [keyword, setKeyword] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState(emptySummary);
    const [revenue, setRevenue] = useState(emptyRevenue);
    const [pagination, setPagination] = useState({ page: 1, pageSize, totalItems: 0, totalPages: 1 });
    const [expandedId, setExpandedId] = useState(null);
    const [amounts, setAmounts] = useState({});
    const [notes, setNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionKey, setActionKey] = useState("");
    const [error, setError] = useState("");

    const syncBuffers = (rows) => {
        setAmounts((prev) => Object.fromEntries(rows.map((user) => [user.id, prev[user.id] || ""])));
        setNotes((prev) => Object.fromEntries(rows.map((user) => [user.id, prev[user.id] || ""])));
    };

    const loadRevenue = async () => {
        const res = await getRevenueDashboard();
        if (res?.status) setRevenue(res.data || emptyRevenue);
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
            setError("Khong the tai danh sach khach hang");
        } finally {
            if (withLoader) setLoading(false);
        }
    };

    const refreshAll = async (withLoader = false) => {
        try {
            setRefreshing(true);
            await Promise.all([loadUsers(pagination.page || 1, withLoader), loadRevenue()]);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        Promise.all([loadUsers(1, true), loadRevenue()]).catch(console.error);
    }, []);

    useEffect(() => {
        setExpandedId(null);
        loadUsers(1, true).catch(console.error);
    }, [role, searchTerm]);

    const overviewCards = useMemo(() => ([
        { label: "Tong tai khoan", value: summary.totalUsers, note: roleLabels[role], icon: FiUsers, tone: "text-cyan-200" },
        { label: "Tong so du", value: formatCurrency(summary.totalBalance), note: "Balance hien tai", icon: FiDollarSign, tone: "text-emerald-200" },
        { label: "Tai khoan khoa", value: summary.lockedUsers, note: "Can theo doi", icon: FiShield, tone: "text-rose-200" },
        { label: "Khach VIP", value: summary.vipUsers, note: "Level 3", icon: FiStar, tone: "text-amber-200" },
    ]), [role, summary]);

    const revenueCards = useMemo(() => ([
        { label: "Doanh thu hom nay", value: formatCurrency(revenue?.today?.revenue), icon: FiTrendingUp },
        { label: "Doanh thu thang", value: formatCurrency(revenue?.this_month?.revenue), icon: FiZap },
        { label: "Loi nhuan thang", value: formatCurrency(revenue?.this_month?.profit), icon: FiActivity },
        { label: "Tong balance user", value: formatCurrency(revenue?.total_user_balance), icon: FiCreditCard },
    ]), [revenue]);

    const submitSearch = (event) => {
        event.preventDefault();
        setSearchTerm(keyword.trim());
    };

    const act = async (key, fn, successMessage, includeRevenue = false) => {
        try {
            setActionKey(key);
            await fn();
            await loadUsers(pagination.page, false);
            if (includeRevenue) await loadRevenue();
            toast.success(successMessage);
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Khong the thuc hien thao tac");
        } finally {
            setActionKey("");
        }
    };

    if (loading && !users.length) return <div className="flex justify-center py-24"><div className="h-11 w-11 rounded-full border-4 border-cyan-300/20 border-t-cyan-300 animate-spin" /></div>;

    return (
        <div className="space-y-6 pb-8">
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#020617_0%,#0f172a_50%,#082f49_100%)] shadow-[0_30px_90px_rgba(2,6,23,0.45)]">
                <div className="grid gap-6 px-5 py-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] xl:px-7">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200"><FiUsers className="h-4 w-4" />User workspace</div>
                        <div>
                            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Quan ly user, so du va overview doanh thu trong mot workspace.</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Xem nhanh KPI, loc user, mo chi tiet va dieu chinh so du ngay trong cung man hinh.</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {overviewCards.map((item) => {
                                const Icon = item.icon;
                                return <div key={item.label} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm"><div className="flex items-center justify-between gap-3"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p><Icon className={`h-4 w-4 ${item.tone}`} /></div><p className="mt-4 text-2xl font-semibold text-white">{item.value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{item.note}</p></div>;
                            })}
                        </div>
                    </div>
                    <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-4 backdrop-blur-md">
                        <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">Revenue snapshot</p><h2 className="mt-2 text-xl font-semibold text-white">Overview doanh thu</h2><p className="mt-2 text-sm leading-6 text-slate-400">Ban rut gon de phuc vu van hanh user. Bao cao day du van o trang doanh thu rieng.</p></div><Link href="/admin/danhmuc/RevenueManagerPage" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-cyan-300/30">Bao cao day du<FiArrowRight className="h-4 w-4" /></Link></div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">{revenueCards.map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-4"><div className="flex items-center justify-between gap-3"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p><Icon className="h-4 w-4 text-cyan-200" /></div><p className="mt-4 text-xl font-semibold text-white">{item.value}</p></div>; })}</div>
                    </div>
                </div>
            </motion.section>

            <section className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <form onSubmit={submitSearch} className="flex flex-1 flex-col gap-3 xl:flex-row xl:items-center">
                        <div className="inline-flex flex-wrap rounded-[1.1rem] border border-white/10 bg-slate-950/40 p-1">{["user", "agent", "admin"].map((itemRole) => <button key={itemRole} type="button" onClick={() => setRole(itemRole)} className={`rounded-[0.9rem] px-4 py-2 text-sm font-semibold transition ${role === itemRole ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>{roleLabels[itemRole]}</button>)}</div>
                        <div className="relative flex-1 xl:max-w-lg"><FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tim theo ten hoac email..." className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/45 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/30" /></div>
                        <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"><FiSearch className="h-4 w-4" />Tim user</button>
                    </form>
                    <button type="button" onClick={() => refreshAll()} disabled={refreshing} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:border-cyan-300/30 disabled:opacity-60"><FiRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Lam moi</button>
                </div>
            </section>

            {error ? <div className="rounded-[1.4rem] border border-rose-300/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">{error}</div> : null}

            <section className="space-y-4">
                {users.map((user, index) => {
                    const expanded = expandedId === user.id;
                    const busy = actionKey.startsWith(`${user.id}:`);
                    const amount = amounts[user.id] || "";
                    return (
                        <motion.article key={user.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`overflow-hidden rounded-[1.7rem] border ${user.locked ? "border-rose-300/10 bg-slate-950/30" : "border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.85),rgba(2,6,23,0.95))]"} shadow-[0_20px_60px_rgba(2,6,23,0.22)]`}>
                            <div className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300">#{(pagination.page - 1) * pageSize + index + 1}</span>
                                        <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                                        <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">{roleLabels[user.role] || user.role}</span>
                                        <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">{levelLabels[Number(user.level)] || "Co ban"}</span>
                                        {user.locked ? <span className="rounded-full bg-rose-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-200">Da khoa</span> : null}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400"><span className="inline-flex items-center gap-2"><FiMail className="h-4 w-4" />{user.email}</span><span className="inline-flex items-center gap-2 font-semibold text-cyan-200"><FiDollarSign className="h-4 w-4" />{formatCurrency(user.balance)}</span></div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {(user.role === "user" || user.role === "agent") ? <button type="button" onClick={() => act(`${user.id}:role`, () => changeRole(user.id, user.role === "user" ? "agent" : "user"), user.role === "user" ? "Da nang len dai ly" : "Da ha xuong user")} disabled={user.locked || busy} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-fuchsia-300/30 disabled:opacity-50">{user.role === "user" ? "Nang len dai ly" : "Ha xuong user"}</button> : null}
                                    {user.role === "agent" ? <button type="button" onClick={() => act(`${user.id}:admin`, () => changeRole(user.id, "admin"), "Da nang quyen admin")} disabled={user.locked || busy} className="rounded-full border border-indigo-300/20 bg-indigo-400/10 px-4 py-2 text-xs font-semibold text-indigo-100 transition hover:border-indigo-300/40 disabled:opacity-50">Nang quyen admin</button> : null}
                                    {user.role !== "admin" ? <button type="button" onClick={() => act(`${user.id}:lock`, () => toggleUserLock(user.id), user.locked ? "Da mo khoa tai khoan" : "Da khoa tai khoan")} disabled={busy} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${user.locked ? "border border-emerald-300/20 bg-emerald-400/10 text-emerald-100" : "border border-rose-300/20 bg-rose-400/10 text-rose-100"}`}>{user.locked ? <FiUnlock className="h-4 w-4" /> : <FiLock className="h-4 w-4" />}{user.locked ? "Mo khoa" : "Khoa tai khoan"}</button> : null}
                                    <button type="button" onClick={() => setExpandedId((prev) => prev === user.id ? null : user.id)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-cyan-300/30"><FiMoreVertical className="h-4 w-4" />{expanded ? "Thu gon" : "Chi tiet"}</button>
                                </div>
                            </div>

                            {expanded ? (
                                <div className="grid gap-4 border-t border-white/10 bg-black/15 px-5 py-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.8fr)]">
                                    <div className="space-y-4">
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Ngay tham gia</p><p className="mt-3 inline-flex items-center gap-2 text-sm text-white"><FiCalendar className="h-4 w-4 text-slate-400" />{user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "Chua co du lieu"}</p></div>
                                            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Tong nap</p><p className="mt-3 text-sm font-semibold text-emerald-200">{formatCurrency(user.tong_amount)}</p></div>
                                            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Thong ke don</p><div className="mt-3 space-y-1 text-sm"><p className="text-cyan-200">Mua: {Number(user.so_don_order || 0)}</p><p className="text-fuchsia-200">Nap: {Number(user.so_don_da_nap || 0)}</p></div></div>
                                        </div>
                                        <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Cap do khach hang</p><p className="mt-2 text-sm text-slate-400">Cap nhat nhom pricing va uu tien ho tro.</p></div><div className="inline-flex flex-wrap gap-2">{[1,2,3].map((level) => <button key={level} type="button" onClick={() => act(`${user.id}:level:${level}`, () => updateUserLevel(user.id, level), `Da cap nhat level ${levelLabels[level]}`)} disabled={busy} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${Number(user.level) === level ? "bg-cyan-300 text-slate-950" : "border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/30"} disabled:opacity-50`}>{levelLabels[level]}</button>)}</div></div></div>
                                    </div>
                                    <div className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,30,0.85),rgba(2,6,23,0.98))] p-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">Dieu chinh so du</p>
                                        <h4 className="mt-2 text-lg font-semibold text-white">Cong tru balance user</h4>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">So du hien tai: <span className="font-semibold text-emerald-200">{formatCurrency(user.balance)}</span></p>
                                        <div className="mt-5 space-y-3">
                                            <div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">VND</span><input type="text" inputMode="numeric" value={amount} onChange={(event) => setAmounts((prev) => ({ ...prev, [user.id]: event.target.value.replace(/[^\d]/g, "") }))} className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-16 pr-4 text-sm text-white outline-none transition focus:border-cyan-300/30" placeholder="Nhap so tien..." /></div>
                                            <textarea rows={3} value={notes[user.id] || ""} onChange={(event) => setNotes((prev) => ({ ...prev, [user.id]: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30" placeholder="Ghi chu cho lich su balance..." />
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <button type="button" onClick={() => { if (!amount || Number(amount) <= 0) return toast.error("Nhap so tien hop le"); act(`${user.id}:credit`, () => changeUserBalance(user.id, Number(amount), "credit", notes[user.id] || ""), "Da cong so du", true).then(() => { setAmounts((prev) => ({ ...prev, [user.id]: "" })); setNotes((prev) => ({ ...prev, [user.id]: "" })); }); }} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-50"><FiCreditCard className="h-4 w-4" />{actionKey === `${user.id}:credit` ? "Dang cong..." : "Cong so du"}</button>
                                                <button type="button" onClick={() => { if (!amount || Number(amount) <= 0) return toast.error("Nhap so tien hop le"); if (Number(user.balance || 0) < Number(amount)) return toast.error("So du hien tai khong du de tru"); act(`${user.id}:debit`, () => changeUserBalance(user.id, Number(amount), "debit", notes[user.id] || ""), "Da tru so du", true).then(() => { setAmounts((prev) => ({ ...prev, [user.id]: "" })); setNotes((prev) => ({ ...prev, [user.id]: "" })); }); }} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/15 disabled:opacity-50"><FiMinusCircle className="h-4 w-4" />{actionKey === `${user.id}:debit` ? "Dang tru..." : "Tru so du"}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </motion.article>
                    );
                })}
            </section>

            {pagination.totalPages > 1 ? <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/20 backdrop-blur-sm"><Pagination currentPage={pagination.page} totalPage={pagination.totalPages} totalItems={pagination.totalItems} pageSize={pagination.pageSize} tone="dark" onPageChange={(page) => loadUsers(page, true)} /></div> : null}
        </div>
    );
}
