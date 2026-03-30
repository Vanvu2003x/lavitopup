"use client";

import { useEffect, useMemo, useState } from "react";
import {
    FiCheckCircle,
    FiChevronDown,
    FiEdit3,
    FiHash,
    FiLock,
    FiPhone,
    FiSearch,
    FiServer,
    FiShield,
    FiUser,
    FiZap,
} from "react-icons/fi";

const fieldClass =
    "h-12 w-full rounded-2xl border border-white/10 bg-[#09162f]/92 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#7f9fce] focus:border-[#5eead4] focus:ring-4 focus:ring-[#5eead4]/12 sm:h-[3.25rem]";
const textAreaClass =
    "w-full rounded-2xl border border-white/10 bg-[#09162f]/92 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#7f9fce] focus:border-[#5eead4] focus:ring-4 focus:ring-[#5eead4]/12";
const iconClass =
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-[#7f9fce] transition group-focus-within:text-[#5eead4]";

const LOGIN_FIELD_NAMES = ["username", "account", "password", "pass"];
const UID_FIELD_NAMES = ["userid", "user_id", "uid", "id", "openid", "playerid", "player_id"];
const PHONE_FIELD_NAMES = ["phone", "sdt", "zalo", "zalonumber", "zalo_number"];
const NOTE_FIELD_NAMES = ["note", "ghichu", "ghi_chu"];

const normalizeFieldName = (value = "") => String(value || "").trim().toLowerCase();
const isLoginField = (name) => LOGIN_FIELD_NAMES.includes(normalizeFieldName(name));
const isUidField = (name) => UID_FIELD_NAMES.includes(normalizeFieldName(name));
const isPhoneField = (name) => PHONE_FIELD_NAMES.includes(normalizeFieldName(name));
const isNoteField = (name) => NOTE_FIELD_NAMES.includes(normalizeFieldName(name));

const getFieldIcon = (name) => {
    const normalized = normalizeFieldName(name);

    if (isLoginField(normalized)) {
        return normalized === "password" || normalized === "pass" ? FiLock : FiUser;
    }

    if (isPhoneField(normalized)) return FiPhone;
    if (normalized.includes("server") || normalized.includes("zone")) return FiServer;
    if (normalized.includes("id")) return FiHash;

    return FiUser;
};

const getFieldValue = (name, values) => {
    const normalized = normalizeFieldName(name);

    if (normalized === "password" || normalized === "pass") return values.password;
    if (normalized === "username" || normalized === "account") return values.username;
    if (isUidField(normalized)) return values.uid;
    if (isPhoneField(normalized)) return values.zaloNumber;
    if (isNoteField(normalized)) return values.note;
    if (normalized.includes("server") || normalized.includes("zone") || normalized.includes("role")) {
        return values.idServer || values.server;
    }

    return values.extraFields[normalized] || "";
};

const setFieldValue = (name, value, setters) => {
    const normalized = normalizeFieldName(name);

    if (normalized === "password" || normalized === "pass") return setters.setPassword(value);
    if (normalized === "username" || normalized === "account") return setters.setUsername(value);
    if (isUidField(normalized)) return setters.setUid(value);
    if (isPhoneField(normalized)) return setters.setZaloNumber(value);
    if (isNoteField(normalized)) return setters.setNote(value);
    if (normalized.includes("server") || normalized.includes("zone") || normalized.includes("role")) {
        setters.setIdServer(value);
        if (!Array.isArray(setters.serverOptions) || setters.serverOptions.length === 0) {
            setters.setServer(value);
        }
        return;
    }

    setters.setExtraFields((prev) => ({ ...prev, [normalized]: value }));
};

const shouldShowPartnerField = (name, rechargeMethod) => {
    const normalized = normalizeFieldName(name);

    if (isNoteField(normalized)) return false;
    if (rechargeMethod === "uid" && isLoginField(normalized)) return false;
    if (rechargeMethod === "login" && isUidField(normalized)) return false;

    return true;
};

export default function TopUpForm({
    rechargeMethod,
    setRechargeMethod,
    uid,
    setUid,
    username,
    setUsername,
    password,
    setPassword,
    server,
    setServer,
    idServer,
    setIdServer,
    zaloNumber,
    setZaloNumber,
    note,
    setNote,
    extraFields,
    setExtraFields,
    game,
    selectedPkg,
    availableMethods,
}) {
    const [showExtraFields, setShowExtraFields] = useState(false);
    const serverOptions = Array.isArray(game?.server) ? game.server.filter(Boolean) : [];
    const partnerFields = Array.isArray(game?.input_fields) ? game.input_fields : [];

    const visiblePartnerFields = useMemo(
        () => partnerFields.filter((field) => shouldShowPartnerField(field?.name, rechargeMethod)),
        [partnerFields, rechargeMethod]
    );

    const hasDynamicPartnerFields = visiblePartnerFields.length > 0;
    const includesPhoneField = visiblePartnerFields.some((field) => isPhoneField(field?.name));

    useEffect(() => {
        if (rechargeMethod === "login") {
            setShowExtraFields(true);
        }
    }, [rechargeMethod]);

    return (
        <section className="surface-card overflow-hidden rounded-[2rem] p-4 sm:p-5">
            <div className="mb-4">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5eead4]">Thông tin nạp</p>
                        <h2 className="mt-2 text-lg font-bold text-white sm:text-xl">
                            {rechargeMethod === "uid" ? "Nhập thông tin thật nhanh" : "Đăng nhập tài khoản"}
                        </h2>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#a7c0e0]">
                        Chuẩn hóa
                    </div>
                </div>
                <p className="mt-2.5 text-xs leading-5 text-[#8aa0d0]">
                    Nhập chính xác để xử lý nhanh hơn.
                </p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-[#071222]/60 p-1">
                <button
                    type="button"
                    disabled={!availableMethods.uid}
                    onClick={() => setRechargeMethod("uid")}
                    className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${rechargeMethod === "uid" ? "bg-[#5eead4] text-[#04151f] shadow-lg shadow-[#5eead4]/20" : "text-[#a7c0e0] hover:bg-white/[0.04]"} ${!availableMethods.uid ? "cursor-not-allowed opacity-40" : ""}`}
                >
                    UID / ID
                </button>
                <button
                    type="button"
                    disabled={!availableMethods.login}
                    onClick={() => setRechargeMethod("login")}
                    className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${rechargeMethod === "login" ? "bg-[#fb7185] text-white shadow-lg shadow-[#fb7185]/20" : "text-[#a7c0e0] hover:bg-white/[0.04]"} ${!availableMethods.login ? "cursor-not-allowed opacity-40" : ""}`}
                >
                    Tài khoản
                </button>
            </div>

            <div className="space-y-3">
                {hasDynamicPartnerFields ? (
                    visiblePartnerFields.map((field) => {
                        const normalized = normalizeFieldName(field?.name);
                        const options = Array.isArray(field?.options) ? field.options : [];
                        const value = getFieldValue(field?.name, {
                            uid,
                            username,
                            password,
                            server,
                            idServer,
                            zaloNumber,
                            note,
                            extraFields: extraFields || {},
                        });
                        const Icon = getFieldIcon(field?.name);
                        const label = field?.label || field?.name;
                        const placeholder = options.length > 0 ? `Chọn ${label}` : `Nhập ${label}`;

                        return (
                            <div key={field?.name || normalized} className="space-y-1.5">
                                <label className="text-xs font-medium text-[#a7c0e0]">{label}</label>
                                <div className="group relative">
                                    <Icon className={iconClass} />
                                    {options.length > 0 || field?.type === "select" ? (
                                        <>
                                            <select
                                                value={value}
                                                onChange={(e) => setFieldValue(field?.name, e.target.value, {
                                                    setUid,
                                                    setUsername,
                                                    setPassword,
                                                    setServer,
                                                    setIdServer,
                                                    setZaloNumber,
                                                    setNote,
                                                    setExtraFields,
                                                    serverOptions,
                                                })}
                                                className={fieldClass}
                                            >
                                                <option value="">{placeholder}</option>
                                                {options.map((option) => (
                                                    <option key={`${field?.name}-${option?.value}`} value={option?.value}>
                                                        {option?.label || option?.value}
                                                    </option>
                                                ))}
                                            </select>
                                            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7f9fce] h-4 w-4" />
                                        </>
                                    ) : (
                                        <input
                                            type={normalized === "password" || normalized === "pass" ? "password" : "text"}
                                            value={value}
                                            onChange={(e) => setFieldValue(field?.name, e.target.value, {
                                                setUid,
                                                setUsername,
                                                setPassword,
                                                setServer,
                                                setIdServer,
                                                setZaloNumber,
                                                setNote,
                                                setExtraFields,
                                                serverOptions,
                                            })}
                                            placeholder={placeholder}
                                            className={fieldClass}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <>
                        {serverOptions.length > 0 && !selectedPkg?.id_server && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[#a7c0e0]">Máy chủ</label>
                                <div className="group relative">
                                    <FiServer className={iconClass} />
                                    <select value={server} onChange={(e) => setServer(e.target.value)} className={fieldClass}>
                                        {serverOptions.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7f9fce] h-4 w-4" />
                                </div>
                            </div>
                        )}

                        {(selectedPkg?.id_server || serverOptions.length === 0) && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[#a7c0e0]">
                                    {rechargeMethod === "uid" ? "Zone ID" : "Server"}
                                </label>
                                <div className="group relative">
                                    <FiHash className={iconClass} />
                                    <input
                                        type="text"
                                        value={idServer}
                                        onChange={(e) => setIdServer(e.target.value)}
                                        placeholder={rechargeMethod === "uid" ? "VD: 3021" : "Nhập server"}
                                        className={fieldClass}
                                    />
                                </div>
                            </div>
                        )}

                        {rechargeMethod === "uid" ? (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[#a7c0e0]">Player ID</label>
                                <div className="group relative">
                                    <FiUser className={iconClass} />
                                    <input
                                        type="text"
                                        value={uid}
                                        onChange={(e) => setUid(e.target.value)}
                                        placeholder="Nhập UID"
                                        className={fieldClass}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-[#a7c0e0]">Tài khoản</label>
                                    <div className="group relative">
                                        <FiUser className={iconClass} />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Tài khoản"
                                            className={fieldClass}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-[#a7c0e0]">Mật khẩu</label>
                                    <div className="group relative">
                                        <FiLock className={iconClass} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mật khẩu"
                                            className={fieldClass}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-medium text-[#a7c0e0]">
                    <FiShield size={12} className="text-[#5eead4]" />
                    Bảo mật
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-medium text-[#a7c0e0]">
                    <FiZap size={12} className="text-[#fb7185]" />
                    Tự động
                </div>
            </div>

            <button
                type="button"
                onClick={() => setShowExtraFields(!showExtraFields)}
                className="mt-3.5 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-[#a7c0e0] transition hover:bg-white/[0.05]"
            >
                <span className="flex items-center gap-2">
                    <FiEdit3 size={14} className="text-[#5eead4]" />
                    Thêm thông tin
                </span>
                <FiChevronDown size={14} className={`transition ${showExtraFields ? "rotate-180" : ""}`} />
            </button>

            {showExtraFields && (
                <div className="mt-3 space-y-3 rounded-lg border border-white/10 bg-[#081225]/60 p-3">
                    {!includesPhoneField && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#a7c0e0]">Zalo hỗ trợ</label>
                            <div className="group relative">
                                <FiPhone className={iconClass} />
                                <input
                                    type="text"
                                    value={zaloNumber}
                                    onChange={(e) => setZaloNumber(e.target.value)}
                                    placeholder="Số Zalo"
                                    className={fieldClass}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#a7c0e0]">Ghi chú</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Ghi chú thêm..."
                            className={textAreaClass}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
