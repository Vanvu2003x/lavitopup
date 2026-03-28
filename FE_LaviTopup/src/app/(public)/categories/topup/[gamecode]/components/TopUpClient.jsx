"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiZap } from "react-icons/fi";
import { HiSwitchHorizontal } from "react-icons/hi";

import ConfirmForm from "@/components/auth/ConfirmForm";
import { useToast } from "@/components/ui/Toast";
import { getInfo } from "@/services/auth.service";
import { getImageSrc } from "@/utils/imageHelper";

import ImportantNotes from "./ImportantNotes";
import PackageGrid from "./PackageGrid";
import PaymentMethodGrid, { walletPaymentMethod } from "./PaymentMethodGrid";
import StickyBottomBar from "./StickyBottomBar";
import TopUpForm from "./TopUpForm";

export default function TopUpClient({ game, listPkg: initialListPkg, allTopUpGames = [] }) {
    const toast = useToast();
    const router = useRouter();

    const [listPkg] = useState(initialListPkg || []);
    const [loading] = useState(!initialListPkg || initialListPkg.length === 0);
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [rechargeMethod, setRechargeMethod] = useState(() => {
        if (!initialListPkg || initialListPkg.length === 0) return "uid";
        const hasUid = initialListPkg.some((pkg) => pkg.status === "active" && !["log", "login"].includes(pkg.package_type?.toLowerCase()));
        const hasLogin = initialListPkg.some((pkg) => pkg.status === "active" && ["log", "login"].includes(pkg.package_type?.toLowerCase()));
        return !hasUid && hasLogin ? "login" : "uid";
    });
    const [userLevel, setUserLevel] = useState(1);
    const [showGameDropdown, setShowGameDropdown] = useState(false);
    const [idServer, setIdServer] = useState("");
    const [server, setServer] = useState("");
    const [uid, setUid] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [zaloNumber, setZaloNumber] = useState("");
    const [note, setNote] = useState("");
    const [confirmForm, setConfirmForm] = useState(false);

    const selectedPaymentMethod = walletPaymentMethod;
    const posterSrc = getImageSrc(game?.poster || game?.thumbnail, "/imgs/removed_bg.png");
    const thumbnailSrc = getImageSrc(game?.thumbnail, "/imgs/removed_bg.png");

    useEffect(() => {
        if (game?.server?.length > 0) {
            setServer(game.server[0]);
        }
    }, [game]);

    useEffect(() => {
        const fetchUserLevel = async () => {
            try {
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
                const data = await Promise.race([getInfo(), timeoutPromise]);
                if (data?.user) {
                    setUserLevel(data.user.level || 1);
                }
            } catch {
                setUserLevel(1);
            }
        };

        fetchUserLevel();
    }, []);

    const availableMethods = useMemo(() => ({
        uid: listPkg.some((pkg) => pkg.status === "active" && !["log", "login"].includes(pkg.package_type?.toLowerCase())),
        login: listPkg.some((pkg) => pkg.status === "active" && ["log", "login"].includes(pkg.package_type?.toLowerCase())),
    }), [listPkg]);

    const displayPackages = useMemo(() => (
        rechargeMethod === "uid"
            ? listPkg.filter((pkg) => pkg.status === "active" && !["log", "login"].includes(pkg.package_type?.toLowerCase()))
            : listPkg.filter((pkg) => pkg.status === "active" && ["log", "login"].includes(pkg.package_type?.toLowerCase()))
    ), [listPkg, rechargeMethod]);

    const handleBuyNow = () => {
        if (!selectedPkg) {
            toast.warn("Vui long chon goi truoc.");
            return;
        }

        if (rechargeMethod === "uid") {
            if (!uid) return toast.warn("Vui long nhap UID.");
            if (game?.server?.length > 1 && !selectedPkg?.id_server && !server) return toast.warn("Vui long chon may chu.");
            if ((game?.server?.length === 0 || selectedPkg?.id_server) && !idServer) return toast.warn("Vui long nhap server.");
        } else {
            if (!username || !password) return toast.warn("Vui long nhap tai khoan va mat khau.");
            if (!zaloNumber) return toast.warn("Vui long nhap so Zalo.");
            if (game?.server?.length > 1 && !selectedPkg?.id_server && !server) return toast.warn("Vui long chon may chu.");
            if ((game?.server?.length === 0 || selectedPkg?.id_server) && !idServer) return toast.warn("Vui long nhap server.");
        }

        setConfirmForm(true);
    };

    const canCheckout = Boolean(selectedPkg);

    return (
        <div className="relative min-h-screen bg-[#06101f] text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-10rem] top-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[#2dd4bf]/12 blur-[120px]" />
                <div className="absolute right-[-8rem] top-[10rem] h-[18rem] w-[18rem] rounded-full bg-[#60a5fa]/12 blur-[110px]" />
                <div className="absolute bottom-[-10rem] left-[15%] h-[20rem] w-[20rem] rounded-full bg-[#fb7185]/10 blur-[120px]" />
            </div>

            <main className="relative z-10 mx-auto max-w-[1280px] px-4 pb-24 pt-3 sm:px-6 lg:pb-28 lg:pt-5">
                <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142d]">
                    <div className="relative min-h-[300px] overflow-hidden">
                        <img src={posterSrc} alt={game?.name || "Game"} className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,20,0.92)_0%,rgba(3,8,20,0.72)_42%,rgba(3,8,20,0.38)_100%)]" />
                        <div className="relative z-10 flex min-h-[300px] flex-col justify-between p-5 sm:p-7">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ab6df]">
                                <a href="/" className="transition hover:text-white">Trang chủ</a>
                                <span>/</span>
                                <span>Nạp game</span>
                                <span>/</span>
                                <span className="text-[#5eead4]">{game?.name || "Game"}</span>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} className="max-w-2xl">
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                                        <FiZap className="h-3.5 w-3.5" />
                                        Xử lý tự động
                                    </div>
                                    <h1 className="text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">Nạp {game?.name}</h1>
                                </motion.div>

                                {allTopUpGames.length > 0 ? (
                                    <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.12 }} className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowGameDropdown(!showGameDropdown)}
                                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.1] sm:px-4 sm:py-2.5 sm:text-sm"
                                        >
                                            <HiSwitchHorizontal size={14} className="sm:h-4 sm:w-4" />
                                            Đổi game
                                        </button>

                                        {showGameDropdown ? (
                                            <>
                                                <button type="button" className="fixed inset-0 z-30" onClick={() => setShowGameDropdown(false)} />
                                                <div className="surface-card absolute right-0 top-[calc(100%+6px)] z-40 w-[280px] max-w-[90vw] overflow-hidden rounded-[1.4rem] p-1">
                                                    <div className="max-h-[280px] space-y-0.5 overflow-y-auto">
                                                        {allTopUpGames.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (item.gamecode !== game?.gamecode) router.push(`/categories/topup/${item.gamecode}`);
                                                                    setShowGameDropdown(false);
                                                                }}
                                                                className={`flex w-full items-center gap-2 rounded-[1rem] px-2.5 py-2 text-left text-xs transition sm:text-sm ${item.gamecode === game?.gamecode ? "border border-[#5eead4]/40 bg-[#5eead4]/10" : "border border-transparent bg-white/[0.03] hover:bg-white/[0.06]"}`}
                                                            >
                                                                <img src={getImageSrc(item.thumbnail)} alt={item.name} className="h-8 w-8 rounded-md object-cover" />
                                                                <span className="line-clamp-1 font-medium text-white">{item.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        ) : null}
                                    </motion.div>
                                ) : null}
                            </div>

                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }} className="mt-6 flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-sm text-white">
                                    <img src={thumbnailSrc} alt={game?.name || "Game"} className="h-9 w-9 rounded-full object-cover" />
                                    <div className="text-left">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#9ab6df]">Poster đang hiển thị</p>
                                        <p className="font-semibold">{game?.publisher || "Topup24h"}</p>
                                    </div>
                                </div>
                                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9ab6df]">
                                    Nhập thông tin {"->"} Chọn gói {"->"} Thanh toán
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
                    <div className="contents lg:block lg:space-y-4 lg:sticky lg:top-4 lg:self-start">
                        <div className="order-1 w-full lg:order-none">
                            <TopUpForm
                                rechargeMethod={rechargeMethod}
                                setRechargeMethod={setRechargeMethod}
                                uid={uid}
                                setUid={setUid}
                                username={username}
                                setUsername={setUsername}
                                password={password}
                                setPassword={setPassword}
                                server={server}
                                setServer={setServer}
                                idServer={idServer}
                                setIdServer={setIdServer}
                                zaloNumber={zaloNumber}
                                setZaloNumber={setZaloNumber}
                                note={note}
                                setNote={setNote}
                                game={game}
                                selectedPkg={selectedPkg}
                                availableMethods={availableMethods}
                            />
                        </div>

                        <div className="order-3 w-full space-y-4 lg:order-none">
                            <PaymentMethodGrid />
                            <ImportantNotes rechargeMethod={rechargeMethod} />
                        </div>
                    </div>

                    <div className="order-2 w-full lg:order-none">
                        <section className="surface-card rounded-[2rem] p-4 sm:p-5">
                            <div className="mb-4 border-b border-white/10 pb-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5eead4]">Chon goi nap</p>
                            </div>

                            {loading || displayPackages.length > 0 ? (
                                <PackageGrid
                                    loading={loading}
                                    displayPackages={displayPackages}
                                    selectedPkg={selectedPkg}
                                    setSelectedPkg={setSelectedPkg}
                                    userLevel={userLevel}
                                />
                            ) : (
                                <div className="rounded-[1.6rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#5eead4]">
                                        <FiZap size={20} />
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-white">Chua co goi kha dung</p>
                                    <p className="mt-1 text-xs text-[#9fb8db]">Thu doi kieu nap hoac quay lai sau.</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>

            <StickyBottomBar
                selectedPkg={selectedPkg}
                selectedPaymentMethod={selectedPaymentMethod}
                handleBuyNow={handleBuyNow}
                game={game}
                canCheckout={canCheckout}
            />

            {confirmForm ? (
                <ConfirmForm
                    data={{
                        package: selectedPkg,
                        paymentMethod: selectedPaymentMethod,
                        server: server || idServer,
                        uid,
                        username,
                        password,
                        idServer: idServer || "",
                        zaloNumber: zaloNumber || "N/A",
                        note: note || "",
                    }}
                    onClick={() => setConfirmForm(false)}
                />
            ) : null}
        </div>
    );
}
