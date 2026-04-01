"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";
import {
    addPkg,
    changeStatus,
    delPkg,
    getAllPackageByGameCode,
    updatePkg,
} from "@/services/toup_package.service";
import { getGames } from "@/services/games.service";
import {
    FiCheck,
    FiEdit2,
    FiImage,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiTrash2,
    FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_BANNER = "/banner/logo.png";
const PAGE_SIZE = 8;
const FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const emptyForm = {
    package_name: "",
    origin_price: "",
    profit_percent_basic: "",
    profit_percent_pro: "",
    profit_percent_plus: "",
    package_type: "default",
    status: "active",
    id_server: false,
    sale: false,
    fileAPI: "",
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const imgSrc = (path) => {
    if (!path) return null;
    return String(path).startsWith("http") ? path : `${API_URL}${path}`;
};

export default function ToUpPackageManagerPage() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [statusLoadingId, setStatusLoadingId] = useState(null);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);

    const fetchGames = async () => {
        try {
            const data = await getGames();
            const rows = Array.isArray(data) ? data : [];
            setGames(rows);
            if (!selectedGame && rows.length > 0) {
                setSelectedGame(rows[0]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không tải được danh sách game.");
        }
    };

    const fetchPackages = async (game) => {
        if (!game?.gamecode) return;
        try {
            setLoading(true);
            const data = await getAllPackageByGameCode(game.gamecode);
            setPackages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error("Không tải được danh sách gói nạp.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    useEffect(() => {
        if (selectedGame) fetchPackages(selectedGame);
    }, [selectedGame]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedGame]);

    const filteredPackages = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return packages;
        return packages.filter((pkg) =>
            [pkg.package_name, pkg.api_package_name, pkg.custom_package_name]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [packages, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredPackages.length / PAGE_SIZE));
    const pagedPackages = filteredPackages.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const resetForm = () => {
        setCurrentPackage(null);
        setFormData(emptyForm);
        setThumbnailFile(null);
        setPreviewImg(null);
    };

    const openAdd = () => {
        resetForm();
        if (selectedGame) {
            setFormData((prev) => ({
                ...prev,
                profit_percent_basic: selectedGame.profit_percent_basic || 0,
                profit_percent_pro: selectedGame.profit_percent_pro || 0,
                profit_percent_plus: selectedGame.profit_percent_plus || 0,
            }));
        }
        setIsModalOpen(true);
    };

    const openEdit = (pkg) => {
        setCurrentPackage(pkg);
        setFormData({
            package_name: pkg.package_name || "",
            origin_price: pkg.origin_price || "",
            profit_percent_basic: pkg.profit_percent_basic || 0,
            profit_percent_pro: pkg.profit_percent_pro || 0,
            profit_percent_plus: pkg.profit_percent_plus || 0,
            package_type: pkg.package_type || "default",
            status: pkg.status || "active",
            id_server: Boolean(pkg.id_server),
            sale: Boolean(pkg.sale),
            fileAPI: pkg.fileAPI ? JSON.stringify(pkg.fileAPI, null, 2) : "",
        });
        setThumbnailFile(null);
        setPreviewImg(imgSrc(pkg.thumbnail));
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!FILE_TYPES.includes(file.type)) {
            toast.error("Chỉ chấp nhận file JPG, PNG, GIF hoặc WebP.");
            event.target.value = "";
            return;
        }
        if (file.size > 30 * 1024 * 1024) {
            toast.error("Dung lượng tối đa là 30MB.");
            event.target.value = "";
            return;
        }
        setThumbnailFile(file);
        setPreviewImg(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedGame) {
            toast.error("Vui lòng chọn game trước.");
            return;
        }
        if (!formData.package_name.trim()) {
            toast.warning("Vui lòng nhập tên gói.");
            return;
        }
        if (!currentPackage && !thumbnailFile) {
            toast.warning("Vui lòng chọn ảnh minh họa.");
            return;
        }

        try {
            setSubmitting(true);
            const data = new FormData();

            data.append("package_name", formData.package_name.trim());
            data.append("game_id", selectedGame.id);
            data.append("origin_price", formData.origin_price || 0);
            data.append("profit_percent_basic", formData.profit_percent_basic || 0);
            data.append("profit_percent_pro", formData.profit_percent_pro || 0);
            data.append("profit_percent_plus", formData.profit_percent_plus || 0);
            data.append("package_type", formData.package_type || "default");
            data.append("status", formData.status || "active");
            data.append("id_server", formData.id_server ? 1 : 0);
            data.append("sale", formData.sale ? 1 : 0);

            if (formData.fileAPI?.trim()) {
                data.append("fileAPI", formData.fileAPI.trim());
            }
            if (thumbnailFile) {
                data.append("thumbnail", thumbnailFile);
            }

            if (currentPackage) {
                await updatePkg(currentPackage.id, data);
                toast.success("Đã cập nhật gói nạp.");
            } else {
                await addPkg(data);
                toast.success("Đã thêm gói nạp.");
            }

            closeModal();
            await fetchPackages(selectedGame);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Không thể lưu gói nạp.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc muốn xóa gói nạp này?")) return;
        try {
            setDeleteLoadingId(id);
            await delPkg(id);
            toast.success("Đã xóa gói nạp.");
            await fetchPackages(selectedGame);
        } catch (error) {
            console.error(error);
            toast.error("Xóa gói nạp thất bại.");
        } finally {
            setDeleteLoadingId(null);
        }
    };

    const handleStatusChange = async (pkgId, newStatus) => {
        try {
            setStatusLoadingId(pkgId);
            await changeStatus(pkgId, newStatus);
            setPackages((prev) =>
                prev.map((pkg) => (pkg.id === pkgId ? { ...pkg, status: newStatus } : pkg))
            );
            toast.success("Đã cập nhật trạng thái.");
        } catch (error) {
            console.error(error);
            toast.error("Không thể cập nhật trạng thái.");
        } finally {
            setStatusLoadingId(null);
        }
    };

    const activePackages = filteredPackages.filter((pkg) => pkg.status === "active").length;
    const salePackages = filteredPackages.filter((pkg) => pkg.sale).length;

    return (
        <div className="space-y-4 pb-8">
            <section className="relative overflow-hidden rounded-xl border border-white/10">
                <img src={ADMIN_BANNER} alt="Banner quản lý gói nạp" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/75" />
                <div className="relative p-4">
                    <h1 className="text-2xl font-semibold text-white">Quản lý gói nạp</h1>
                    <p className="mt-1 text-sm text-slate-300">Bản tối giản: chỉ giữ chức năng cốt lõi và thao tác nhanh.</p>
                </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2">
                            <p className="text-xs text-slate-500">Tổng gói</p>
                            <p className="text-lg font-semibold text-white">{filteredPackages.length}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2">
                            <p className="text-xs text-slate-500">Đang hoạt động</p>
                            <p className="text-lg font-semibold text-emerald-200">{activePackages}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2">
                            <p className="text-xs text-slate-500">Đang sale</p>
                            <p className="text-lg font-semibold text-amber-200">{salePackages}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                            value={selectedGame?.id || ""}
                            onChange={(event) => {
                                const game = games.find((item) => String(item.id) === String(event.target.value));
                                setSelectedGame(game || null);
                            }}
                            className="h-10 min-w-[220px] rounded-lg border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none"
                        >
                            {games.map((game) => (
                                <option key={game.id} value={game.id}>
                                    {game.name}
                                </option>
                            ))}
                        </select>

                        <div className="relative">
                            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Tìm gói..."
                                className="h-10 rounded-lg border border-white/10 bg-slate-950/45 pl-10 pr-3 text-sm text-white outline-none"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={openAdd}
                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-300 px-3 text-sm font-semibold text-slate-950"
                        >
                            <FiPlus />
                            Thêm gói
                        </button>

                        <button
                            type="button"
                            onClick={() => fetchPackages(selectedGame)}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white"
                        >
                            <FiRefreshCw />
                            Tải lại
                        </button>
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-300/20 border-t-cyan-300" />
                </div>
            ) : pagedPackages.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-14 text-center text-slate-300">
                    Không có gói nạp phù hợp.
                </div>
            ) : (
                <section className="grid gap-3 lg:grid-cols-2">
                    {pagedPackages.map((pkg) => (
                        <article key={pkg.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-20 w-20 overflow-hidden rounded-lg border border-white/10 bg-slate-900">
                                    {imgSrc(pkg.thumbnail) ? (
                                        <img src={imgSrc(pkg.thumbnail)} alt={pkg.package_name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-slate-500">
                                            <FiImage />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-semibold text-white">{pkg.package_name}</h2>
                                        {pkg.sale ? (
                                            <span className="rounded-full border border-rose-300/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-100">
                                                Sale
                                            </span>
                                        ) : null}
                                        {pkg.id_server ? (
                                            <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-100">
                                                Cần server
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="mt-1 text-sm text-cyan-200">Giá: {formatCurrency(pkg.price || 0)}</p>
                                    <p className="mt-1 text-xs text-slate-400">Giá gốc: {formatCurrency(pkg.origin_price || 0)}</p>
                                    <p className="mt-1 text-xs text-slate-500">Kiểu nạp: {pkg.package_type || "default"}</p>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <select
                                    value={pkg.status}
                                    disabled={statusLoadingId === pkg.id}
                                    onChange={(event) => handleStatusChange(pkg.id, event.target.value)}
                                    className="h-9 rounded-lg border border-white/10 bg-slate-950/45 px-2.5 text-xs text-white outline-none"
                                >
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Không hoạt động</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={() => openEdit(pkg)}
                                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white"
                                >
                                    <FiEdit2 size={12} />
                                    Sửa
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(pkg.id)}
                                    disabled={deleteLoadingId === pkg.id}
                                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 text-xs font-semibold text-rose-100"
                                >
                                    <FiTrash2 size={12} />
                                    {deleteLoadingId === pkg.id ? "Đang xóa..." : "Xóa"}
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            )}

            {!loading && filteredPackages.length > 0 && totalPages > 1 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPage={totalPages}
                        totalItems={filteredPackages.length}
                        pageSize={PAGE_SIZE}
                        tone="dark"
                        onPageChange={setCurrentPage}
                    />
                </div>
            ) : null}

            {isModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70" onClick={closeModal} />
                    <div className="relative w-full max-w-2xl rounded-xl border border-white/10 bg-slate-950 p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white">{currentPackage ? "Cập nhật gói nạp" : "Thêm gói nạp"}</h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300"
                            >
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid gap-3 md:grid-cols-2">
                                <FormField
                                    label="Tên gói"
                                    value={formData.package_name}
                                    onChange={(v) => setFormData((prev) => ({ ...prev, package_name: v }))}
                                    placeholder="Gói 1000 Kim Cương"
                                />
                                <FormField
                                    label="Giá gốc"
                                    value={formData.origin_price}
                                    onChange={(v) => setFormData((prev) => ({ ...prev, origin_price: v }))}
                                    placeholder="100000"
                                />
                                <FormField
                                    label="Lợi nhuận cơ bản (%)"
                                    value={formData.profit_percent_basic}
                                    onChange={(v) => setFormData((prev) => ({ ...prev, profit_percent_basic: v }))}
                                    placeholder="0"
                                />
                                <FormField
                                    label="Lợi nhuận nâng cao (%)"
                                    value={formData.profit_percent_pro}
                                    onChange={(v) => setFormData((prev) => ({ ...prev, profit_percent_pro: v }))}
                                    placeholder="0"
                                />
                                <FormField
                                    label="Lợi nhuận VIP (%)"
                                    value={formData.profit_percent_plus}
                                    onChange={(v) => setFormData((prev) => ({ ...prev, profit_percent_plus: v }))}
                                    placeholder="0"
                                />
                                <label className="space-y-1">
                                    <span className="text-xs text-slate-400">Kiểu nạp</span>
                                    <select
                                        value={formData.package_type}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, package_type: event.target.value }))
                                        }
                                        className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none"
                                    >
                                        <option value="default">Mặc định</option>
                                        <option value="uid">UID</option>
                                        <option value="log">LOG</option>
                                    </select>
                                </label>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="space-y-1">
                                    <span className="text-xs text-slate-400">Trạng thái</span>
                                    <select
                                        value={formData.status}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, status: event.target.value }))
                                        }
                                        className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none"
                                    >
                                        <option value="active">Đang hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </label>
                                <label className="space-y-1">
                                    <span className="text-xs text-slate-400">Thumbnail</span>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.gif,.webp"
                                        onChange={handleFileChange}
                                        className="block w-full text-xs text-slate-300"
                                    />
                                </label>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.id_server}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, id_server: event.target.checked }))
                                        }
                                    />
                                    Yêu cầu ID server
                                </label>
                                <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.sale}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, sale: event.target.checked }))
                                        }
                                    />
                                    Đánh dấu sale
                                </label>
                            </div>

                            <label className="space-y-1">
                                <span className="text-xs text-slate-400">fileAPI (JSON)</span>
                                <textarea
                                    rows={4}
                                    value={formData.fileAPI}
                                    onChange={(event) =>
                                        setFormData((prev) => ({ ...prev, fileAPI: event.target.value }))
                                    }
                                    className="w-full rounded-lg border border-white/10 bg-slate-950/45 px-3 py-2 text-xs text-white outline-none"
                                    placeholder='{"key":"value"}'
                                />
                            </label>

                            {previewImg ? (
                                <div className="h-28 w-40 overflow-hidden rounded-lg border border-white/10">
                                    <img src={previewImg} alt="Preview thumbnail" className="h-full w-full object-cover" />
                                </div>
                            ) : null}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={submitting}
                                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950"
                                >
                                    {submitting ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                                    {submitting ? "Đang lưu..." : currentPackage ? "Lưu thay đổi" : "Thêm gói"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function FormField({ label, value, onChange, placeholder }) {
    return (
        <label className="space-y-1">
            <span className="text-xs text-slate-400">{label}</span>
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none"
            />
        </label>
    );
}
