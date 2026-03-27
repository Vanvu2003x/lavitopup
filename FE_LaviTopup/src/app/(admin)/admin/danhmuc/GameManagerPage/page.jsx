"use client";

import React, { useEffect, useMemo, useState } from "react";

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
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  FiClock,
  FiEdit2,
  FiEye,
  FiFilm,
  FiHash,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiStar,
  FiTrash2,
  FiUploadCloud,
  FiX,
  FiZap,
} from "react-icons/fi";

const pageSize = 8;
const emptyForm = {
  custom_name: "",
  gamecode: "",
  publisher: "",
  server: [],
  origin_markup_percent: 0,
  is_hot: false,
};
const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const imgSrc = (path) => {
  if (!path) return null;
  return String(path).startsWith("http")
    ? path
    : `${process.env.NEXT_PUBLIC_API_URL}${path}`;
};

const clampSyncIntervalValue = (value) =>
  Math.min(59, Math.max(1, Number(value) || 30));

function Picker({ id, label, hint, preview, onChange }) {
  return (
    <label className="block space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      </div>
      <input
        id={id}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        onChange={onChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => document.getElementById(id)?.click()}
        className="group relative block h-40 w-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/60"
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={label}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-semibold text-white">
              Đổi ảnh
            </span>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,#164e63_0%,#020617_70%)] px-6 text-center">
            <FiUploadCloud className="h-6 w-6 text-cyan-200" />
            <div>
              <p className="text-sm font-semibold text-white">Tải ảnh</p>
              <p className="mt-1 text-xs text-slate-400">JPG, PNG, GIF, WebP</p>
            </div>
          </div>
        )}
      </button>
    </label>
  );
}

export default function GameManagerPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [syncInterval, setSyncInterval] = useState(30);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);

  const normalizedSyncInterval = clampSyncIntervalValue(syncInterval);
  const syncCadenceLabel =
    normalizedSyncInterval === 1
      ? "Mỗi phút"
      : `${normalizedSyncInterval} phút / lần`;

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await getGames();
      setGames(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách game");
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncConfig = async () => {
    try {
      const config = await getGameSyncConfig();
      setSyncInterval(clampSyncIntervalValue(config?.intervalMinutes || 30));
    } catch (error) {
      console.error(error);
      toast.error("Không tải được cấu hình đồng bộ");
    }
  };

  useEffect(() => {
    fetchGames();
    fetchSyncConfig();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredGames = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return games;
    return games.filter((game) =>
      [game.name, game.custom_name, game.api_name, game.gamecode, game.publisher]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [games, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / pageSize));
  const pagedGames = filteredGames.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const resetForm = () => {
    setCurrentGame(null);
    setFormData(emptyForm);
    setThumbnailFile(null);
    setPosterFile(null);
    setThumbnailPreview(null);
    setPosterPreview(null);
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
      server: Array.isArray(game.server) ? game.server : [],
      origin_markup_percent: game.origin_markup_percent || 0,
      is_hot: Boolean(game.is_hot),
    });
    setThumbnailPreview(imgSrc(game.custom_thumbnail || game.thumbnail));
    setPosterPreview(imgSrc(game.poster));
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

    if (!imageTypes.includes(file.type)) {
      toast.error("Chỉ nhận JPG, PNG, GIF hoặc WebP");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng tối đa là 5MB");
      event.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);

    if (type === "thumbnail") {
      setThumbnailFile(file);
      setThumbnailPreview(preview);
      return;
    }

    setPosterFile(file);
    setPosterPreview(preview);
  };

  const saveSyncConfig = async () => {
    try {
      setConfigLoading(true);
      const value = clampSyncIntervalValue(syncInterval);
      const res = await updateGameSyncConfig(value);
      setSyncInterval(clampSyncIntervalValue(res?.intervalMinutes || value));
      toast.success("Đã cập nhật lịch cron");
    } catch (error) {
      console.error(error);
      toast.error("Không lưu được lịch cron");
    } finally {
      setConfigLoading(false);
    }
  };

  const syncNow = async () => {
    try {
      setSyncLoading(true);
      await runGameSyncNow();
      toast.success("Đã chạy đồng bộ ngay");
      await fetchGames();
    } catch (error) {
      console.error(error);
      toast.error("Không thể đồng bộ ngay lúc này");
    } finally {
      setSyncLoading(false);
    }
  };

  const submitGame = async (event) => {
    event.preventDefault();

    if (!formData.custom_name.trim() || !formData.gamecode.trim()) {
      toast.warning("Cần tên hiển thị và mã game");
      return;
    }

    if (!currentGame && !thumbnailFile) {
      toast.warning("Game mới cần có thumbnail");
      return;
    }

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
          server: formData.server,
          origin_markup_percent:
            Number(String(formData.origin_markup_percent).replace(",", ".")) || 0,
          is_hot: formData.is_hot,
        })
      );

      if (thumbnailFile) payload.append("thumbnail", thumbnailFile);
      if (posterFile) payload.append("poster", posterFile);

      if (currentGame) {
        await updateGame(currentGame.id, payload);
        toast.success("Đã cập nhật game");
      } else {
        await createGame(payload);
        toast.success("Đã tạo game");
      }

      closeModal();
      await fetchGames();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Không lưu được game");
    } finally {
      setSubmitLoading(false);
    }
  };

  const removeGame = async (id) => {
    const result = await Swal.fire({
      title: "Xóa game này?",
      text: "Thumbnail và poster local sẽ bị xóa cùng lúc.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Xóa game",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    try {
      setDeleteLoading(id);
      await deleteGame(id);
      toast.success("Đã xóa game");
      await fetchGames();
    } catch (error) {
      console.error(error);
      toast.error("Xóa game thất bại");
    } finally {
      setDeleteLoading(null);
    }
  };

  const hotGames = games.filter((game) => game.is_hot).length;
  const renamedGames = games.filter((game) => game.custom_name).length;

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#020617_0%,#0f172a_42%,#083344_100%)] shadow-[0_30px_90px_rgba(2,6,23,0.45)]">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)] lg:px-7">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <FiFilm className="h-4 w-4" />
              Game catalog
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Quản lý override hiển thị và đồng bộ game từ API trên cùng một màn hình.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Dữ liệu game và gói nạp vẫn được cron lấy từ API. Các lớp override do
                admin đặt như tên hiển thị, thumbnail, poster và trạng thái hot sẽ được
                giữ nguyên sau mỗi lần đồng bộ.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Tổng game
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">{games.length}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Đang hot
                </p>
                <p className="mt-3 text-3xl font-semibold text-amber-200">{hotGames}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Đã override tên
                </p>
                <p className="mt-3 text-3xl font-semibold text-emerald-200">
                  {renamedGames}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.55rem] border border-cyan-300/15 bg-[linear-gradient(160deg,rgba(8,47,73,0.78),rgba(2,6,23,0.94))] p-4 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-md">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  Auto sync API
                </p>
                <h2 className="mt-1 flex items-center gap-2 text-base font-semibold text-white">
                  <FiClock className="h-4 w-4 text-cyan-300" />
                  Chu kỳ cập nhật
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Chọn số phút giữa mỗi lần hệ thống tự đồng bộ dữ liệu từ API.
                </p>
              </div>

              <div className="inline-flex items-center self-start rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                Cron đang hoạt động
              </div>
            </div>

            <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-slate-950/35 p-3.5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex min-w-0 flex-1 items-end gap-3">
                  <input
                    type="number"
                    min="1"
                    max="59"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(e.target.value)}
                    className="w-20 bg-transparent text-4xl font-semibold tracking-[-0.05em] text-white outline-none"
                  />
                  <div className="pb-1">
                    <p className="text-sm font-medium text-slate-300">phút / lần</p>
                    <p className="mt-1 text-[11px] text-slate-500">{syncCadenceLabel}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={saveSyncConfig}
                    disabled={configLoading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] border border-white/10 bg-white/8 px-4 text-sm font-semibold text-white transition hover:border-cyan-300/30 disabled:opacity-60"
                  >
                    {configLoading ? (
                      <FiRefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <FiSave className="h-4 w-4" />
                    )}
                    Lưu lịch
                  </button>

                  <button
                    type="button"
                    onClick={syncNow}
                    disabled={syncLoading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
                  >
                    {syncLoading ? (
                      <FiRefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <FiZap className="h-4 w-4" />
                    )}
                    Chạy ngay
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              Override hiển thị của admin vẫn được giữ lại sau mỗi lần đồng bộ.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/15 backdrop-blur-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hiển thị, tên API, mã game..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/45 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/30"
            />
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
          >
            <FiPlus className="h-4 w-4" />
            Thêm game
          </button>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-cyan-300/20 border-t-cyan-300" />
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-slate-950/30 px-6 py-20 text-center">
          <p className="text-lg font-semibold text-white">Chưa có game phù hợp</p>
          <p className="mt-2 text-sm text-slate-400">
            Thử đổi từ khóa tìm kiếm hoặc tạo game mới từ admin.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {pagedGames.map((game) => (
            <article
              key={game.id}
              className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] shadow-[0_22px_60px_rgba(2,6,23,0.28)]"
            >
              <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="relative min-h-[220px] overflow-hidden bg-slate-950">
                  {imgSrc(game.thumbnail) ? (
                    <img
                      src={imgSrc(game.thumbnail)}
                      alt={game.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#164e63_0%,#020617_70%)] text-slate-300">
                      <FiImage className="h-7 w-7" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {game.is_hot ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-950">
                        <FiStar className="h-3.5 w-3.5" />
                        Hot
                      </span>
                    ) : null}

                    {game.custom_name ? (
                      <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                        Đã override tên
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                          {game.custom_name || game.name}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
                            <FiHash className="h-3.5 w-3.5" />
                            {game.gamecode}
                          </span>
                          {game.api_source ? (
                            <span className="rounded-full border border-white/10 px-3 py-1 uppercase tracking-[0.16em]">
                              {game.api_source}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(game)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-300/30"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeGame(game.id)}
                          disabled={deleteLoading === game.id}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-rose-300/30 disabled:opacity-50"
                        >
                          {deleteLoading === game.id ? (
                            <FiRefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <FiTrash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                          Tên nguồn API
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-200">
                          {game.api_name || "Game tạo thủ công"}
                        </p>
                      </div>

                      <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                          Publisher
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-200">
                          {game.publisher || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-slate-950/55">
                      {imgSrc(game.poster) ? (
                        <img
                          src={imgSrc(game.poster)}
                          alt={`${game.name} poster`}
                          className="h-24 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-24 items-center justify-center bg-[linear-gradient(135deg,#0f172a,#164e63)] text-sm font-medium text-slate-300">
                          Chưa có poster ngang
                        </div>
                      )}
                    </div>

                    <a
                      href={`/categories/topup/${game.gamecode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/30"
                    >
                      <FiEye className="h-4 w-4" />
                      Xem trang
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && filteredGames.length > 0 && totalPages > 1 ? (
        <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <Pagination
            currentPage={currentPage}
            totalPage={totalPages}
            totalItems={filteredGames.length}
            pageSize={pageSize}
            tone="dark"
            onPageChange={setCurrentPage}
          />
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#020617] shadow-[0_40px_120px_rgba(2,6,23,0.65)]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  {currentGame ? "Cập nhật game" : "Tạo game mới"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {currentGame ? currentGame.name : "Thêm game vào hệ thống"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={submitGame}
              className="max-h-[calc(92vh-81px)] overflow-y-auto px-6 py-6"
            >
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Tên hiển thị
                      </span>
                      <input
                        type="text"
                        value={formData.custom_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            custom_name: e.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-cyan-300/30"
                        placeholder="Liên Quân Mobile"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Mã game
                      </span>
                      <input
                        type="text"
                        value={formData.gamecode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            gamecode: e.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-cyan-300/30"
                        placeholder="lienquan"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Publisher
                      </span>
                      <input
                        type="text"
                        value={formData.publisher}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            publisher: e.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-cyan-300/30"
                        placeholder="Garena"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Hệ số markup
                      </span>
                      <input
                        type="text"
                        value={formData.origin_markup_percent}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            origin_markup_percent: e.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-cyan-300/30"
                        placeholder="1"
                      />
                    </label>
                  </div>

                  <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Trạng thái hiển thị
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Gắn badge hot và ưu tiên hiển thị ở các khối nổi bật.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            is_hot: !prev.is_hot,
                          }))
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          formData.is_hot
                            ? "bg-amber-300 text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-300"
                        }`}
                      >
                        <FiStar className="h-4 w-4" />
                        {formData.is_hot ? "Đang hot" : "Không hot"}
                      </button>
                    </div>
                  </section>

                  <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Danh sách server
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Thêm server bằng Enter hoặc nút Thêm.
                        </p>
                      </div>

                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300">
                        {formData.server.length} mục
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <input
                        id="serverInput"
                        type="text"
                        placeholder="Tên server..."
                        className="h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/45 px-4 text-sm text-white outline-none transition focus:border-cyan-300/30"
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;
                          e.preventDefault();
                          const value = e.currentTarget.value.trim();
                          if (!value) return;
                          setFormData((prev) => ({
                            ...prev,
                            server: [...prev.server, value],
                          }));
                          e.currentTarget.value = "";
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("serverInput");
                          const value = input?.value?.trim();
                          if (!value) return;
                          setFormData((prev) => ({
                            ...prev,
                            server: [...prev.server, value],
                          }));
                          input.value = "";
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-cyan-300/30"
                      >
                        <FiPlus className="h-4 w-4" />
                        Thêm
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {formData.server.map((serverItem, index) => (
                        <span
                          key={`${serverItem}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-slate-200"
                        >
                          {serverItem}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                server: prev.server.filter(
                                  (_, itemIndex) => itemIndex !== index
                                ),
                              }))
                            }
                            className="text-slate-400 transition hover:text-rose-200"
                          >
                            <FiX className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  {currentGame ? (
                    <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Dữ liệu từ nguồn API
                      </p>

                      <div className="mt-3 space-y-3 text-sm text-slate-300">
                        <div className="rounded-[1rem] border border-white/10 bg-slate-950/45 p-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            Tên nguồn
                          </p>
                          <p className="mt-2">{currentGame.api_name || "Không có"}</p>
                        </div>

                        <div className="rounded-[1rem] border border-white/10 bg-slate-950/45 p-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            Nguồn sync
                          </p>
                          <p className="mt-2 uppercase">
                            {currentGame.api_source || "Manual"}
                          </p>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  <Picker
                    id="thumbnail-upload"
                    label="Thumbnail"
                    hint="Ảnh card và danh sách game"
                    preview={thumbnailPreview}
                    onChange={(e) => pickFile(e, "thumbnail")}
                  />

                  <Picker
                    id="poster-upload"
                    label="Poster ngang"
                    hint="Banner đầu trang nạp game"
                    preview={posterPreview}
                    onChange={(e) => pickFile(e, "poster")}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitLoading}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:text-white disabled:opacity-60"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
                >
                  {submitLoading ? (
                    <FiRefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FiUploadCloud className="h-4 w-4" />
                  )}
                  {submitLoading
                    ? "Đang lưu..."
                    : currentGame
                    ? "Lưu thay đổi"
                    : "Tạo game"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
