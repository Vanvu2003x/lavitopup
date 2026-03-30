"use client";

import React from "react";
import Link from "next/link";
import {
    FiAlertTriangle,
    FiArrowRight,
    FiCheck,
    FiClock,
    FiInfo,
    FiKey,
    FiMessageSquare,
    FiPackage,
    FiServer,
    FiShield,
    FiUser,
    FiX,
} from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { createOrder } from "@/services/order.service";
import { connectSocket } from "@/services/websocket.service";

const formatPrice = (price) => `${new Intl.NumberFormat("vi-VN").format(Number(price) || 0)} VNĐ`;

const INTERNAL_KEYS = new Set(["payment_method", "payment_method_label"]);
const PASSWORD_KEYS = new Set(["password", "pass"]);
const NOTE_KEYS = new Set(["note", "ghichu", "ghi_chu"]);

const humanizeKey = (key = "") => {
    const normalized = String(key || "").trim().toLowerCase();
    const labels = {
        uid: "UID",
        userid: "UID",
        user_id: "UID",
        userid2: "UID",
        userId: "UID",
        id: "ID",
        username: "Tài khoản",
        account: "Tài khoản",
        password: "Mật khẩu",
        pass: "Mật khẩu",
        server: "Server",
        serverid: "Server",
        server_id: "Server",
        zoneid: "Zone ID",
        zone_id: "Zone ID",
        idserver: "Server",
        id_server: "Server",
        role_id: "Role ID",
        phone: "Số liên hệ",
        zNumber: "Zalo",
        zalo: "Zalo",
        zalonumber: "Zalo",
        zalo_number: "Zalo",
        note: "Ghi chú",
        openid: "Open ID",
        playerid: "Player ID",
        player_id: "Player ID",
    };

    if (labels[key]) return labels[key];
    if (labels[normalized]) return labels[normalized];

    return String(key || "")
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (char) => char.toUpperCase());
};

const normalizeGroup = (key = "") => {
    const normalized = String(key || "").trim().toLowerCase();

    if (["uid", "userid", "user_id", "id", "openid", "playerid", "player_id"].includes(normalized)) return "uid";
    if (["username", "account"].includes(normalized)) return "username";
    if (["password", "pass"].includes(normalized)) return "password";
    if (["server", "serverid", "server_id"].includes(normalized)) return "server";
    if (["idserver", "id_server", "zoneid", "zone_id", "role_id"].includes(normalized)) return "server_detail";
    if (["phone", "zalo", "zalonumber", "zalo_number"].includes(normalized)) return "phone";
    if (NOTE_KEYS.has(normalized)) return "note";

    return normalized;
};

const getVisibleRows = (data) => {
    const rows = [];
    const accountInfo = data.accountInfo || {};
    const seen = new Set();

    if (data.paymentMethod?.label) {
        rows.push({
            key: "payment-method",
            label: "Thanh toán",
            value: data.paymentMethod.label,
            icon: FiShield,
        });
        seen.add("payment_method");
    }

    Object.entries(accountInfo).forEach(([key, value]) => {
        if (INTERNAL_KEYS.has(key)) return;
        if (value === undefined || value === null || String(value).trim() === "") return;

        const group = normalizeGroup(key);
        if (seen.has(group)) return;
        seen.add(group);

        rows.push({
            key,
            label: humanizeKey(key),
            value: PASSWORD_KEYS.has(String(key).toLowerCase()) ? "••••••" : String(value),
            icon:
                PASSWORD_KEYS.has(String(key).toLowerCase())
                    ? FiKey
                    : group === "phone"
                      ? FiMessageSquare
                      : group === "server" || group === "server_detail"
                        ? FiServer
                        : FiUser,
            isNote: group === "note",
        });
    });

    if (!seen.has("uid") && (data.uid || data.username)) {
        rows.push({
            key: "account-fallback",
            label: data.uid ? "UID" : "Tài khoản",
            value: data.uid || data.username,
            icon: FiUser,
        });
    }

    if (!seen.has("server") && data.server) {
        rows.push({
            key: "server-fallback",
            label: "Server",
            value: data.server,
            icon: FiServer,
        });
    }

    if (!seen.has("server_detail") && data.idServer) {
        rows.push({
            key: "server-detail-fallback",
            label: "Zone ID",
            value: data.idServer,
            icon: FiServer,
        });
    }

    if (!seen.has("phone") && data.zaloNumber) {
        rows.push({
            key: "phone-fallback",
            label: "Zalo",
            value: data.zaloNumber,
            icon: FiMessageSquare,
        });
    }

    if (!seen.has("note") && data.note) {
        rows.push({
            key: "note-fallback",
            label: "Ghi chú",
            value: data.note,
            icon: FiInfo,
            isNote: true,
        });
    }

    return rows;
};

export default function ConfirmForm({ data, onClick }) {
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);

    const detailRows = React.useMemo(() => getVisibleRows(data), [data]);

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

                <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
                    <div className="relative flex h-32 items-center justify-center overflow-hidden bg-emerald-500">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_55%)]" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
                            <FiCheck className="text-4xl text-emerald-500" strokeWidth={3} />
                        </div>
                    </div>

                    <div className="px-7 pb-7 pt-6 text-center">
                        <h2 className="text-2xl font-black text-slate-900">Tạo đơn thành công</h2>
                        <p className="mt-2 text-sm text-slate-500">Đơn nạp đã được ghi nhận và đang chuyển sang bước xử lý.</p>

                        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
                            <div className="flex items-start justify-between gap-3">
                                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Gói nạp</span>
                                <span className="flex-1 text-right font-bold text-slate-900">{data.package.package_name}</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Tổng tiền</span>
                                <span className="text-lg font-black text-emerald-600">{formatPrice(data.package.price)}</span>
                            </div>
                        </div>

                        <div className="mt-5 inline-flex items-center gap-2 text-xs text-slate-400">
                            <FiClock />
                            <span>Thời gian xử lý thường từ 1 đến 5 phút.</span>
                        </div>

                        <div className="mt-7 space-y-3">
                            <Link
                                href="/account"
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 font-bold text-white transition hover:bg-black"
                            >
                                <FiUser />
                                Xem đơn trong tài khoản
                            </Link>

                            <button
                                type="button"
                                onClick={onClick}
                                className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                            >
                                Đóng cửa sổ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isSubmitting ? onClick : undefined} />

            <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#151021] shadow-2xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500" />
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

                <div className="relative z-10 p-6 pb-4">
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                                <FiShield className="text-fuchsia-400" />
                                Xác nhận đơn nạp
                            </h2>
                            <p className="mt-2 text-sm text-[#9fb8db]">Kiểm tra lại thông tin trước khi trừ số dư.</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClick}
                            disabled={isSubmitting}
                            className="rounded-full p-1 text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-[#090514] p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-300">
                                <FiPackage size={22} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Gói nạp</p>
                                <p className="truncate text-base font-bold text-white">{data.package.package_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Giá</p>
                                <p className="text-lg font-black text-emerald-400">{formatPrice(data.package.price)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 max-h-[54vh] space-y-3 overflow-y-auto px-6 pb-4">
                    {detailRows.map((row) =>
                        row.isNote ? (
                            <div key={row.key} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                                <p className="mb-1.5 flex items-center gap-2 text-sm text-slate-300">
                                    <row.icon className="text-slate-500" />
                                    {row.label}
                                </p>
                                <p className="text-sm leading-6 text-white/90">{row.value}</p>
                            </div>
                        ) : (
                            <div key={row.key} className="flex items-center justify-between gap-3 border-b border-white/6 py-2.5">
                                <span className="flex items-center gap-2 text-sm text-slate-400">
                                    <row.icon className="text-slate-600" />
                                    {row.label}
                                </span>
                                <span className="max-w-[58%] text-right text-sm font-medium text-white break-words">{row.value}</span>
                            </div>
                        )
                    )}

                    <div className="flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3">
                        <FiAlertTriangle className="mt-0.5 shrink-0 text-amber-300" />
                        <p className="text-xs leading-6 text-amber-100">
                            Hệ thống sẽ xử lý theo đúng thông tin bạn đã nhập. Nếu nhập sai UID, server hoặc tài khoản, đơn có thể không hỗ trợ hoàn lại.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-3 p-6 pt-3">
                    <button
                        type="button"
                        onClick={onClick}
                        disabled={isSubmitting}
                        className="flex-1 rounded-2xl border border-white/8 bg-[#1d1730] px-4 py-3 font-semibold text-slate-300 transition hover:bg-[#281f3d] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Quay lại
                    </button>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={async () => {
                            if (isSubmitting) return;

                            setIsSubmitting(true);

                            const accountInfo = {
                                ...(data.accountInfo || {}),
                                payment_method: data.paymentMethod?.id || null,
                                payment_method_label: data.paymentMethod?.label || null,
                                note: data.accountInfo?.note || data.note || "",
                            };

                            if (!accountInfo.server && data.server) accountInfo.server = data.server;
                            if (!accountInfo.id_server && data.idServer) accountInfo.id_server = data.idServer;
                            if (!accountInfo.uid && data.uid) accountInfo.uid = data.uid;
                            if (!accountInfo.username && data.username) accountInfo.username = data.username;
                            if (!accountInfo.password && data.password) accountInfo.password = data.password;
                            if (!accountInfo.zaloNumber && data.zaloNumber) accountInfo.zaloNumber = data.zaloNumber;
                            if (!accountInfo.phone && data.zaloNumber) accountInfo.phone = data.zaloNumber;

                            const payload = {
                                package_id: data.package.id,
                                amount: data.package.price,
                                account_info: JSON.stringify(accountInfo),
                            };

                            try {
                                await createOrder(payload);
                                connectSocket(localStorage.getItem("token"));
                                setIsSuccess(true);
                            } catch (error) {
                                const message = error?.response?.data?.message || "Tạo đơn hàng thất bại.";
                                toast.error(message);
                                setIsSubmitting(false);
                            }
                        }}
                        className="flex-[1.5] rounded-2xl bg-gradient-to-r from-sky-500 to-fuchsia-500 px-4 py-3 font-bold text-white shadow-[0_12px_30px_rgba(59,130,246,0.25)] transition hover:from-sky-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                Đang xử lý...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Xác nhận nạp
                                <FiArrowRight size={18} />
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
