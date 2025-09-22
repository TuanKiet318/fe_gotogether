import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import LocationMap from "../components/LocationMap.jsx";
import {
    GetItineraryDetail,
    UpdateItinerary,
    DeleteItinerary,
    AddItineraryItems,
    UpdateItineraryItem,
    MoveItineraryItem,
} from "../service/api.admin.service.jsx";
import {
    CalendarIcon,
    ClockIcon,
    MapIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    PlusIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";

// helper
const toDate = (s) => (s ? new Date(`${s}T00:00:00`) : null);
const fmtDateVN = (s) =>
    s ? new Date(`${s}T00:00:00`).toLocaleDateString("vi-VN") : "";
const tid = () => Math.random().toString(36).slice(2, 10);

// Transport options trợ giúp thêm item
const TRANSPORT_OPTIONS = ["", "WALK", "BIKE", "CAR", "BUS", "TRAIN", "FLIGHT", "BOAT"];

export default function ItineraryDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Itinerary
    const [itin, setItin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingHeader, setSavingHeader] = useState(false);
    const [error, setError] = useState("");

    // Header edit fields
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Item edit local state (key: itemId => partial edits)
    const [editMap, setEditMap] = useState({}); // { [itemId]: { startTime, endTime, description, estimatedCost, transportMode } }
    const [savingItemId, setSavingItemId] = useState(null);

    // Add item form (đơn giản: nhập placeId + chọn ngày và orderInDay auto)
    const [addForm, setAddForm] = useState({
        placeId: "",
        dayNumber: 1,
        startTime: "",
        endTime: "",
        description: "",
        estimatedCost: "",
        transportMode: "",
    });
    const [adding, setAdding] = useState(false);

    // Map
    const [isMapVisible, setIsMapVisible] = useState(true);

    // Load detail
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await GetItineraryDetail(id);
                const data = res?.data ?? res;
                setItin(data);

                setTitle(data.title || "");
                setStartDate(data.startDate || "");
                setEndDate(data.endDate || "");
            } catch (e) {
                console.error(e);
                setError("Không tải được chi tiết lịch trình.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetail();
    }, [id]);

    // Days & grouping
    const daysArray = useMemo(() => {
        if (!itin?.startDate || !itin?.endDate) return [];
        const start = toDate(itin.startDate);
        const end = toDate(itin.endDate);
        if (!start || !end || end < start) return [];
        const days = Math.floor((end - start) / (24 * 3600 * 1000)) + 1;
        return Array.from({ length: days }, (_, i) => {
            const dateStr = new Date(start.getTime() + i * 24 * 3600 * 1000).toLocaleDateString("vi-VN");
            return { value: i + 1, label: `Ngày ${i + 1}`, dateStr };
        });
    }, [itin?.startDate, itin?.endDate]);

    const itemsByDay = useMemo(() => {
        const map = {};
        (itin?.items || []).forEach((it) => {
            map[it.dayNumber] ||= [];
            map[it.dayNumber].push(it);
        });
        Object.keys(map).forEach((d) => {
            map[d].sort((a, b) => (a.orderInDay || 0) - (b.orderInDay || 0));
        });
        return map;
    }, [itin]);

    // Map markers (dùng lat/lng của place)
    const mapLocations = useMemo(() => {
        return (itin?.items || [])
            .map((it) => it.place)
            .filter(Boolean)
            .map((p) => ({
                id: p.id,
                lat: p.lat,
                lng: p.lng, // IMPORTANT: lng, không phải lon
                name: p.name,
                address: p.address,
                rating: p.rating,
            }));
    }, [itin]);

    // Save header (title/startDate/endDate)
    const saveHeader = async () => {
        if (!title.trim()) {
            setError("Tiêu đề không được để trống.");
            return;
        }
        try {
            setSavingHeader(true);
            setError("");
            await UpdateItinerary(id, {
                title: title.trim(),
                startDate,
                endDate,
            });
            setItin((prev) => ({ ...prev, title: title.trim(), startDate, endDate }));
        } catch (e) {
            console.error(e);
            setError("Cập nhật thông tin lịch trình thất bại.");
        } finally {
            setSavingHeader(false);
        }
    };

    // Delete itinerary
    const deleteItinerary = async () => {
        if (!window.confirm("Bạn chắc chắn muốn xóa lịch trình này?")) return;
        try {
            await DeleteItinerary(id);
            navigate("/"); // hoặc /itineraries
        } catch (e) {
            console.error(e);
            alert("Không thể xóa lịch trình.");
        }
    };

    // Helper: update editMap
    const setItemField = (itemId, key, val) => {
        setEditMap((prev) => ({
            ...prev,
            [itemId]: { ...(prev[itemId] || {}), [key]: val },
        }));
    };

    // Save 1 item
    const saveItem = async (dayNumber, item) => {
        const patch = {
            startTime: editMap[item.id]?.startTime ?? item.startTime ?? null,
            endTime: editMap[item.id]?.endTime ?? item.endTime ?? null,
            description: editMap[item.id]?.description ?? item.description ?? null,
            estimatedCost:
                editMap[item.id]?.estimatedCost !== undefined && editMap[item.id]?.estimatedCost !== ""
                    ? Number(editMap[item.id]?.estimatedCost)
                    : item.estimatedCost ?? null,
            transportMode: editMap[item.id]?.transportMode ?? item.transportMode ?? null,
        };

        try {
            setSavingItemId(item.id);
            await UpdateItineraryItem(id, item.id, patch);
            // cập nhật local
            setItin((prev) => ({
                ...prev,
                items: prev.items.map((x) => (x.id === item.id ? { ...x, ...patch } : x)),
            }));
            // clear editMap entry
            setEditMap((m) => {
                const { [item.id]: _, ...rest } = m;
                return rest;
            });
        } catch (e) {
            console.error(e);
            alert("Không thể lưu mục này.");
        } finally {
            setSavingItemId(null);
        }
    };

    // Reorder (move up/down trong cùng day)
    const move = async (dayNumber, itemId, dir) => {
        const dayItems = (itemsByDay[dayNumber] || []).slice();
        const idx = dayItems.findIndex((x) => x.id === itemId);
        if (idx < 0) return;

        const targetIdx = dir === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= dayItems.length) return;

        const current = dayItems[idx];
        const target = dayItems[targetIdx];

        // optimistic: hoán đổi orderInDay
        const currOrder = current.orderInDay;
        const targOrder = target.orderInDay;

        setItin((prev) => ({
            ...prev,
            items: prev.items
                .map((x) =>
                    x.id === current.id
                        ? { ...x, orderInDay: targOrder }
                        : x.id === target.id
                            ? { ...x, orderInDay: currOrder }
                            : x
                )
                .sort((a, b) =>
                    a.dayNumber === b.dayNumber
                        ? (a.orderInDay || 0) - (b.orderInDay || 0)
                        : a.dayNumber - b.dayNumber
                ),
        }));

        try {
            await MoveItineraryItem(id, itemId, dayNumber, targOrder);
        } catch (e) {
            console.error(e);
            alert("Không thể thay đổi thứ tự.");
            // rollback đơn giản: reload detail
            try {
                const res = await GetItineraryDetail(id);
                const data = res?.data ?? res;
                setItin(data);
            } catch { }
        }
    };

    // Add a new item quickly (orderInDay tự next)
    const addOneItem = async () => {
        if (!addForm.placeId) {
            setError("Bạn cần nhập placeId để thêm mục.");
            return;
        }
        const day = Number(addForm.dayNumber || 1);
        const sameDay = (itemsByDay[day] || []).slice().sort((a, b) => a.orderInDay - b.orderInDay);
        const nextOrd = (sameDay.at(-1)?.orderInDay || 0) + 1;

        const payload = [
            {
                placeId: addForm.placeId,
                dayNumber: day,
                orderInDay: nextOrd,
                startTime: addForm.startTime || null,
                endTime: addForm.endTime || null,
                description: addForm.description || null,
                estimatedCost: addForm.estimatedCost ? Number(addForm.estimatedCost) : null,
                transportMode: addForm.transportMode || null,
            },
        ];

        try {
            setAdding(true);
            setError("");
            await AddItineraryItems(id, payload);
            // reload nhanh
            const res = await GetItineraryDetail(id);
            const data = res?.data ?? res;
            setItin(data);
            // reset form
            setAddForm({
                placeId: "",
                dayNumber: day,
                startTime: "",
                endTime: "",
                description: "",
                estimatedCost: "",
                transportMode: "",
            });
        } catch (e) {
            console.error(e);
            setError("Không thể thêm mục. Kiểm tra lại placeId hoặc dữ liệu nhập.");
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="container mx-auto px-4 py-24">
                    <div className="mx-auto max-w-md bg-white border rounded-2xl shadow p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
                        <p className="mt-4 text-gray-600">Đang tải lịch trình...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!itin) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="container mx-auto px-4 py-24">
                    <div className="mx-auto max-w-md bg-white border rounded-2xl shadow p-8 text-center">
                        <div className="text-6xl mb-4">😞</div>
                        <h2 className="text-xl font-semibold mb-2">Không tìm thấy lịch trình</h2>
                        <button
                            onClick={() => navigate("/")}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero */}
            <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 py-14">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">{itin.title}</h1>
                    <p className="mt-2 text-white/90 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        {fmtDateVN(itin.startDate)} → {fmtDateVN(itin.endDate)}
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 md:px-6 py-8">
                {/* Thông báo lỗi */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-2">
                        <InformationCircleIcon className="w-5 h-5 mt-0.5" />
                        <div>{error}</div>
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* LEFT: Info + Items */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header editable */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin chung</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-sm text-gray-600 mb-1">Tiêu đề</label>
                                    <input
                                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Tên lịch trình"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-end gap-2">
                                    <button
                                        onClick={saveHeader}
                                        disabled={savingHeader}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
                                    >
                                        {savingHeader ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                    <button
                                        onClick={deleteItinerary}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                    >
                                        Xóa lịch trình
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add item nhanh */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Thêm hoạt động</h2>
                            </div>

                            <div className="grid md:grid-cols-6 gap-3">
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Place ID</label>
                                    <input
                                        className="w-full rounded-lg border-gray-300"
                                        placeholder="vd: place-kyco"
                                        value={addForm.placeId}
                                        onChange={(e) => setAddForm((f) => ({ ...f, placeId: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Ngày</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300"
                                        value={addForm.dayNumber}
                                        onChange={(e) =>
                                            setAddForm((f) => ({ ...f, dayNumber: Number(e.target.value) }))
                                        }
                                    >
                                        {daysArray.map((d) => (
                                            <option key={d.value} value={d.value}>
                                                {d.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Bắt đầu</label>
                                    <input
                                        type="time"
                                        className="w-full rounded-lg border-gray-300"
                                        value={addForm.startTime}
                                        onChange={(e) => setAddForm((f) => ({ ...f, startTime: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Kết thúc</label>
                                    <input
                                        type="time"
                                        className="w-full rounded-lg border-gray-300"
                                        value={addForm.endTime}
                                        onChange={(e) => setAddForm((f) => ({ ...f, endTime: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Phương tiện</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300"
                                        value={addForm.transportMode}
                                        onChange={(e) =>
                                            setAddForm((f) => ({ ...f, transportMode: e.target.value }))
                                        }
                                    >
                                        {TRANSPORT_OPTIONS.map((t) => (
                                            <option key={t} value={t}>
                                                {t || "—"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Ghi chú</label>
                                    <input
                                        className="w-full rounded-lg border-gray-300"
                                        value={addForm.description}
                                        onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Chi phí (VND)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full rounded-lg border-gray-300"
                                        value={addForm.estimatedCost}
                                        onChange={(e) => setAddForm((f) => ({ ...f, estimatedCost: e.target.value }))}
                                    />
                                </div>

                                <div className="md:col-span-6">
                                    <button
                                        onClick={addOneItem}
                                        disabled={adding}
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        {adding ? "Đang thêm..." : "Thêm vào lịch trình"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Items by day */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Hoạt động theo ngày
                            </h2>

                            {!daysArray.length && (
                                <p className="text-gray-500">Chưa xác định khoảng ngày hợp lệ.</p>
                            )}

                            {daysArray.map((d) => {
                                const dayItems = itemsByDay[d.value] || [];
                                return (
                                    <div className="border-t pt-6 mt-6" key={d.value}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
                                            <h3 className="text-xl font-bold">
                                                {d.label} <span className="text-gray-400">({d.dateStr})</span>
                                            </h3>
                                            <span className="text-sm text-gray-500">{dayItems.length} mục</span>
                                        </div>

                                        {!dayItems.length ? (
                                            <p className="text-gray-400">— Chưa có hoạt động —</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {dayItems.map((it) => {
                                                    const editing = editMap[it.id] || {};
                                                    const show = { ...it, ...editing };

                                                    return (
                                                        <div
                                                            key={it.id}
                                                            className="border border-gray-200 rounded-xl p-4 bg-white/70"
                                                        >
                                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                                <div className="font-semibold">
                                                                    #{it.orderInDay}. {it.place?.name || it.placeId}
                                                                    {it.place?.address && (
                                                                        <span className="ml-2 text-gray-500">— {it.place.address}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => move(d.value, it.id, "up")}
                                                                        className="p-2 rounded-lg border hover:bg-gray-50"
                                                                        title="Lên"
                                                                    >
                                                                        <ArrowUpIcon className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => move(d.value, it.id, "down")}
                                                                        className="p-2 rounded-lg border hover:bg-gray-50"
                                                                        title="Xuống"
                                                                    >
                                                                        <ArrowDownIcon className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="grid md:grid-cols-6 gap-3 mt-3">
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">
                                                                        Bắt đầu
                                                                    </label>
                                                                    <input
                                                                        type="time"
                                                                        className="w-full rounded-md border-gray-300"
                                                                        value={show.startTime || ""}
                                                                        onChange={(e) =>
                                                                            setItemField(it.id, "startTime", e.target.value)
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">
                                                                        Kết thúc
                                                                    </label>
                                                                    <input
                                                                        type="time"
                                                                        className="w-full rounded-md border-gray-300"
                                                                        value={show.endTime || ""}
                                                                        onChange={(e) =>
                                                                            setItemField(it.id, "endTime", e.target.value)
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
                                                                        value={show.estimatedCost ?? ""}
                                                                        onChange={(e) =>
                                                                            setItemField(it.id, "estimatedCost", e.target.value)
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">
                                                                        Phương tiện
                                                                    </label>
                                                                    <select
                                                                        className="w-full rounded-md border-gray-300"
                                                                        value={show.transportMode || ""}
                                                                        onChange={(e) =>
                                                                            setItemField(it.id, "transportMode", e.target.value)
                                                                        }
                                                                    >
                                                                        {TRANSPORT_OPTIONS.map((t) => (
                                                                            <option key={t} value={t}>
                                                                                {t || "—"}
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
                                                                        value={show.description || ""}
                                                                        onChange={(e) =>
                                                                            setItemField(it.id, "description", e.target.value)
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 flex items-center gap-2">
                                                                <button
                                                                    onClick={() => saveItem(d.value, it)}
                                                                    disabled={savingItemId === it.id}
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-60"
                                                                >
                                                                    <PencilSquareIcon className="w-4 h-4" />
                                                                    {savingItemId === it.id ? "Đang lưu..." : "Lưu mục này"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT: Map */}
                    {isMapVisible && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
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
