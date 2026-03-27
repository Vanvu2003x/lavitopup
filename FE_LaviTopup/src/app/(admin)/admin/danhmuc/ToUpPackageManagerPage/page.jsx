"use client";

import React, { useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import Pagination from "@/components/common/Pagination";
import {
    getAllPackageByGameCode,
    searchPkg,
    addPkg,
    updatePkg,
    delPkg,
    changeStatus
} from "@/services/toup_package.service";
import { getGames } from "@/services/games.service";
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
    FiImage,
    FiSave,
    FiCheck,
    FiChevronDown,
    FiFilter,
    FiDollarSign,
    FiLayers,
    FiActivity
} from "react-icons/fi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TopUpPackageManagerPage() {
    // --- State Management ---
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState(null); // null for add, object for edit

    // Form State
    const [formData, setFormData] = useState({
        package_name: "",
        origin_price: "",
        profit_percent_basic: "",
        profit_percent_pro: "",
        profit_percent_plus: "",
        profit_percent_user: "", // Added
        package_type: "default",
        status: "active",
        id_server: false,
        sale: false,
        fileAPI: "",
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);
    const pageSize = 8;

    // --- Data Fetching ---

    // 1. Fetch Games first
    useEffect(() => {
        const fetchGamesData = async () => {
            try {
                const data = await getGames();
                setGames(data || []);
                if (data && data.length > 0) {
                    setSelectedGame(data[0]);
                }
            } catch (error) {
                console.error("Error fetching games:", error);
                toast.error("Không thể tải danh sách game");
            }
        };
        fetchGamesData();
    }, []);

    // 2. Fetch Packages when selectedGame changes
    useEffect(() => {
        if (!selectedGame) return;
        fetchPackages();
    }, [selectedGame]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedGame, searchTerm]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(packages.length / pageSize));
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, packages.length, pageSize]);

    const fetchPackages = async () => {
        if (!selectedGame) return;
        try {
            setLoading(true);
            const data = await getAllPackageByGameCode(selectedGame.gamecode);
            setPackages(data || []);
        } catch (error) {
            console.error("Error fetching packages:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---

    const handleSearch = async (e) => {
        const val = e.target.value;
        setSearchTerm(val);

        if (!selectedGame) return;

        if (!val.trim()) {
            fetchPackages();
            return;
        }

        try {
            const data = await searchPkg(selectedGame.id, val);
            setPackages(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: "Gói nạp này sẽ bị xóa vĩnh viễn!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy',
            background: '#ffffff',
            color: '#1f2937'
        });

        if (result.isConfirmed) {
            try {
                await delPkg(id);
                toast.success("Đã xóa gói nạp");
                fetchPackages();
            } catch (error) {
                toast.error("Lỗi khi xóa gói nạp");
                console.error(error);
            }
        }
    };

    const handleDetail = (pkg) => {
        const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

        Swal.fire({
            title: `Chi tiết: ${pkg.package_name}`,
            html: `
                <div class="text-left space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700">
                    <div class="flex justify-between border-b border-gray-200 pb-2">
                        <span class="text-gray-500">Giá nhập (gốc):</span>
                        <span class="font-bold text-gray-900">${formatMoney(pkg.origin_price || 0)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-blue-600">Giá cơ bản:</span>
                        <span class="font-bold text-blue-600">${formatMoney(pkg.price_basic || 0)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-purple-600">Giá nâng cao:</span>
                        <span class="font-bold text-purple-600">${formatMoney(pkg.price_pro || 0)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-amber-600">Giá VIP:</span>
                        <span class="font-bold text-amber-600">${formatMoney(pkg.price_plus || 0)}</span>
                    </div>
                    <div class="pt-2 border-t border-gray-200 text-xs text-center italic text-gray-500">
                        *Giá được tính tự động theo cấu hình game
                    </div>
                </div>
            `,
            background: '#ffffff',
            color: '#1f2937',
            showConfirmButton: false,
            showCloseButton: true,
        });
    };

    // --- Modal & Form Handlers ---

    const resetForm = () => {
        setFormData({
            package_name: "",
            origin_price: "",
            package_type: "default",
            status: "active",
            id_server: false,
            sale: false,
            fileAPI: "",
        });
        setThumbnailFile(null);
        setPreviewImg(null);
        setCurrentPackage(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        if (selectedGame) {
            setFormData(prev => ({
                ...prev,
                profit_percent_basic: selectedGame.profit_percent_basic || 0,
                profit_percent_pro: selectedGame.profit_percent_pro || 0,
                profit_percent_plus: selectedGame.profit_percent_plus || 0,
                profit_percent_user: 0,
            }));
        }
        setIsModalOpen(true);
    };

    const handleOpenEdit = (pkg) => {
        setCurrentPackage(pkg);

        // Fallback to game config if package profit percentages are 0/null/undefined
        const getPercentValue = (pkgValue, gameValue) => {
            // If package has a non-zero value, use it; otherwise use game config
            return (pkgValue !== null && pkgValue !== undefined && pkgValue !== 0)
                ? pkgValue
                : (gameValue || 0);
        };

        setFormData({
            package_name: pkg.package_name,
            origin_price: pkg.origin_price || "",
            // Fallback to game config if package values are 0/null
            profit_percent_basic: getPercentValue(pkg.profit_percent_basic, selectedGame?.profit_percent_basic),
            profit_percent_pro: getPercentValue(pkg.profit_percent_pro, selectedGame?.profit_percent_pro),
            profit_percent_plus: getPercentValue(pkg.profit_percent_plus, selectedGame?.profit_percent_plus),
            profit_percent_user: pkg.profit_percent_user || 0,
            package_type: pkg.package_type || "default",
            status: pkg.status || "active",
            id_server: pkg.id_server ? true : false,
            sale: pkg.sale ? true : false,
            fileAPI: pkg.fileAPI ? JSON.stringify(pkg.fileAPI, null, 2) : "",
        });
        // Assuming 'thumbnail' field is a path string
        setPreviewImg(pkg.thumbnail ? (pkg.thumbnail.startsWith('http') ? pkg.thumbnail : `${API_URL}${pkg.thumbnail}`) : null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // SECURITY: Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Chỉ chấp nhận file ảnh JPG, PNG, GIF hoặc WebP');
                e.target.value = '';
                return;
            }

            // SECURITY: Validate file size (30MB)
            if (file.size > 30 * 1024 * 1024) {
                toast.error('Dung lượng file tối đa là 30MB');
                e.target.value = '';
                return;
            }

            setThumbnailFile(file);
            setPreviewImg(URL.createObjectURL(file));
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedGame) {
            toast.error("Vui lòng chọn game trước");
            return;
        }
        if (!formData.package_name) {
            toast.warning("Vui lòng nhập tên gói");
            return;
        }

        try {
            setIsSubmitting(true);
            const data = new FormData();

            data.append("package_name", formData.package_name);
            data.append("game_id", selectedGame.id);
            data.append("origin_price", formData.origin_price || 0);
            data.append("profit_percent_basic", formData.profit_percent_basic || 0);
            data.append("profit_percent_pro", formData.profit_percent_pro || 0);
            data.append("profit_percent_plus", formData.profit_percent_plus || 0);
            data.append("profit_percent_user", formData.profit_percent_user || 0);
            data.append("package_type", formData.package_type);
            data.append("status", formData.status);
            data.append("id_server", formData.id_server ? 1 : 0);
            data.append("sale", formData.sale ? 1 : 0);
            if (formData.fileAPI) {
                data.append("fileAPI", formData.fileAPI);
            }

            if (thumbnailFile) {
                data.append("thumbnail", thumbnailFile);
            }

            if (currentPackage) {
                await updatePkg(currentPackage.id, data);
                toast.success("Cập nhật thành công");
            } else {
                if (!thumbnailFile) {
                    toast.warning("Vui lòng chọn ảnh minh họa");
                    setIsSubmitting(false);
                    return;
                }
                await addPkg(data);
                toast.success("Thêm gói mới thành công");
            }

            handleCloseModal();
            fetchPackages();

        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render ---
    const totalPages = Math.max(1, Math.ceil(packages.length / pageSize));
    const pagedPackages = packages.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const activePackages = packages.filter((pkg) => pkg.status === "active").length;
    const salePackages = packages.filter((pkg) => pkg.sale).length;
    const serverRequiredPackages = packages.filter((pkg) => pkg.id_server).length;

    return (
        <div className="space-y-5 animate-[fadeIn_0.5s_ease-out]">
            <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/30 backdrop-blur-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                            <FiLayers />
                            Quản lý gói nạp
                        </div>
                        <h2 className="mt-3 font-display text-2xl font-semibold text-white">Quản trị gói nạp</h2>
                        <p className="mt-2 max-w-2xl text-[13px] leading-5 text-slate-400">
                            Theo dõi giá, khuyến mãi và điều kiện ID máy chủ theo từng game với phân trang thống nhất.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tổng gói</p>
                            <p className="mt-3 font-display text-2xl font-semibold text-cyan-200">{packages.length}</p>
                        </div>
                        <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Đang hoạt động</p>
                            <p className="mt-3 font-display text-2xl font-semibold text-emerald-200">{activePackages}</p>
                        </div>
                        <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Đang khuyến mãi</p>
                            <p className="mt-3 font-display text-2xl font-semibold text-amber-200">{salePackages}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.05rem] border border-white/10 bg-white/5 px-3.5 py-3 text-slate-100 shadow-lg shadow-slate-950/20">
                    <p className="text-[13px] text-slate-400">Game đang chọn</p>
                    <p className="mt-3 font-display text-3xl font-semibold text-white">{selectedGame ? selectedGame.name : "--"}</p>
                    <p className="mt-2 text-[13px] text-slate-500">Ngữ cảnh thao tác hiện tại</p>
                </div>
                <div className="rounded-[1.05rem] border border-white/10 bg-white/5 px-3.5 py-3 text-slate-100 shadow-lg shadow-slate-950/20">
                    <p className="text-[13px] text-slate-400">Cần ID máy chủ</p>
                    <p className="mt-3 font-display text-3xl font-semibold text-white">{serverRequiredPackages}</p>
                    <p className="mt-2 text-[13px] text-slate-500">Phục vụ nạp theo server</p>
                </div>
                <div className="rounded-[1.05rem] border border-white/10 bg-white/5 px-3.5 py-3 text-slate-100 shadow-lg shadow-slate-950/20">
                    <p className="text-[13px] text-slate-400">Đang hiển thị</p>
                    <p className="mt-3 font-display text-3xl font-semibold text-white">{pagedPackages.length}</p>
                    <p className="mt-2 text-[13px] text-slate-500">Mỗi trang {pageSize} gói nạp</p>
                </div>
                <div className="rounded-[1.05rem] border border-white/10 bg-white/5 px-3.5 py-3 text-slate-100 shadow-lg shadow-slate-950/20">
                    <p className="text-sm text-slate-400">Trang</p>
                    <p className="mt-3 font-display text-3xl font-semibold text-white">{currentPage}/{totalPages}</p>
                    <p className="mt-2 text-[13px] text-slate-500">Phân trang rõ ràng</p>
                </div>
            </div>

            {/* Header & Controls */}
            <div className="relative z-50 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:flex-col lg:flex-row">
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900">
                        Quản lý gói nạp
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Thiết lập các gói nạp cho từng game
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Game Selector */}
                    <div className="w-full sm:w-64 z-30">
                        <Listbox value={selectedGame} onChange={setSelectedGame}>
                            <div className="relative mt-1">
                                <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-2.5 pl-3 pr-10 text-left border border-gray-200 focus:outline-none focus:border-blue-500 sm:text-sm text-gray-900 shadow-sm transition-colors hover:border-blue-500/50">
                                    {selectedGame ? (
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={selectedGame.thumbnail?.startsWith('http') ? selectedGame.thumbnail : `${API_URL}${selectedGame.thumbnail}`}
                                                alt=""
                                                className="w-5 h-5 rounded object-cover"
                                            />
                                            <span className="block truncate">{selectedGame.name}</span>
                                        </div>
                                    ) : (
                                        <span className="block truncate text-gray-400">Chọn game...</span>
                                    )}
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <FiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Transition
                                    as={React.Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm border border-gray-100 z-[100]">
                                        {games.map((game, gameIdx) => (
                                            <Listbox.Option
                                                key={gameIdx}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                    }`
                                                }
                                                value={game}
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`flex items-center gap-2 truncate ${selected ? 'font-medium text-blue-600' : 'font-normal'}`}>
                                                            <img
                                                                src={game.thumbnail?.startsWith('http') ? game.thumbnail : `${API_URL}${game.thumbnail}`}
                                                                alt=""
                                                                className="w-5 h-5 rounded object-cover"
                                                            />
                                                            {game.name}
                                                        </span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                <FiCheck className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>

                    {/* Search */}
                    <div className="relative group w-full sm:w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm gói nạp..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full bg-white border border-gray-200 text-gray-900 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleOpenAdd}
                        disabled={!selectedGame}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all
                            ${!selectedGame
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                            }
                        `}
                    >
                        <FiPlus size={20} />
                        <span className="whitespace-nowrap">Thêm gói</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : !selectedGame ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center shadow-sm">
                    <FiLayers size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">Vui lòng chọn game để xem danh sách gói nạp</p>
                </div>
            ) : packages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center shadow-sm">
                    <p className="text-gray-500">Chưa có gói nạp nào cho game này.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {pagedPackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-lg"
                        >
                            {/* Tags/Badges */}
                            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                                {pkg.status === 'active' ? (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 backdrop-blur-md">
                                        Đang bán
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200 backdrop-blur-md">
                                        Tạm ẩn
                                    </span>
                                )}
                                {pkg.sale && (
                                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 backdrop-blur-md">
                                        Giảm giá
                                    </span>
                                )}
                            </div>

                            {/* Image Area with Actions */}
                            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                                <img
                                    src={pkg.thumbnail?.startsWith('http') ? pkg.thumbnail : `${API_URL}${pkg.thumbnail}`}
                                    alt={pkg.package_name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => { e.target.src = '/imgs/image.png'; }} // Fallback
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Hover Actions */}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={() => handleDetail(pkg)}
                                        className="p-2 bg-white/90 backdrop-blur-md rounded-lg text-gray-700 hover:bg-emerald-500 hover:text-white transition-colors shadow-sm"
                                        title="Chi tiết giá"
                                    >
                                        <FiLayers size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenEdit(pkg)}
                                        className="p-2 bg-white/90 backdrop-blur-md rounded-lg text-gray-700 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                                        title="Chỉnh sửa"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pkg.id)}
                                        className="p-2 bg-white/90 backdrop-blur-md rounded-lg text-gray-700 hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                                        title="Xóa"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={pkg.package_name}>
                                    {pkg.package_name}
                                </h3>

                                <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Giá gốc</p>
                                        <p className="text-lg font-bold text-emerald-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.origin_price || 0)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {pkg.id_server && (
                                            <div className="flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200" title="Yêu cầu nhập ID máy chủ">
                                                <FiActivity size={10} /> ID máy chủ
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {packages.length > 0 && totalPages > 1 ? (
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
                    <Pagination
                        currentPage={currentPage}
                        totalPage={totalPages}
                        totalItems={packages.length}
                        pageSize={pageSize}
                        tone="dark"
                        onPageChange={setCurrentPage}
                    />
                </div>
            ) : null}

            {/* --- Modals --- */}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                    ></div>
                    <div className="relative bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl animate-[scaleIn_0.2s_ease-out] overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {currentPackage ? <FiEdit2 className="text-blue-600" /> : <FiPlus className="text-blue-600" />}
                                {currentPackage ? "Cập nhật gói nạp" : "Thêm gói nạp mới"}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Warning if no game selected (shouldn't happen due to valid check, but safely) */}
                            {!selectedGame && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                    Lỗi: Chưa chọn game hiện tại. Vui lòng đóng lại và chọn game.
                                </div>
                            )}

                            {/* Name & Price Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên gói</label>
                                    <input
                                        type="text"
                                        value={formData.package_name}
                                        onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                                        placeholder="Ví dụ: Gói 1000 Kim Cương"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại gói</label>
                                    <select
                                        value={formData.package_type}
                                        onChange={(e) => setFormData({ ...formData, package_type: e.target.value })}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    >
                                        <option value="default">Mặc định</option>
                                        <option value="uid">Nạp UID</option>
                                        <option value="log">Nạp Log</option>
                                    </select>
                                </div>
                            </div>

                            {/* Pricing Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá gốc (giá nhập)</label>
                                    <div className="relative">
                                        <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="number"
                                            value={formData.origin_price}
                                            onChange={(e) => setFormData({ ...formData, origin_price: e.target.value })}
                                            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                            placeholder="100000"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="hidden md:block"></div> {/* Spacer */}
                            </div>

                            {/* Auto Pricing Note */}
                            {/* Profit Configuration */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Cấu hình Giá Bán Cuối Cùng</label>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-blue-600 uppercase">Giá bán cơ bản</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.profit_percent_basic}
                                            onChange={(e) => setFormData({ ...formData, profit_percent_basic: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors text-center font-bold"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>

                                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-purple-600 uppercase">Giá bán nâng cao</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.profit_percent_pro}
                                            onChange={(e) => setFormData({ ...formData, profit_percent_pro: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-purple-500 transition-colors text-center font-bold"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>

                                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-amber-600 uppercase">Giá bán VIP</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.profit_percent_plus}
                                            onChange={(e) => setFormData({ ...formData, profit_percent_plus: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 transition-colors text-center font-bold"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 italic">*Nhập trực tiếp Giá Bán Cuối Cùng sẽ hiển thị cho khách hàng.</p>
                            </div>

                            {/* Configuration Toggles */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Cấu hình nâng cao</label>

                                <div className="flex flex-wrap gap-6">
                                    {/* Status */}
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.status === 'active' ? 'bg-blue-600' : 'bg-gray-300'}`}
                                            onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.status === 'active' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Đang hoạt động</span>
                                    </label>

                                    {/* Sale */}
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.sale ? 'bg-rose-600' : 'bg-gray-300'}`}
                                            onClick={() => setFormData({ ...formData, sale: !formData.sale })}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.sale ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Đang giảm giá</span>
                                    </label>

                                    {/* ID Server */}
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.id_server ? 'bg-orange-600' : 'bg-gray-300'}`}
                                            onClick={() => setFormData({ ...formData, id_server: !formData.id_server })}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.id_server ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Yêu cầu ID máy chủ</span>
                                    </label>
                                </div>
                            </div>

                            {/* fileAPI (JSON) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">File API (JSON)</label>
                                <textarea
                                    value={formData.fileAPI}
                                    onChange={(e) => setFormData({ ...formData, fileAPI: e.target.value })}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm h-24"
                                    placeholder='{"key": "value"}'
                                />
                                <p className="text-xs text-gray-500 mt-1">Nhập định dạng JSON hoặc để trống.</p>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh minh họa</label>
                                <div className="flex gap-4 items-start">
                                    <div
                                        className="w-32 h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors"
                                        onClick={() => document.getElementById('pkg-thumbnail-upload').click()}
                                    >
                                        {previewImg ? (
                                            <img src={previewImg} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="text-center p-2">
                                                <FiImage className="mx-auto text-gray-400 mb-1 group-hover:text-blue-500 transition-colors" size={24} />
                                                <span className="text-[10px] text-gray-500">Tải ảnh</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiEdit2 className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            id="pkg-thumbnail-upload"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.gif,.webp"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <div className="text-sm text-gray-500 space-y-2">
                                            <p>· Dung lượng tối đa: 30MB</p>
                                            <p>· Định dạng: JPG, PNG, GIF, WEBP</p>
                                            <p>· Tỉ lệ khuyến nghị: 16:9 hoặc hình vuông</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </form>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-5 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <FiSave />
                                        {currentPackage ? "Lưu thay đổi" : "Thêm gói mới"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
