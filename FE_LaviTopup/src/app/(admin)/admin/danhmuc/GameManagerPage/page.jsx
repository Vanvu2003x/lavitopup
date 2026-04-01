"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiRefreshCw, FiSave, FiSearch, FiTrash2, FiX, FiZap } from "react-icons/fi";
import { toast } from "react-toastify";
import Pagination from "@/components/common/Pagination";
import {
    createGame,
    deleteGame,
    getGameSyncConfig,
    getGames,
    runGameSyncNow,
    updateGame,
    updateGameSyncConfig,
} from "@/services/games.service";

const PAGE_SIZE = 8;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const EMPTY_FORM = { custom_name: "", gamecode: "", publisher: "", origin_markup_percent: 0, is_hot: false, server_text: "" };

const clampInterval = (value) => Math.min(59, Math.max(1, Number(value) || 30));
const imgSrc = (path) => (!path ? null : String(path).startsWith("http") ? path : `${process.env.NEXT_PUBLIC_API_URL}${path}`);

export default function GameManagerPage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncLoading, setSyncLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [syncInterval, setSyncInterval] = useState(30);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGame, setCurrentGame] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [posterFile, setPosterFile] = useState(null);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const data = await getGames();
            setGames(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error("Không tải được danh sách game.");
        } finally {
            setLoading(false);
        }
    };

    const fetchSyncConfig = async () => {
        try {
            const cfg = await getGameSyncConfig();
            setSyncInterval(clampInterval(cfg?.intervalMinutes || 30));
        } catch (error) {
            console.error(error);
            toast.error("Không tải được cấu hình đồng bộ.");
        }
    };

    useEffect(() => {
        fetchGames();
        fetchSyncConfig();
    }, []);

    useEffect(() => setCurrentPage(1), [searchTerm]);

    const filteredGames = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return games;
        return games.filter((game) =>
            [game.name, game.custom_name, game.api_name, game.gamecode, game.publisher]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [games, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
    const pagedGames = filteredGames.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const resetForm = () => {
        setCurrentGame(null);
        setFormData(EMPTY_FORM);
        setThumbnailFile(null);
        setPosterFile(null);
    };

    const openAdd = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEdit = (game) => {
        setCurrentGame(game);
        setFormData({
            custom_name: game.custom_name || game.name || "",
            gamecode: game.gamecode || "",
            publisher: game.publisher || "",
            origin_markup_percent: game.origin_markup_percent || 0,
            is_hot: Boolean(game.is_hot),
            server_text: Array.isArray(game.server) ? game.server.join(", ") : "",
        });
        setThumbnailFile(null);
        setPosterFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const pickFile = (event, type) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!IMAGE_TYPES.includes(file.type)) return toast.error("Chỉ nhận JPG, PNG, GIF hoặc WebP.");
        if (file.size > 5 * 1024 * 1024) return toast.error("Dung lượng tối đa là 5MB.");
        if (type === "thumbnail") setThumbnailFile(file);
        if (type === "poster") setPosterFile(file);
    };

    const saveSyncConfig = async () => {
        try {
            setConfigLoading(true);
            const value = clampInterval(syncInterval);
            const res = await updateGameSyncConfig(value);
            setSyncInterval(clampInterval(res?.intervalMinutes || value));
            toast.success("Đã cập nhật lịch đồng bộ.");
        } catch (error) {
            console.error(error);
            toast.error("Không lưu được lịch đồng bộ.");
        } finally {
            setConfigLoading(false);
        }
    };

    const syncNow = async () => {
        try {
            setSyncLoading(true);
            await runGameSyncNow();
            toast.success("Đã chạy đồng bộ ngay.");
            await fetchGames();
        } catch (error) {
            console.error(error);
            toast.error("Không thể đồng bộ ngay lúc này.");
        } finally {
            setSyncLoading(false);
        }
    };

    const submitGame = async (event) => {
        event.preventDefault();
        if (!formData.custom_name.trim() || !formData.gamecode.trim()) return toast.warning("Cần tên hiển thị và mã game.");
        if (!currentGame && !thumbnailFile) return toast.warning("Game mới cần có thumbnail.");

        try {
            setSubmitLoading(true);
            const payload = new FormData();
            payload.append(
                "info",
                JSON.stringify({
                    name: formData.custom_name.trim(),
                    custom_name: formData.custom_name.trim(),
                    gamecode: formData.gamecode.trim(),
                    publisher: formData.publisher.trim(),
                    server: formData.server_text
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean),
                    origin_markup_percent: Number(String(formData.origin_markup_percent).replace(",", ".")) || 0,
                    is_hot: formData.is_hot,
                })
            );
            if (thumbnailFile) payload.append("thumbnail", thumbnailFile);
            if (posterFile) payload.append("poster", posterFile);

            if (currentGame) {
                await updateGame(currentGame.id, payload);
                toast.success("Đã cập nhật game.");
            } else {
                await createGame(payload);
                toast.success("Đã tạo game.");
            }

            closeModal();
            await fetchGames();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Không lưu được game.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const removeGame = async (id) => {
        if (!confirm("Xóa game này?")) return;
        try {
            setDeleteLoading(id);
            await deleteGame(id);
            toast.success("Đã xóa game.");
            await fetchGames();
        } catch (error) {
            console.error(error);
            toast.error("Xóa game thất bại.");
        } finally {
            setDeleteLoading(null);
        }
    };

    return (
        <div className="space-y-4 pb-8">
            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Quản lý game</h1>
                        <p className="mt-1 text-sm text-slate-400">Đủ chức năng: đồng bộ, tìm kiếm, thêm/sửa/xóa game.</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                        <div>
                            <p className="text-xs text-slate-500">Chu kỳ đồng bộ (phút)</p>
                            <input
                                type="number"
                                min="1"
                                max="59"
                                value={syncInterval}
                                onChange={(e) => setSyncInterval(e.target.value)}
                                className="mt-1 h-10 w-24 rounded-lg border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none"
                            />
                        </div>
                        <button type="button" onClick={saveSyncConfig} disabled={configLoading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white">
                            {configLoading ? <FiRefreshCw className="animate-spin" /> : <FiSave />} Lưu lịch
                        </button>
                        <button type="button" onClick={syncNow} disabled={syncLoading} className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-300 px-3 text-xs font-semibold text-slate-950">
                            {syncLoading ? <FiRefreshCw className="animate-spin" /> : <FiZap />} Chạy ngay
                        </button>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-md">
                        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm theo tên, mã game..." className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/45 pl-10 pr-3 text-sm text-white outline-none" />
                    </div>
                    <button type="button" onClick={openAdd} className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-300 px-3 text-sm font-semibold text-slate-950">
                        <FiPlus /> Thêm game
                    </button>
                </div>
            </section>

            {loading ? (
                <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-300/20 border-t-cyan-300" /></div>
            ) : filteredGames.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-14 text-center text-slate-300">Không có game phù hợp.</div>
            ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                    {pagedGames.map((game) => (
                        <article key={game.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-20 w-20 overflow-hidden rounded-lg border border-white/10 bg-slate-900">
                                    {imgSrc(game.thumbnail) ? <img src={imgSrc(game.thumbnail)} alt={game.name} className="h-full w-full object-cover" /> : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-semibold text-white">{game.custom_name || game.name}</h2>
                                        {game.is_hot ? <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-100">Hot</span> : null}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-400">{game.gamecode}</p>
                                    <p className="mt-1 text-sm text-slate-300">{game.publisher || "Chưa cập nhật"}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button type="button" onClick={() => openEdit(game)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"><FiEdit2 size={12} />Sửa</button>
                                <button type="button" onClick={() => removeGame(game.id)} disabled={deleteLoading === game.id} className="inline-flex items-center gap-1 rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100"><FiTrash2 size={12} />{deleteLoading === game.id ? "Đang xóa..." : "Xóa"}</button>
                                <a href={`/categories/topup/${game.gamecode}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100"><FiEye size={12} />Xem trang</a>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {!loading && filteredGames.length > 0 && totalPages > 1 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <Pagination currentPage={currentPage} totalPage={totalPages} totalItems={filteredGames.length} pageSize={PAGE_SIZE} tone="dark" onPageChange={setCurrentPage} />
                </div>
            ) : null}

            {isModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70" onClick={closeModal} />
                    <div className="relative w-full max-w-3xl rounded-xl border border-white/10 bg-slate-950 p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">{currentGame ? "Cập nhật game" : "Thêm game mới"}</h2>
                            <button type="button" onClick={closeModal} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300"><FiX /></button>
                        </div>
                        <form onSubmit={submitGame} className="space-y-3">
                            <div className="grid gap-3 md:grid-cols-2">
                                <InputField label="Tên hiển thị" value={formData.custom_name} onChange={(v) => setFormData((p) => ({ ...p, custom_name: v }))} placeholder="Liên Quân Mobile" />
                                <InputField label="Mã game" value={formData.gamecode} onChange={(v) => setFormData((p) => ({ ...p, gamecode: v }))} placeholder="lienquan" />
                                <InputField label="Publisher" value={formData.publisher} onChange={(v) => setFormData((p) => ({ ...p, publisher: v }))} placeholder="Garena" />
                                <InputField label="Markup (%)" value={formData.origin_markup_percent} onChange={(v) => setFormData((p) => ({ ...p, origin_markup_percent: v }))} placeholder="1" />
                            </div>
                            <InputField label="Server (cách nhau bằng dấu phẩy)" value={formData.server_text} onChange={(v) => setFormData((p) => ({ ...p, server_text: v }))} placeholder="Asia, Europe, America" />
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                                <p className="text-sm text-slate-300">Đánh dấu hot</p>
                                <button type="button" onClick={() => setFormData((p) => ({ ...p, is_hot: !p.is_hot }))} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${formData.is_hot ? "bg-amber-300 text-slate-950" : "border border-white/10 bg-white/5 text-slate-300"}`}>{formData.is_hot ? "Đang hot" : "Không hot"}</button>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="space-y-1"><span className="text-xs text-slate-400">Thumbnail</span><input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={(e) => pickFile(e, "thumbnail")} className="block w-full text-xs text-slate-300" /></label>
                                <label className="space-y-1"><span className="text-xs text-slate-400">Poster ngang</span><input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={(e) => pickFile(e, "poster")} className="block w-full text-xs text-slate-300" /></label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={closeModal} disabled={submitLoading} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">Hủy</button>
                                <button type="submit" disabled={submitLoading} className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950">{submitLoading ? <FiRefreshCw className="animate-spin" /> : null}{submitLoading ? "Đang lưu..." : currentGame ? "Lưu thay đổi" : "Tạo game"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function InputField({ label, value, onChange, placeholder }) {
    return (
        <label className="space-y-1">
            <span className="text-xs text-slate-400">{label}</span>
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none" />
        </label>
    );
}
