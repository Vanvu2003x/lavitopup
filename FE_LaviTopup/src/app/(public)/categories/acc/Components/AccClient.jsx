"use client"
import { getInfo } from "@/services/auth.service"
import { useEffect, useState } from "react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { getGameByGameCode, getGames } from "@/services/games.service"
import { getAllAcc } from "@/services/acc.service"
import AccCardItem from "./accCard"
import { FiSearch, FiFilter, FiDollarSign, FiShoppingBag, FiGrid, FiList, FiChevronDown, FiX } from "react-icons/fi"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AccClient({ gamecode }) {
    const baseURLAPI = process.env.NEXT_PUBLIC_API_URL
    const router = useRouter()

    const [game, setGame] = useState(null)
    const [games, setGames] = useState([])
    const [allAccList, setAllAccList] = useState([]) // dữ liệu gốc
    const [accList, setAccList] = useState([]) // dữ liệu hiển thị
    const [loading, setLoading] = useState(true)
    const [userLevel, setUserLevel] = useState(1)

    // filter
    const [keyword, setKeyword] = useState("")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [sortBy, setSortBy] = useState("newest")

    // Game Search
    const [gameSearch, setGameSearch] = useState("")

    // UI states
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    // pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12

    // Fetch Games List (Sidebar)
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesData = await getGames()
                setGames(gamesData || [])
            } catch (error) {
                console.error("Failed to fetch games list", error)
            }
        }
        fetchGames()
    }, [])

    // fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch User Level
                try {
                    const userData = await getInfo()
                    if (userData?.user?.level) setUserLevel(userData.user.level)
                } catch (e) {
                    // Not logged in
                }

                if (!gamecode) {
                    setLoading(false)
                    return
                }

                const gameData = await getGameByGameCode(gamecode)
                setGame(gameData)

                if (gameData?.id) {
                    const accData = await getAllAcc(gameData.id)
                    // only selling
                    const sellingAcc = accData.data.data.filter(acc => acc.status === "selling")
                    setAllAccList(sellingAcc)
                    setAccList(sellingAcc)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [gamecode])

    // filter & sort
    const handleFilterAndSort = () => {
        let result = allAccList.filter(acc => {
            const k = keyword.toLowerCase()
            const matchId = acc.id?.toString().includes(k)
            const infoText = acc.info?.replace(/<[^>]+>/g, "").toLowerCase() || ""
            const matchInfo = infoText.includes(k)
            const matchMin = minPrice ? acc.price >= parseInt(minPrice) : true
            const matchMax = maxPrice ? acc.price <= parseInt(maxPrice) : true
            return (matchId || matchInfo) && matchMin && matchMax
        })

        // Sorting
        if (sortBy === "price_asc") {
            result.sort((a, b) => a.price - b.price)
        } else if (sortBy === "price_desc") {
            result.sort((a, b) => b.price - a.price)
        } else if (sortBy === "newest") {
            result.sort((a, b) => b.id - a.id)
        }

        setAccList(result)
        setCurrentPage(1)
    }

    // Trigger filter when dependencies change
    useEffect(() => {
        handleFilterAndSort()
    }, [keyword, minPrice, maxPrice, sortBy, allAccList])


    // pagination
    const totalPages = Math.ceil(accList.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedAcc = accList.slice(startIndex, startIndex + itemsPerPage)

    // Filtered Games
    const filteredGames = games.filter(g => g.name.toLowerCase().includes(gameSearch.toLowerCase()))

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="md:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 font-bold mb-4"
                >
                    <span className="flex items-center gap-2">
                        <FiFilter className="text-cyan-600" /> Menu & Bộ lọc
                    </span>
                    <FiChevronDown className={`transition-transform duration-300 ${showMobileFilters ? "rotate-180" : ""}`} />
                </button>

                {/* Sidebar: Games List + Filters */}
                <aside className={`w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col gap-6 ${showMobileFilters ? 'block' : 'hidden md:flex'}`}>

                    {/* Game List Sidebar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
                        <div className="px-5 py-4 border-b border-gray-50 font-bold text-sm text-gray-900 bg-gray-50/50 flex justify-between items-center">
                            <span>Danh mục game</span>
                            <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-100">{games.length}</span>
                        </div>

                        {/* Game Search Input */}
                        <div className="px-3 py-2 border-b border-gray-50">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm game..."
                                    value={gameSearch}
                                    onChange={(e) => setGameSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded-lg text-xs font-medium focus:ring-1 focus:ring-cyan-500/50"
                                />
                                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            </div>
                        </div>

                        <div className="p-3 overflow-y-auto show-scroll-y flex-1 min-h-[200px]">
                            <div className="flex flex-col gap-1">
                                {filteredGames.length > 0 ? filteredGames.map(g => (
                                    <Link
                                        key={g.id}
                                        href={`/categories/acc?gamecode=${g.gamecode}`}
                                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${g.gamecode === gamecode
                                            ? 'bg-cyan-50 text-cyan-700 font-bold shadow-sm border border-cyan-100'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-600'
                                            }`}
                                    >
                                        <img
                                            src={g.thumbnail?.startsWith('http') ? g.thumbnail : (baseURLAPI + g.thumbnail)}
                                            alt={g.name}
                                            className="w-8 h-8 rounded-lg object-cover shadow-sm bg-gray-100" // Added bg-gray-100 placeholder
                                            onError={(e) => { e.target.src = "https://placehold.co/100x100/e2e8f0/1e293b?text=Game" }} // Fallback image
                                        />
                                        <span className="text-sm truncate">{g.name}</span>
                                    </Link>
                                )) : (
                                    <div className="text-center py-4 text-xs text-gray-400">Không tìm thấy game</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {gamecode && (
                        <>
                            {/* Game Info Card (Mini) */}
                            {game && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                                    <img
                                        src={game.thumbnail?.startsWith('http') ? game.thumbnail : (baseURLAPI + game.thumbnail)}
                                        alt={game.name}
                                        className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                                        onError={(e) => { e.target.src = "https://placehold.co/100x100/e2e8f0/1e293b?text=Game" }}
                                    />
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-tight">{game.name}</h3>
                                        <p className="text-xs text-gray-500 font-medium">{game.publisher}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <FiFilter className="text-cyan-600" />
                                    Bộ lọc
                                </h3>
                                {(keyword || minPrice || maxPrice) && (
                                    <button
                                        onClick={() => {
                                            setKeyword("")
                                            setMinPrice("")
                                            setMaxPrice("")
                                        }}
                                        className="text-xs font-bold text-cyan-600 hover:underline"
                                    >
                                        Xóa tất cả
                                    </button>
                                )}
                            </div>

                            {/* Filter Groups */}
                            <div className="flex flex-col gap-4">
                                {/* Search Group */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-50 font-bold text-sm text-gray-900">
                                        Tìm kiếm
                                    </div>
                                    <div className="p-5">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Nhập ID, Skin, Rank..."
                                                value={keyword}
                                                onChange={e => setKeyword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 text-gray-900 placeholder-gray-400"
                                            />
                                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Price Range Group */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-50 font-bold text-sm text-gray-900 flex justify-between items-center">
                                        Khoảng giá
                                        <span className="text-xs font-normal text-gray-400">VNĐ</span>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={minPrice}
                                                    onChange={e => setMinPrice(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border-none rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-cyan-500/20"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                            </div>
                                            <span className="text-gray-300">-</span>
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={maxPrice}
                                                    onChange={e => setMaxPrice(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border-none rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-cyan-500/20"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Ad Banner */}
                    <div className="w-full aspect-[4/3] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-cyan-500/25 transition-all">
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <div className="relative z-10">
                            <p className="font-bold text-lg mb-2">Cần bán tài khoản?</p>
                            <p className="text-sm opacity-90 mb-4">Thu mua nick giá cao, giao dịch nhanh gọn.</p>
                            <button className="bg-white text-cyan-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm">Liên hệ Admin</button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {!gamecode ? (
                        /* No Game Selected - Show Game Grid */
                        <div className="flex flex-col items-center justify-center py-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vui lòng chọn game</h2>
                            <p className="text-gray-500 mb-8">Chọn một game để xem danh sách tài khoản đang bán</p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                                {filteredGames.length > 0 ? filteredGames.map(g => (
                                    <Link
                                        key={g.id}
                                        href={`/categories/acc?gamecode=${g.gamecode}`}
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all overflow-hidden"
                                    >
                                        <div className="aspect-[16/9] w-full relative overflow-hidden">
                                            <img
                                                src={g.thumbnail?.startsWith('http') ? g.thumbnail : (baseURLAPI + g.thumbnail)}
                                                alt={g.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 bg-gray-100"
                                                onError={(e) => { e.target.src = "https://placehold.co/600x400/e2e8f0/1e293b?text=Game" }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <div className="absolute bottom-3 left-3 text-white font-bold text-sm sm:text-base drop-shadow-md">
                                                {g.name}
                                            </div>
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="col-span-full text-center py-10 text-gray-400">Không tìm thấy game</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Game Selected - Show Account Grid */
                        <>
                            {/* Grid Header */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mb-1">
                                        {game ? `Danh sách ${game.name}` : "Tài khoản game"}
                                    </h1>
                                    <p className="text-gray-500 text-sm">
                                        Tìm thấy <span className="font-bold text-gray-900">{accList.length}</span> tài khoản phù hợp
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-500 hidden sm:block">Sắp xếp:</span>
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 hover:border-gray-300 transition-colors cursor-pointer shadow-sm"
                                        >
                                            <option value="newest">Mới nhất</option>
                                            <option value="price_asc">Giá: Thấp đến Cao</option>
                                            <option value="price_desc">Giá: Cao đến Thấp</option>
                                        </select>
                                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Chips */}
                            {(keyword || minPrice || maxPrice) && (
                                <div className="flex flex-wrap gap-2 mb-6 animate-fadeIn">
                                    {keyword && (
                                        <div className="flex items-center gap-1 bg-white border border-cyan-100 rounded-full px-3 py-1 text-xs font-bold text-cyan-700 shadow-sm">
                                            Tìm: {keyword}
                                            <FiX className="cursor-pointer hover:text-red-500" onClick={() => setKeyword("")} />
                                        </div>
                                    )}
                                    {(minPrice || maxPrice) && (
                                        <div className="flex items-center gap-1 bg-white border border-cyan-100 rounded-full px-3 py-1 text-xs font-bold text-cyan-700 shadow-sm">
                                            Giá: {minPrice || 0} - {maxPrice || "Max"}
                                            <FiX className="cursor-pointer hover:text-red-500" onClick={() => { setMinPrice(""); setMaxPrice("") }} />
                                        </div>
                                    )}
                                    <button onClick={() => { setKeyword(""); setMinPrice(""); setMaxPrice(""); }} className="text-xs font-bold text-red-500 hover:underline px-2">Xóa tất cả</button>
                                </div>
                            )}

                            {/* Product Grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                            <Skeleton height={200} className="rounded-xl mb-4" />
                                            <Skeleton count={2} />
                                            <div className="flex justify-between mt-4">
                                                <Skeleton width={80} height={30} />
                                                <Skeleton width={40} height={30} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {paginatedAcc.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {paginatedAcc.map(acc => (
                                                <AccCardItem
                                                    key={acc.id}
                                                    acc={acc}
                                                    userLevel={userLevel}
                                                    onBuySuccess={() => {
                                                        const newAll = allAccList.filter(item => item.id !== acc.id)
                                                        setAllAccList(newAll)
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                            <div className="text-6xl mb-4 opacity-50">🔍</div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy tài khoản</h3>
                                            <p className="text-gray-500">Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác</p>
                                            <button
                                                onClick={() => { setKeyword(""); setMinPrice(""); setMaxPrice(""); }}
                                                className="mt-6 px-6 py-2 bg-cyan-50 text-cyan-600 font-bold rounded-xl hover:bg-cyan-100 transition-colors"
                                            >
                                                Xóa bộ lọc
                                            </button>
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center mt-12 mb-8">
                                            <nav className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-cyan-500 hover:text-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                                                >
                                                    ←
                                                </button>

                                                {Array.from({ length: totalPages }).map((_, idx) => {
                                                    const page = idx + 1
                                                    if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                                                        return (
                                                            <button
                                                                key={page}
                                                                onClick={() => setCurrentPage(page)}
                                                                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === page
                                                                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                                                                    : "bg-white border border-gray-200 text-gray-500 hover:border-cyan-500 hover:text-cyan-600"
                                                                    }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        )
                                                    } else if (page === currentPage - 3 || page === currentPage + 3) {
                                                        return <span key={page} className="text-gray-400">...</span>
                                                    }
                                                    return null
                                                })}

                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-cyan-500 hover:text-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                                                >
                                                    →
                                                </button>
                                            </nav>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}
