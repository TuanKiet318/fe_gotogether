import { useState, useEffect } from "react";
import {
    Search, MapPin, Plus, X, ImagePlus, Trash2,
    CheckCircle2, Globe, EyeOff, Eye, FileText
} from "lucide-react";
import { toast } from "sonner";

// Import các API (Điều chỉnh đường dẫn theo dự án của bạn)
import {
    GetAllDestinations,
    GetFeaturedItinerariesByDestination,
    SearchItinerariesForAdmin,
    CloneAndFeatureItinerary,
    ToggleItineraryPublic // Hàm vừa thêm ở Bước 1
} from "../service/api.admin.service";

export default function AdminSampleItineraryPage() {
    /* ================= STATE ================= */
    const [loading, setLoading] = useState(false);

    // 1. State Quản lý Destination (Cột trái)
    const [destinations, setDestinations] = useState([]);
    const [destSearch, setDestSearch] = useState("");
    const [selectedDest, setSelectedDest] = useState(null);

    // 2. State Quản lý Lịch trình mẫu (Cột phải)
    const [featuredItineraries, setFeaturedItineraries] = useState([]);
    const [loadingList, setLoadingList] = useState(false);

    // 3. State Modal Clone
    const [showModal, setShowModal] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [overview, setOverview] = useState("");
    const [heroFiles, setHeroFiles] = useState([]);

    /* ================= EFFECT: LOAD DESTINATIONS ================= */
    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const res = await GetAllDestinations();
                // Giả sử API trả về mảng trực tiếp hoặc res.data
                setDestinations(res.data || res || []);
            } catch (error) {
                toast.error("Không thể tải danh sách địa điểm");
            }
        };
        fetchDestinations();
    }, []);

    /* ================= EFFECT: LOAD LỊCH TRÌNH MẪU THEO DEST ================= */
    const fetchFeaturedItineraries = async (destId) => {
        if (!destId) return;
        setLoadingList(true);
        try {
            const res = await GetFeaturedItinerariesByDestination(destId);
            setFeaturedItineraries(res.data || res || []);
        } catch (error) {
            toast.error("Lỗi khi tải lịch trình mẫu");
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        if (selectedDest) {
            fetchFeaturedItineraries(selectedDest.id);
        }
    }, [selectedDest]);

    /* ================= HANDLERS: ACTIONS TRÊN BẢNG ================= */
    const handleTogglePublish = async (itinerary) => {
        try {
            const newValue = !itinerary.isPublic; // Đảo ngược trạng thái hiện tại
            await ToggleItineraryPublic(itinerary.id, newValue);
            toast.success(newValue ? "Đã Publish lên trang chủ" : "Đã ẩn khỏi trang chủ");
            // Cập nhật lại list
            fetchFeaturedItineraries(selectedDest.id);
        } catch (error) {
            toast.error("Lỗi khi thay đổi trạng thái Publish");
        }
    };

    /* ================= HANDLERS: CLONE MODAL ================= */
    useEffect(() => {
        const fetchUserItineraries = async () => {
            // Nếu ô search rỗng, HOẶC chưa chọn địa điểm bên trái -> không làm gì cả
            if (!searchKeyword.trim() || !selectedDest) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                // ĐÃ SỬA: Truyền selectedDest.id vào API
                const res = await SearchItinerariesForAdmin(selectedDest.id, searchKeyword, 0, 10);
                setSearchResults(res?.content || []);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(fetchUserItineraries, 400);
        return () => clearTimeout(debounce);

        // ĐÃ SỬA: Thêm selectedDest.id vào dependency array để React theo dõi
    }, [searchKeyword, selectedDest?.id]);
    const handleSelectItinerary = (item) => {
        setSelectedItinerary(item);
        setOverview(item.overview || "");
        setSearchKeyword("");
        setSearchResults([]);
    };

    const handleSaveClone = async () => {
        if (!selectedItinerary || !overview.trim()) {
            toast.warning("Vui lòng chọn lịch trình và nhập Overview");
            return;
        }

        try {
            setLoading(true);
            await CloneAndFeatureItinerary({
                sourceItineraryId: selectedItinerary.id,
                overview: overview,
                heroImageFiles: heroFiles,
            });
            toast.success("Đã tạo Lịch trình mẫu thành công!");
            setShowModal(false);
            setSelectedItinerary(null);
            setOverview("");
            setHeroFiles([]);
            // Tải lại bảng để thấy lịch trình vừa tạo
            fetchFeaturedItineraries(selectedDest.id);
        } catch (error) {
            toast.error("Lỗi khi nhân bản lịch trình");
        } finally {
            setLoading(false);
        }
    };

    /* ================= RENDER ================= */
    // Filter destination locally for search bar
    const filteredDestinations = destinations.filter(d =>
        d.name?.toLowerCase().includes(destSearch.toLowerCase())
    );

    return (
        <div className="flex flex-col md:flex-row h-full min-h-[85vh] bg-gray-50/50 p-4 gap-4">

            {/* CỘT TRÁI: DANH SÁCH ĐỊA ĐIỂM */}
            <div className="w-full md:w-80 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden shrink-0">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-zinc-900 mb-3">Quản lý theo Địa điểm</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Tìm địa điểm..."
                            value={destSearch}
                            onChange={(e) => setDestSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredDestinations.map(dest => (
                        <button
                            key={dest.id}
                            onClick={() => setSelectedDest(dest)}
                            className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${selectedDest?.id === dest.id
                                ? "bg-zinc-900 text-white"
                                : "hover:bg-gray-100 text-zinc-700"
                                }`}
                        >
                            <MapPin className={`w-4 h-4 ${selectedDest?.id === dest.id ? "text-zinc-300" : "text-zinc-400"}`} />
                            <span className="text-sm font-medium">{dest.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* CỘT PHẢI: LỊCH TRÌNH MẪU CỦA ĐỊA ĐIỂM */}
            <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {!selectedDest ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                        <Globe className="w-12 h-12 mb-3 text-zinc-200" />
                        <p>Chọn một địa điểm bên trái để quản lý lịch trình</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                                    Lịch trình mẫu tại {selectedDest.name}
                                </h2>
                                <p className="text-sm text-zinc-500 mt-1">
                                    Quản lý và Publish nội dung hiển thị lên App/Web
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm Lịch Mẫu
                            </button>
                        </div>

                        {/* Bảng Danh sách Lịch trình mẫu */}
                        <div className="flex-1 overflow-auto p-6">
                            {loadingList ? (
                                <div className="text-center text-zinc-500 py-10 animate-pulse">Đang tải dữ liệu...</div>
                            ) : featuredItineraries.length === 0 ? (
                                <div className="text-center border-2 border-dashed border-gray-200 rounded-xl py-12">
                                    <FileText className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-500">Chưa có lịch trình mẫu nào tại {selectedDest.name}</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {featuredItineraries.map(itinerary => (
                                        <div key={itinerary.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-zinc-300 transition-colors">
                                            <div className="flex items-center gap-4">
                                                {/* Ảnh thu nhỏ */}
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                    {itinerary.heroImage ? (
                                                        <img src={itinerary.heroImage} alt="hero" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImagePlus className="w-5 h-5" /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-zinc-900">{itinerary.title}</h3>
                                                    <p className="text-xs text-zinc-500 mt-1 line-clamp-1 max-w-lg">{itinerary.overview}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                                                        <span className="text-zinc-500">{itinerary.totalDays} Ngày • {itinerary.totalItems} Địa điểm</span>
                                                        {itinerary.isPublic ? (
                                                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-md flex items-center gap-1"><Eye className="w-3 h-3" /> Đang Publish</span>
                                                        ) : (
                                                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1"><EyeOff className="w-3 h-3" /> Bản Nháp</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Nút Action */}
                                            <div className="flex flex-col gap-2 shrink-0 ml-4">
                                                <button
                                                    onClick={() => handleTogglePublish(itinerary)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${itinerary.isPublic
                                                        ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                                        : "border-green-200 text-green-700 hover:bg-green-50"
                                                        }`}
                                                >
                                                    {itinerary.isPublic ? "Unpublish (Ẩn)" : "Publish (Hiện)"}
                                                </button>
                                                {/* Thêm nút Edit/Delete nếu bạn muốn */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* MODAL CLONE (Tương tự code cũ nhưng chỉ hiện khi có selectedDest) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div onClick={() => setShowModal(false)} className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl w-full max-w-2xl border shadow-xl flex flex-col max-h-[90vh]">
                        {/* Header Modal */}
                        <div className="px-6 py-5 border-b flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-semibold text-zinc-900">
                                    Thêm Lịch Mẫu cho {selectedDest.name}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Tìm lịch trình của User tại {selectedDest.name} và nhân bản</p>
                            </div>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-zinc-400 hover:text-zinc-900" /></button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* BƯỚC 1: SEARCH */}
                            <div>
                                <label className="text-xs font-medium text-zinc-700 mb-1.5 block">1. Tìm kiếm lịch trình của User</label>
                                {!selectedItinerary ? (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            placeholder="Gõ tên lịch trình..."
                                            className="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                                        />
                                        {searchKeyword && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                                                {isSearching ? (
                                                    <div className="p-4 text-xs text-zinc-500 text-center animate-pulse">Đang tìm...</div>
                                                ) : searchResults.length > 0 ? (
                                                    searchResults.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => handleSelectItinerary(item)}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                                                        >
                                                            <div className="text-sm font-medium text-zinc-900">{item.title}</div>
                                                            <div className="text-xs text-zinc-500">Tác giả: {item.ownerName || "Unknown"}</div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-xs text-zinc-500 text-center">Không tìm thấy.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span className="text-sm font-medium">{selectedItinerary.title}</span>
                                        </div>
                                        <button onClick={() => setSelectedItinerary(null)} className="text-xs text-blue-600 hover:underline">Đổi</button>
                                    </div>
                                )}
                            </div>

                            {/* BƯỚC 2: TÙY CHỈNH */}
                            {selectedItinerary && (
                                <div className="space-y-5 pt-2 animate-in fade-in">
                                    <div>
                                        <label className="text-xs font-medium text-zinc-700 block mb-1">2. Overview (Sẽ hiện trên trang chủ)</label>
                                        <textarea
                                            rows={4}
                                            value={overview}
                                            onChange={(e) => setOverview(e.target.value)}
                                            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-zinc-700 block mb-1">3. Ảnh Bìa (Hero Images)</label>
                                        <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium">
                                            <ImagePlus className="w-4 h-4" /> Tải ảnh lên
                                            <input type="file" multiple hidden accept="image/*" onChange={(e) => setHeroFiles((prev) => [...prev, ...Array.from(e.target.files)])} />
                                        </label>
                                        {heroFiles.length > 0 && (
                                            <div className="grid grid-cols-2 mt-3 gap-2">
                                                {heroFiles.map((file, i) => (
                                                    <div key={i} className="flex justify-between items-center border p-2 rounded-lg bg-gray-50 text-xs">
                                                        <span className="truncate pr-2">{file.name}</span>
                                                        <button onClick={() => setHeroFiles(heroFiles.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 shrink-0 rounded-b-xl">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-gray-200 rounded-lg">Hủy</button>
                            <button disabled={loading || !selectedItinerary} onClick={handleSaveClone} className="px-5 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg disabled:opacity-50">
                                {loading ? "Đang xử lý..." : "Lưu & Tạo Lịch"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}