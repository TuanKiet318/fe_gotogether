import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import LocationMap from "../components/LocationMap.jsx";
import {
    GetAllDestinations,
    GetAllCategories,
    GetPlacesByDestination,
    GetPlacesByCategory,
    CreateItinerary,
} from "../service/api.admin.service.jsx";
import {
    MapIcon,
    PlusIcon,
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    PaperAirplaneIcon,
    CalendarIcon,
    AdjustmentsHorizontalIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";

const TRANSPORT_OPTIONS = ["WALK", "BIKE", "CAR", "BUS", "TRAIN", "FLIGHT", "BOAT"];

// helper: format yyyy-mm-dd -> Date
const toDate = (s) => (s ? new Date(s + "T00:00:00") : null);
// helper: tính số ngày inclusive
const daysBetween = (start, end) => Math.floor((end - start) / (24 * 3600 * 1000)) + 1;
// helper: tạo id tạm cho client
const tid = () => Math.random().toString(36).slice(2, 10);

export default function CreateItineraryPage() {
    const navigate = useNavigate();

    // Form chính
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Chọn destination / category / place để thêm item
    const [destinations, setDestinations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [placeFilter, setPlaceFilter] = useState("");
    const [places, setPlaces] = useState([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState("");

    // Items đã chọn cho lịch trình
    const [items, setItems] = useState([]);

    // Map toggle
    const [isMapVisible, setIsMapVisible] = useState(true);

    // Loading flags
    const [loadingDest, setLoadingDest] = useState(false);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Errors
    const [error, setError] = useState("");

    // load destinations + categories ban đầu
    useEffect(() => {
        (async () => {
            try {
                setLoadingDest(true);
                const [dRes, cRes] = await Promise.all([GetAllDestinations(), GetAllCategories()]);
                const dData = dRes?.data ?? dRes ?? [];
                const cData = cRes?.data ?? cRes ?? [];
                setDestinations(dData);
                setCategories(cData);
                if (dData?.length) setSelectedDestination(dData[0].id);
            } catch (e) {
                console.error(e);
                setError("Không tải được danh sách điểm đến / danh mục.");
            } finally {
                setLoadingDest(false);
            }
        })();
    }, []);

    // Load places theo destination/category
    useEffect(() => {
        if (!selectedDestination) return;
        (async () => {
            try {
                setLoadingPlaces(true);
                let res;
                if (selectedCategory) {
                    res = await GetPlacesByCategory(selectedDestination, selectedCategory);
                    const data = res?.data ?? res ?? {};
                    // API này mình giả định trả {category, places}
                    setPlaces(data?.places || []);
                } else {
                    // lấy nhiều 1 chút để chọn nhanh
                    res = await GetPlacesByDestination(selectedDestination, 0, 50, "name", "asc", null);
                    const data = res?.data ?? res ?? {};
                    setPlaces(data?.content || data?.items || data || []);
                }
            } catch (e) {
                console.error(e);
                setPlaces([]);
            } finally {
                setLoadingPlaces(false);
            }
        })();
    }, [selectedDestination, selectedCategory]);

    // Filter client-side theo placeFilter (tên)
    const filteredPlaces = useMemo(() => {
        if (!placeFilter.trim()) return places;
        const q = placeFilter.trim().toLowerCase();
        return places.filter((p) => (p.name || "").toLowerCase().includes(q));
    }, [places, placeFilter]);

    // Tính số ngày và danh sách ngày
    const start = toDate(startDate);
    const end = toDate(endDate);
    const dayCount = start && end && end >= start ? daysBetween(start, end) : 0;

    const daysArray = useMemo(() => {
        if (!dayCount || !start) return [];
        return Array.from({ length: dayCount }, (_, i) => ({
            label: `Ngày ${i + 1}`,
            value: i + 1,
            dateStr: new Date(start.getTime() + i * 24 * 3600 * 1000).toLocaleDateString(),
        }));
    }, [dayCount, start]);

    // helper: tìm order kế tiếp trong 1 ngày
    const nextOrderInDay = (dayNumber) => {
        const sameDay = items.filter((it) => it.dayNumber === dayNumber);
        if (!sameDay.length) return 1;
        return Math.max(...sameDay.map((it) => it.orderInDay || 0)) + 1;
    };

    // Thêm item vào danh sách
    const addItem = () => {
        setError("");
        if (!selectedPlaceId) return setError("Hãy chọn địa điểm để thêm.");
        if (!dayCount) return setError("Hãy chọn ngày bắt đầu/kết thúc hợp lệ trước.");

        const place = places.find((p) => p.id === selectedPlaceId);
        if (!place) return setError("Địa điểm không hợp lệ.");

        // mặc định thêm vào ngày 1, có thể chỉnh sau
        const dayNumber = 1;
        const orderInDay = nextOrderInDay(dayNumber);

        setItems((prev) => [
            ...prev,
            {
                _tid: tid(),
                placeId: place.id,
                place,
                dayNumber,
                orderInDay,
                startTime: "",
                endTime: "",
                description: "",
                estimatedCost: "",
                transportMode: "",
            },
        ]);
    };

    // Xóa item
    const removeItem = (_tid) => {
        setItems((prev) => prev.filter((x) => x._tid !== _tid));
    };

    // Move item up/down trong ngày
    const moveItem = (_tid, dir) => {
        setItems((prev) => {
            const arr = [...prev];
            const idx = arr.findIndex((x) => x._tid === _tid);
            if (idx === -1) return prev;
            const day = arr[idx].dayNumber;

            // lấy các item cùng ngày theo order
            const sameDayIdx = arr
                .map((x, i) => ({ i, x }))
                .filter((o) => o.x.dayNumber === day)
                .sort((a, b) => (a.x.orderInDay || 0) - (b.x.orderInDay || 0))
                .map((o) => o.i);

            const pos = sameDayIdx.indexOf(idx);
            if (pos === -1) return prev;

            const targetPos = dir === "up" ? pos - 1 : pos + 1;
            if (targetPos < 0 || targetPos >= sameDayIdx.length) return prev;

            const otherIdx = sameDayIdx[targetPos];
            // hoán đổi orderInDay
            const a = arr[idx].orderInDay;
            arr[idx].orderInDay = arr[otherIdx].orderInDay;
            arr[otherIdx].orderInDay = a;

            // sắp xếp lại ổn định theo (dayNumber, orderInDay)
            return arr
                .slice()
                .sort((A, B) =>
                    A.dayNumber === B.dayNumber
                        ? (A.orderInDay || 0) - (B.orderInDay || 0)
                        : A.dayNumber - B.dayNumber
                );
        });
    };

    // Cập nhật field của 1 item
    const updateItemField = (_tid, field, value) => {
        setItems((prev) =>
            prev.map((x) => (x._tid === _tid ? { ...x, [field]: value } : x))
        );
    };

    // Chuyển ngày của 1 item → set orderInDay tiếp theo của ngày mới
    const changeItemDay = (_tid, newDay) => {
        setItems((prev) =>
            prev.map((x) =>
                x._tid === _tid
                    ? { ...x, dayNumber: Number(newDay), orderInDay: nextOrderInDay(Number(newDay)) }
                    : x
            )
        );
    };

    // Payload gửi server
    const payload = useMemo(() => {
        const mappedItems = items.map((x) => ({
            placeId: x.placeId,
            dayNumber: Number(x.dayNumber),
            orderInDay: Number(x.orderInDay),
            startTime: x.startTime || null,
            endTime: x.endTime || null,
            description: x.description || null,
            estimatedCost: x.estimatedCost ? Number(x.estimatedCost) : null,
            transportMode: x.transportMode || null,
        }));
        return {
            title: title.trim(),
            startDate,
            endDate,
            items: mappedItems,
        };
    }, [title, startDate, endDate, items]);

    // Validate trước khi submit
    const validateBeforeSubmit = () => {
        if (!title.trim()) return "Tiêu đề không được để trống.";
        if (!startDate || !endDate) return "Hãy chọn ngày bắt đầu và kết thúc.";
        if (!dayCount) return "Khoảng ngày không hợp lệ.";
        // kiểm tra dayNumber trong range
        for (const it of items) {
            if (!it.dayNumber || it.dayNumber < 1 || it.dayNumber > dayCount)
                return "Có item có dayNumber ngoài phạm vi.";
            if (!it.placeId) return "Có item thiếu placeId.";
            if (!it.orderInDay || it.orderInDay <= 0) return "Có item thiếu orderInDay.";
            if (it.startTime && it.endTime && it.endTime < it.startTime)
                return "Có item có endTime trước startTime.";
        }
        return "";
    };

    const onSubmit = async () => {
        const msg = validateBeforeSubmit();
        if (msg) {
            setError(msg);
            return;
        }
        try {
            setSubmitting(true);
            setError("");
            const res = await CreateItinerary(payload);
            const data = res?.data ?? res ?? {};
            const newId = data.id;
            if (newId) {
                // điều hướng sang trang chi tiết nếu bạn đã có route đó
                navigate(`/itineraries/${newId}`);
            } else {
                // fallback: thông báo
                alert("Tạo lịch trình thành công!");
            }
        } catch (e) {
            console.error(e);
            setError(
                e?.response?.data?.message ||
                "Không tạo được lịch trình. Vui lòng kiểm tra dữ liệu."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Locations cho map (dùng các item đã chọn)
    const mapLocations = items
        .map((x) => x.place)
        .filter(Boolean)
        .map((p) => ({
            id: p.id,
            lat: p.lat,
            lon: p.lon,
            name: p.name,
            rating: p.rating,
            address: p.address,
        }));

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero */}
            <section className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white">
                <div className="container mx-auto px-4 py-14">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                        Tạo lịch trình
                    </h1>
                    <p className="mt-3 text-white/90">
                        Chọn ngày, điểm đến và thêm các hoạt động cho từng ngày.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 md:px-6 py-10">
                {/* Thông báo lỗi */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-2">
                        <InformationCircleIcon className="w-5 h-5 mt-0.5" />
                        <div>{error}</div>
                    </div>
                )}

                {/* Form chung */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* LEFT: form + danh sách item */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tiêu đề
                                    </label>
                                    <input
                                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ví dụ: Quy Nhơn 3N2Đ khám phá biển & ẩm thực"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày bắt đầu
                                    </label>
                                    <div className="relative">
                                        <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                        <input
                                            type="date"
                                            className="w-full pl-9 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày kết thúc
                                    </label>
                                    <div className="relative">
                                        <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                        <input
                                            type="date"
                                            className="w-full pl-9 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số ngày
                                    </label>
                                    <input
                                        disabled
                                        className="w-full rounded-lg border-gray-200 bg-gray-50"
                                        value={dayCount || 0}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bộ chọn địa điểm để thêm item */}
                        {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Thêm hoạt động/địa điểm
                                </h2>
                                <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Điểm đến
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        value={selectedDestination}
                                        onChange={(e) => {
                                            setSelectedDestination(e.target.value);
                                            setSelectedCategory("");
                                            setPlaces([]);
                                            setSelectedPlaceId("");
                                        }}
                                        disabled={loadingDest}
                                    >
                                        {destinations.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Danh mục
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            setPlaces([]);
                                            setSelectedPlaceId("");
                                        }}
                                        disabled={!selectedDestination}
                                    >
                                        <option value="">— Tất cả —</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Địa điểm
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                            placeholder="Lọc theo tên địa điểm..."
                                            value={placeFilter}
                                            onChange={(e) => setPlaceFilter(e.target.value)}
                                        />
                                        <select
                                            className="min-w-[260px] rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                            value={selectedPlaceId}
                                            onChange={(e) => setSelectedPlaceId(e.target.value)}
                                            disabled={loadingPlaces}
                                        >
                                            <option value="">— Chọn địa điểm —</option>
                                            {filteredPlaces.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={addItem}
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
                                    disabled={!selectedPlaceId || !dayCount}
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Thêm vào lịch trình
                                </button>
                            </div>
                        </div> */}

                        {/* Danh sách item theo ngày */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Chi tiết hoạt động theo ngày
                            </h2>

                            {!items.length && (
                                <p className="text-gray-500">
                                    Chưa có hoạt động nào. Hãy chọn địa điểm và bấm{" "}
                                    <b>“Thêm vào lịch trình”</b>.
                                </p>
                            )}

                            {!!items.length && (
                                <div className="space-y-8">
                                    {daysArray.map((d) => {
                                        const dayItems = items
                                            .filter((x) => x.dayNumber === d.value)
                                            .sort((a, b) => (a.orderInDay || 0) - (b.orderInDay || 0));

                                        return (
                                            <div key={d.value} className="border-t pt-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                                                    <h3 className="text-xl font-bold text-gray-800">
                                                        {d.label} <span className="text-gray-400">({d.dateStr})</span>
                                                    </h3>
                                                    <span className="text-sm text-gray-500">
                                                        {dayItems.length} hoạt động
                                                    </span>
                                                </div>

                                                {!dayItems.length ? (
                                                    <p className="text-gray-400">— Chưa có hoạt động —</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {dayItems.map((it) => (
                                                            <div
                                                                key={it._tid}
                                                                className="border border-gray-200 rounded-xl p-4 bg-white/70"
                                                            >
                                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                                    <div className="font-semibold text-gray-800">
                                                                        #{it.orderInDay}. {it.place?.name || it.placeId}
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => moveItem(it._tid, "up")}
                                                                            className="p-2 rounded-lg border hover:bg-gray-50"
                                                                            title="Lên"
                                                                        >
                                                                            <ArrowUpIcon className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => moveItem(it._tid, "down")}
                                                                            className="p-2 rounded-lg border hover:bg-gray-50"
                                                                            title="Xuống"
                                                                        >
                                                                            <ArrowDownIcon className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => removeItem(it._tid)}
                                                                            className="p-2 rounded-lg border hover:bg-red-50 text-red-600"
                                                                            title="Xóa"
                                                                        >
                                                                            <TrashIcon className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="grid md:grid-cols-6 gap-3 mt-3">
                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 mb-1">
                                                                            Ngày
                                                                        </label>
                                                                        <select
                                                                            className="w-full rounded-md border-gray-300"
                                                                            value={it.dayNumber}
                                                                            onChange={(e) => changeItemDay(it._tid, e.target.value)}
                                                                        >
                                                                            {daysArray.map((x) => (
                                                                                <option key={x.value} value={x.value}>
                                                                                    {x.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 mb-1">
                                                                            Thời gian bắt đầu
                                                                        </label>
                                                                        <input
                                                                            type="time"
                                                                            className="w-full rounded-md border-gray-300"
                                                                            value={it.startTime || ""}
                                                                            onChange={(e) =>
                                                                                updateItemField(it._tid, "startTime", e.target.value)
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 mb-1">
                                                                            Thời gian kết thúc
                                                                        </label>
                                                                        <input
                                                                            type="time"
                                                                            className="w-full rounded-md border-gray-300"
                                                                            value={it.endTime || ""}
                                                                            onChange={(e) =>
                                                                                updateItemField(it._tid, "endTime", e.target.value)
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 mb-1">
                                                                            Chi phí (VND)
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            className="w-full rounded-md border-gray-300"
                                                                            value={it.estimatedCost || ""}
                                                                            onChange={(e) =>
                                                                                updateItemField(it._tid, "estimatedCost", e.target.value)
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 mb-1">
                                                                            Phương tiện
                                                                        </label>
                                                                        <select
                                                                            className="w-full rounded-md border-gray-300"
                                                                            value={it.transportMode || ""}
                                                                            onChange={(e) =>
                                                                                updateItemField(it._tid, "transportMode", e.target.value)
                                                                            }
                                                                        >
                                                                            <option value="">—</option>
                                                                            {TRANSPORT_OPTIONS.map((opt) => (
                                                                                <option key={opt} value={opt}>
                                                                                    {opt}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>

                                                                    <div className="md:col-span-2">
                                                                        <label className="block text-xs text-gray-500 mb-1">
                                                                            Ghi chú
                                                                        </label>
                                                                        <input
                                                                            className="w-full rounded-md border-gray-300"
                                                                            placeholder="Ví dụ: checkin sớm, đặt vé trước..."
                                                                            value={it.description || ""}
                                                                            onChange={(e) =>
                                                                                updateItemField(it._tid, "description", e.target.value)
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={onSubmit}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                                {submitting ? "Đang tạo..." : "Tạo lịch trình"}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Map */}
                    {isMapVisible && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="flex items-center justify-between p-4 border-b">
                                        <div className="flex items-center gap-2">
                                            <MapIcon className="w-5 h-5 text-blue-600" />
                                            <div className="font-semibold">Bản đồ</div>
                                        </div>
                                        <button
                                            onClick={() => setIsMapVisible(false)}
                                            className="text-sm text-gray-500 hover:text-red-500"
                                        >
                                            Ẩn
                                        </button>
                                    </div>
                                    <div className="h-[520px]">
                                        <LocationMap locations={mapLocations} hoveredId={null} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {!isMapVisible && (
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={() => setIsMapVisible(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition inline-flex items-center gap-2"
                    >
                        <MapIcon className="w-5 h-5" />
                        Hiển thị bản đồ
                    </button>
                </div>
            )}

            <Footer />
        </div>
    );
}
