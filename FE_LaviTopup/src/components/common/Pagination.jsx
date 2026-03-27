"use client";

function buildPages(currentPage, totalPage, siblingCount) {
    const pages = [];
    const start = Math.max(2, currentPage - siblingCount);
    const end = Math.min(totalPage - 1, currentPage + siblingCount);

    pages.push(1);

    if (start > 2) {
        pages.push("left-ellipsis");
    }

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (end < totalPage - 1) {
        pages.push("right-ellipsis");
    }

    if (totalPage > 1) {
        pages.push(totalPage);
    }

    return pages;
}

export default function Pagination({
    currentPage,
    totalPage,
    onPageChange,
    siblingCount = 1,
    totalItems,
    pageSize,
    tone = "light",
}) {
    if (!totalPage || totalPage <= 1) {
        return null;
    }

    const pages = buildPages(currentPage, totalPage, siblingCount);
    const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
    const endItem = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;
    const isDark = tone === "dark";

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className={`text-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {startItem && endItem ? (
                    <span>
                        Hiển thị <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{startItem}</span> -{" "}
                        <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{endItem}</span> trên{" "}
                        <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{totalItems}</span> bản ghi
                    </span>
                ) : (
                    <span>
                        Trang <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{currentPage}</span> /{" "}
                        <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{totalPage}</span>
                    </span>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`rounded-[0.95rem] border px-3 py-2 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        isDark
                            ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    Trước
                </button>

                {pages.map((page) =>
                    typeof page === "number" ? (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`min-w-10 rounded-[0.95rem] border px-3 py-2 text-[13px] font-semibold transition ${
                                page === currentPage
                                    ? isDark
                                        ? "border-cyan-300/40 bg-cyan-400/15 text-white shadow-lg shadow-cyan-950/25"
                                        : "border-sky-500 bg-sky-600 text-white shadow-lg shadow-sky-200"
                                    : isDark
                                        ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span
                            key={page}
                            className={`flex min-w-11 items-center justify-center px-1 text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
                        >
                            ...
                        </span>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPage}
                    className={`rounded-[0.95rem] border px-3 py-2 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        isDark
                            ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    Sau
                </button>
            </div>
        </div>
    );
}
