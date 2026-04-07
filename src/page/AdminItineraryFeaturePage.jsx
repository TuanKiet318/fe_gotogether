import { useState, useEffect } from "react";
import {
    Plus,
    X,
    ImagePlus,
    Trash2,
    Search,
    MapPin,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
// Đảm bảo import đúng đường dẫn đến file service của bạn
import {
    SearchItinerariesForAdmin,
    CloneAndFeatureItinerary
} from "../service/api.admin.service.jsx";

export default function AdminItineraryFeaturePage() {
    /* ================= STATE ================= */
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // State cho phần Search
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState(null);

    // State cho phần Customize (Clone)
    const [overview, setOverview] = useState("");
    const [heroFiles, setHeroFiles] = useState([]);

    /* ================= HANDLERS ================= */

    // Tìm kiếm lịch trình của User với Debounce
    useEffect(() => {
        const fetchResults = async () => {
            if (!searchKeyword.trim()) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                // Gọi API search bạn vừa tạo trong service
                const res = await SearchItinerariesForAdmin(searchKeyword, 0, 10);
                // Lấy mảng content từ object Page của Spring Boot
                setSearchResults(res.data?.content || []);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(fetchResults, 400); // Đợi 400ms sau khi ngừng gõ mới gọi API
        return () => clearTimeout(debounce);
    }, [searchKeyword]);

    // Xử lý khi chọn 1 lịch trình từ kết quả tìm kiếm
    const handleSelectItinerary = (item) => {
        setSelectedItinerary(item);
        setOverview(item.overview || ""); // Nếu bài gốc có overview thì điền sẵn để admin sửa
        setSearchKeyword("");
        setSearchResults([]);
    };

    // Xử lý File ảnh
    const handleFileChange = (e) => {
        setHeroFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    };

    const removeFile = (index) => {
        setHeroFiles(heroFiles.filter((_, i) => i !== index));
    };

    // Gọi API Clone & Feature
    const handleSaveClone = async () => {
        if (!selectedItinerary) {
            toast.warning("Vui lòng chọn một lịch trình để Nổi bật");
            return;
        }
        if (!overview.trim()) {
            toast.warning("Overview là bắt buộc");
            return;
        }

        try {
            setLoading(true);

            // Gọi API CloneAndFeature từ service
            await CloneAndFeatureItinerary({
                sourceItineraryId: selectedItinerary.id,
                overview: overview,
                heroImageFiles: heroFiles,
            });

            toast.success("Đã nhân bản và Nổi bật lịch trình thành công!");

            // Đóng modal và reset form
            setShowModal(false);
            setSelectedItinerary(null);
            setOverview("");
            setHeroFiles([]);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xử lý");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    /* ================= RENDER ================= */
    return (
        <div className="p-4 sm:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900">
                        Featured Itineraries
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Highlight user itineraries with custom overview & hero images
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 bg-zinc-900 text-white h-9 px-4 rounded-md text-sm font-medium shadow-sm hover:bg-zinc-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Feature Itinerary
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setShowModal(false)}
                        className="absolute inset-0 bg-zinc-900/20 backdrop-blur-[2px]"
                    />

                    <div className="relative bg-white rounded-xl w-full max-w-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-semibold text-zinc-900">
                                    Clone & Feature Itinerary
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    Tìm lịch trình của User và nhân bản thành nội dung nổi bật
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4 text-zinc-400 hover:text-zinc-900" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 space-y-6 overflow-y-auto">

                            {/* --- BƯỚC 1: TÌM VÀ CHỌN LỊCH TRÌNH --- */}
                            <div className="relative">
                                <label className="text-xs font-medium text-zinc-700 mb-1 block">
                                    1. Tìm kiếm lịch trình gốc
                                </label>
                                {!selectedItinerary ? (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            placeholder="Gõ tên lịch trình hoặc tên User..."
                                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-zinc-200 focus:outline-none transition-all"
                                        />

                                        {/* Hiển thị dropdown kết quả */}
                                        {searchKeyword && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
                                                {isSearching ? (
                                                    <div className="p-4 text-xs text-zinc-500 text-center animate-pulse">
                                                        Đang tìm kiếm...
                                                    </div>
                                                ) : searchResults.length > 0 ? (
                                                    searchResults.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => handleSelectItinerary(item)}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                                                        >
                                                            <div className="text-sm font-medium text-zinc-900">{item.title}</div>
                                                            <div className="text-xs text-zinc-500 mt-0.5">Bởi: {item.ownerName || "Unknown"}</div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-xs text-zinc-500 text-center">
                                                        Không tìm thấy kết quả phù hợp.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Đã chọn xong lịch trình
                                    <div className="flex items-center justify-between p-3.5 border rounded-md bg-zinc-50 border-zinc-200">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-zinc-700" />
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
                                                    {selectedItinerary.title}
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-0.5">Bản gốc bởi: {selectedItinerary.ownerName || "Unknown"}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedItinerary(null)}
                                            className="text-xs text-zinc-500 hover:text-zinc-900 font-medium underline underline-offset-2"
                                        >
                                            Chọn lại
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* --- BƯỚC 2: TÙY CHỈNH --- */}
                            {selectedItinerary && (
                                <div className="space-y-6 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {/* Overview Mới */}
                                    <div>
                                        <label className="text-xs font-medium text-zinc-700 block mb-1">
                                            2. Tùy chỉnh Overview (Sẽ hiển thị trên Trang chủ)
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={overview}
                                            onChange={(e) => setOverview(e.target.value)}
                                            placeholder="Viết lời dẫn hấp dẫn cho lịch trình này..."
                                            className="w-full border border-gray-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-zinc-200 focus:outline-none transition-all"
                                        />
                                    </div>

                                    {/* Ảnh Bìa */}
                                    <div>
                                        <label className="text-xs font-medium text-zinc-700 block mb-1">
                                            3. Chọn Ảnh Bìa (Hero Images)
                                        </label>
                                        <div className="mt-2 space-y-3">
                                            <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 text-sm font-medium transition-colors text-zinc-700">
                                                <ImagePlus className="w-4 h-4" />
                                                Tải ảnh lên
                                                <input
                                                    type="file"
                                                    multiple
                                                    hidden
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>

                                            {heroFiles.length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {heroFiles.map((file, i) => (
                                                        <div key={i} className="relative border border-gray-200 rounded-md p-2 flex items-center bg-gray-50">
                                                            <span className="truncate text-xs text-zinc-700 pr-5">
                                                                {file.name}
                                                            </span>
                                                            <button
                                                                onClick={() => removeFile(i)}
                                                                className="absolute top-1/2 -translate-y-1/2 right-2 text-zinc-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 shrink-0">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                disabled={loading || !selectedItinerary}
                                onClick={handleSaveClone}
                                className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? "Đang xử lý..." : "Lưu & Nổi Bật"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}