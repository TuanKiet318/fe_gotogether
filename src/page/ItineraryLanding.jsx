// src/pages/ItineraryLanding.jsx
import React, { useMemo, useState } from "react";
import {
    MapPin, Calendar, Clock, Wallet, Star, Navigation, ChevronDown,
    Share2, Camera, Info, HeartHandshake, MessageCircleMore
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LeafletMap } from "../components/LeafletMap";
import { cloneItinerary } from "../service/tripService";

/* ---------------------- Utils ---------------------- */
const vnd = (v) => (Number(v) || 0).toLocaleString("vi-VN") + " đ";

function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
const formatDistance = (a, b) => {
    if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return null;
    const d = haversineKm(+a.lat, +a.lng, +b.lat, +b.lng);
    if (!isFinite(d)) return null;
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
};

/* ---------------------- UI bits ---------------------- */
const Chip = ({ children }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm border border-slate-200">
        {children}
    </span>
);

const MetaPill = ({ icon: Icon, children }) => (
    <span className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border bg-white/90 backdrop-blur border-slate-200 shadow">
        <Icon size={16} className="text-slate-500" />
        <span className="font-medium text-slate-700">{children}</span>
    </span>
);

function Gallery({ photos = [] }) {
    const a = photos[0] || "https://quynhon.binhdinh.gov.vn/upload/105285/20230906/317d87c43e445667a2583a74106fc130trung_luong_nguyen_an_khanh_304608393_d3638.jpg";
    const b = photos[1] || "https://image.vietgoing.com/editor/image_olq1638950902.jpg";
    const c = photos[2] || "https://static.vinwonders.com/production/Banner-banh-hoi-chao-long-Quy-Nhon.jpg";
    return (
        <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="col-span-3 lg:col-span-2 rounded-2xl overflow-hidden">
                <img src={a} alt="" className="w-full h-[44vh] lg:h-[56vh] object-cover" />
            </div>
            <div className="hidden lg:flex flex-col gap-3">
                <div className="relative rounded-2xl overflow-hidden">
                    <img src={b} alt="" className="w-full h-[27vh] object-cover" />
                </div>
                <div className="relative rounded-2xl overflow-hidden">
                    <img src={c} alt="" className="w-full h-[27vh] object-cover" />
                    <button className="absolute right-3 bottom-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 text-slate-700 text-sm shadow">
                        <Camera size={16} /> Xem tất cả ảnh
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------------------- Main ---------------------- */
export default function ItineraryLanding({ itinerary: propItinerary, sourceId }) {
    const navigate = useNavigate();

    // ------- Fake data Quy Nhơn -------
    const demo = useMemo(() => ({
        title: "Lịch trình Quy Nhơn 3 ngày — Cân bằng Văn hoá & Ẩm thực",
        destination: "Quy Nhơn, Việt Nam",
        tags: ["3 ngày", "16 địa điểm", "Tham quan", "Ẩm thực", "Văn hoá & Nghệ thuật", "Nightlife"],
        heroPhotos: [
            "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
        ],
        overview:
            "Quy Nhơn là thành phố biển hiền hòa của Bình Định, nổi tiếng với bờ cát cong ôm vịnh, những dải đá kỳ thú và di sản Chăm Pa. Lịch trình 3 ngày này cân bằng giữa khám phá thiên nhiên (Kỳ Co, Eo Gió), văn hoá – lịch sử (Tháp Đôi, Bảo tàng Quang Trung) và ẩm thực địa phương (bánh xèo tôm nhảy, bún chả cá, hải sản tươi). Bạn sẽ có thời gian dạo biển hoàng hôn, ngắm bình minh trên Eo Gió, len lỏi các quán cà phê xinh xắn trong phố, và thưởng thức hải sản ở làng chài — tất cả với nhịp điệu thong thả, tối ưu cung đường di chuyển.",
        notes: [
            "Sân bay Phù Cát cách trung tâm ~30–35 km; có shuttle bus/taxi về trung tâm.",
            "Phương tiện gợi ý: thuê xe máy hoặc taxi; đi Kỳ Co/Eo Gió nên xuất phát sớm để tránh nắng.",
            "Ẩm thực nổi bật: bánh xèo tôm nhảy, bún chả cá, tré rơm, ốc các loại; hải sản nên chọn quán gần làng chài.",
        ],
        author: {
            name: "Rose",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
            bio: "Yêu biển và ẩm thực miền Trung; chia sẻ hành trình khám phá Quy Nhơn theo nhịp chậm.",
            joined: "2023",
        },
        startDate: "2025-04-18",
        endDate: "2025-04-20",
        days: [
            {
                dayNumber: 1,
                date: "2025-04-18",
                title: "Phố biển & di sản Chăm",
                items: [
                    {
                        id: "1-1",
                        category: "Ăn uống",
                        placeName: "Bánh xèo tôm nhảy",
                        placeAddress: "Trần Bình Trọng, Quy Nhơn",
                        placeImage:
                            "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
                        startTime: "07:00",
                        endTime: "08:00",
                        estimatedCost: 60000,
                        lat: 13.7706,
                        lng: 109.2193,
                        description:
                            "Bữa sáng đặc trưng Quy Nhơn: bánh xèo tôm nhảy giòn rụm, ăn kèm rau sống và nước chấm chua ngọt.",
                        placeRating: 4.8,
                        placeReviews: 1200,
                        orderInDay: 1,
                    },
                    {
                        id: "1-2",
                        category: "Tham quan",
                        placeName: "Tháp Đôi",
                        placeAddress: "110A Trần Hưng Đạo, Quy Nhơn",
                        placeImage:
                            "https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1200&auto=format&fit=crop",
                        startTime: "09:00",
                        endTime: "10:30",
                        estimatedCost: 40000,
                        lat: 13.7767,
                        lng: 109.2236,
                        description:
                            "Cụm tháp Chăm Pa ngay trung tâm thành phố; điểm check-in kiến trúc & lịch sử thú vị.",
                        placeRating: 4.6,
                        placeReviews: 3200,
                        orderInDay: 2,
                    },
                ],
            },
            { dayNumber: 2, date: "2025-04-19", title: "Kỳ Co – Eo Gió • Biển & gió", items: [] },
            { dayNumber: 3, date: "2025-04-20", title: "Ghềnh Ráng – Cafe biển & hải sản", items: [] },
        ],
    }), []);

    const itinerary = propItinerary || demo;

    /* -------- Derived -------- */
    const days = itinerary?.days || [];
    const metaDays = days.length;
    const metaDates =
        itinerary?.startDate && itinerary?.endDate
            ? `${itinerary.startDate} → ${itinerary.endDate}`
            : null;

    // ✅ totalCost tính SAU khi có days
    const totalCost = useMemo(
        () =>
            days.reduce(
                (sum, d) => sum + d.items.reduce((s, i) => s + (Number(i.estimatedCost) || 0), 0),
                0
            ),
        [days]
    );

    // ✅ mapPlaces cho LeafletMap
    const mapPlaces = useMemo(
        () =>
            days
                .flatMap((d) =>
                    d.items.map((i) => ({
                        id: i.id,
                        name: i.placeName,
                        placeAddress: i.placeAddress,
                        lat: i.lat,
                        lng: i.lng,
                        dayNumber: d.dayNumber,
                        orderInDay: i.orderInDay || 0,
                        image: i.placeImage,
                        startTime: i.startTime,
                        endTime: i.endTime,
                        estimatedCost: i.estimatedCost,
                    }))
                )
                .filter((p) => p.lat && p.lng),
        [days]
    );

    /* Tính khoảng ngày mặc định nếu thiếu start/end */
    const computedRange = useMemo(() => {
        if (itinerary?.startDate && itinerary?.endDate) {
            return { start: itinerary.startDate, end: itinerary.endDate };
        }
        if (days?.length > 0 && days[0]?.date) {
            const start = days[0].date;
            const end = days[days.length - 1].date || days[0].date;
            return { start, end };
        }
        const today = new Date();
        const start = today.toISOString().slice(0, 10);
        const end = new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10);
        return { start, end };
    }, [itinerary?.startDate, itinerary?.endDate, days]);

    const [cloning, setCloning] = useState(false);

    const handleCustomize = async () => {
        if (!sourceId) {
            alert("Thiếu sourceId của lịch trình để clone.");
            return;
        }
        try {
            setCloning(true);
            const body = {
                title: (itinerary?.title ? `${itinerary.title} (bản của tôi)` : "Lịch trình (bản của tôi)"),
                startDate: computedRange.start,
                endDate: computedRange.end,
                includeItems: true,
                trimItemsExceedingNewRange: true
            };

            // Dùng axios instance qua service
            const newId = await cloneItinerary(sourceId, body);

            if (!newId) throw new Error("Clone thành công nhưng không nhận được ID mới.");
            navigate(`/itinerary-editor/${newId}`);
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || e.message || "Không thể clone lịch trình. Vui lòng thử lại.");
        } finally {
            setCloning(false);
        }
    };

    /* -------- Local UI state -------- */
    const [collapseDay, setCollapseDay] = useState({});

    /* =================================================== */
    return (
        <div className="min-h-screen bg-white">
            {/* ====== Title & tags ====== */}
            <div className="max-w-6xl mx-auto px-4 pt-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl md:text-[40px] font-black tracking-tight text-slate-900 leading-tight">
                        {itinerary?.title}
                    </h1>
                    <button className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-slate-50">
                        <Share2 size={18} /> Chia sẻ
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                    {(itinerary?.tags || []).map((t) => (
                        <Chip key={t}>{t}</Chip>
                    ))}
                </div>

                {/* ====== Gallery ====== */}
                <Gallery photos={itinerary?.heroPhotos} />
            </div>

            {/* ====== Tabs ====== */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b mt-6">
                <div className="max-w-6xl mx-auto px-4">
                    <nav className="flex items-center gap-6 h-12">
                        {[
                            { id: "overview", label: "Tổng quan" },
                            { id: "map", label: "Bản đồ" },
                            { id: "itinerary", label: "Lịch trình" },
                            { id: "comments", label: "Bình luận" },
                        ].map((t) => (
                            <a key={t.id} href={`#${t.id}`} className="text-slate-700 hover:text-slate-900 font-medium">
                                {t.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            {/* ====== Main content ====== */}
            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-8">
                {/* ------------ LEFT ------------ */}
                <div className="space-y-8">
                    {/* Overview */}
                    <section id="overview" className="scroll-mt-20">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">Tổng quan</h2>
                        <div className="rounded-2xl border bg-white p-5">
                            <p className="text-slate-700 leading-relaxed">{demo?.overview}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <MetaPill icon={Calendar}>{metaDates || "Linh hoạt"}</MetaPill>
                                <MetaPill icon={Clock}>{metaDays} ngày</MetaPill>
                                <MetaPill icon={Wallet}>Ngân sách ~ {vnd(totalCost)}</MetaPill>
                            </div>
                        </div>
                    </section>

                    {/* Notes */}
                    <section className="scroll-mt-20">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                            Ghi chú quan trọng trước chuyến đi
                        </h2>
                        <div className="rounded-2xl border bg-white p-5">
                            <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                {(demo?.notes || []).map((n, idx) => (
                                    <li key={idx}>{n}</li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Map */}
                    <section id="map" className="scroll-mt-20">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">Bản đồ</h2>
                        <div className="rounded-2xl border bg-white overflow-hidden">
                            <div className="h-[480px]">
                                <LeafletMap places={mapPlaces} />
                            </div>
                        </div>
                    </section>

                    {/* Itinerary */}
                    <section id="itinerary" className="scroll-mt-20">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Lịch trình</h2>

                        <div className="space-y-6">
                            {days.map((day) => {
                                const subtotal = day.items.reduce(
                                    (s, i) => s + (Number(i.estimatedCost) || 0),
                                    0
                                );
                                const collapsed = !!collapseDay[day.dayNumber];

                                return (
                                    <div key={day.dayNumber} className="rounded-2xl border bg-white">
                                        {/* Day header */}
                                        <button
                                            onClick={() =>
                                                setCollapseDay((p) => ({
                                                    ...p,
                                                    [day.dayNumber]: !p[day.dayNumber],
                                                }))
                                            }
                                            className="w-full flex items-center justify-between gap-3 px-5 py-3 border-b"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
                                                    Ngày {day.dayNumber}
                                                </span>
                                                <span className="font-semibold text-slate-900">
                                                    {day.title || `Kế hoạch cho ${day.date}`}
                                                </span>
                                                <span className="text-slate-500 text-sm">({day.date})</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Chi phí: {vnd(subtotal)}
                                                </span>
                                                <ChevronDown size={18} className={`transition ${collapsed ? "-rotate-90" : ""}`} />
                                            </div>
                                        </button>

                                        {/* Day body */}
                                        {!collapsed && (
                                            <div className="p-5 space-y-5">
                                                {day.items.length === 0 && (
                                                    <div className="text-sm text-slate-500">
                                                        Chưa có địa điểm cho ngày này.
                                                    </div>
                                                )}

                                                {day.items.map((it, idx) => (
                                                    <div key={it.id} className="rounded-xl border overflow-hidden">
                                                        <div className="grid grid-cols-1 md:grid-cols-[1fr,320px]">
                                                            {/* left info */}
                                                            <div className="p-4 md:p-5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-sm grid place-content-center font-bold">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                                        {it.placeName}
                                                                    </h3>
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                                                                    <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                                                        {it.category || "Địa điểm"}
                                                                    </span>
                                                                    {it.placeRating ? (
                                                                        <span className="inline-flex items-center gap-1 text-slate-700">
                                                                            <Star size={14} className="fill-amber-400 text-amber-400" />
                                                                            {it.placeRating}{" "}
                                                                            <span className="text-slate-400">
                                                                                ({it.placeReviews || 0} đánh giá)
                                                                            </span>
                                                                        </span>
                                                                    ) : null}
                                                                </div>

                                                                {it.placeAddress && (
                                                                    <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                                                                        <MapPin size={16} className="text-slate-400" />
                                                                        {it.placeAddress}
                                                                    </div>
                                                                )}

                                                                {(it.startTime || it.endTime) && (
                                                                    <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                                                                        <Clock size={16} className="text-slate-400" />
                                                                        {`${it.startTime || ""}${it.endTime ? ` - ${it.endTime}` : ""}`}
                                                                    </div>
                                                                )}

                                                                {it.estimatedCost != null && (
                                                                    <div className="mt-1 flex items-center gap-1.5 text-sm text-emerald-700">
                                                                        <Wallet size={16} />
                                                                        {vnd(it.estimatedCost)}
                                                                    </div>
                                                                )}

                                                                {it.description && (
                                                                    <div className="mt-3 text-slate-700 text-sm leading-relaxed">
                                                                        {it.description}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* right image */}
                                                            <div className="relative h-[220px] md:h-full">
                                                                <img
                                                                    src={
                                                                        it.placeImage ||
                                                                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
                                                                    }
                                                                    alt={it.placeName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* distance to next */}
                                                        {idx < day.items.length - 1 && (() => {
                                                            const next = day.items[idx + 1];
                                                            const dist = formatDistance(it, next);
                                                            return (
                                                                <div className="relative flex items-center my-3 px-4">
                                                                    <div
                                                                        className="h-px w-full"
                                                                        style={{
                                                                            background:
                                                                                "repeating-linear-gradient(90deg, #e5e7eb, #e5e7eb 8px, transparent 8px, transparent 16px)",
                                                                        }}
                                                                    />
                                                                    <div className="absolute left-1/2 -translate-x-1/2 -top-3.5 px-2 py-1 rounded-full border text-[11px] shadow-sm flex items-center gap-1 bg-white">
                                                                        <Navigation size={14} className="text-slate-400" />
                                                                        <span>{dist ? `~ ${dist}` : "Khoảng cách: N/A"}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Comments (placeholder) */}
                    <section id="comments" className="scroll-mt-20">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                            Bình luận
                        </h2>
                        <div className="rounded-2xl border bg-white p-5 text-slate-600 text-sm">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-slate-50 text-slate-700">
                                <MessageCircleMore size={16} /> Sắp ra mắt
                            </div>
                            <p className="mt-3">
                                Bạn có thể giả lập bình luận ở đây hoặc tích hợp hệ thống bình luận thật.
                            </p>
                        </div>
                    </section>
                </div>

                {/* ------------ RIGHT (Sidebar) ------------ */}
                <aside className="space-y-6">
                    {/* Customize CTA */}
                    <div className="rounded-2xl border bg-white p-5">
                        <p className="text-slate-700">
                            Nhấn <b>"Tùy chỉnh lịch trình"</b> để cá nhân hoá và lên kế hoạch nhanh chóng!
                        </p>
                        <button
                            onClick={handleCustomize}
                            disabled={cloning}
                            className="mt-4 w-full h-11 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold shadow"
                        >
                            {cloning ? "Đang tạo bản sao..." : "Tùy chỉnh lịch trình"}
                        </button>
                    </div>

                    {/* Author card
                    <div className="rounded-2xl border bg-white p-5 text-center">
                        <img
                            src={itinerary?.author?.avatar}
                            alt={itinerary?.author?.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto"
                        />
                        <div className="mt-3 font-bold text-slate-900">{itinerary?.author?.name}</div>
                        <div className="text-xs text-slate-500">Tham gia {itinerary?.author?.joined}</div>
                        <p className="mt-3 text-sm text-slate-700">{itinerary?.author?.bio}</p>
                        <a href="#" className="mt-3 inline-flex items-center gap-2 text-rose-600 hover:underline text-sm">
                            <Info size={14} /> Đọc thêm
                        </a>
                    </div> */}

                    {/* Quick facts */}
                    <div className="rounded-2xl border bg-white p-5">
                        <h3 className="text-base font-bold text-slate-900">Thông tin nhanh</h3>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                            <div className="bg-slate-50 rounded-lg p-3 border">
                                <div className="text-slate-500">Thời lượng</div>
                                <div className="font-semibold">{metaDays} ngày</div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 border">
                                <div className="text-slate-500">Ngân sách</div>
                                <div className="font-semibold text-emerald-700">{vnd(totalCost)}</div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 border col-span-2">
                                <div className="text-slate-500">Thời gian</div>
                                <div className="font-semibold">{metaDates || "Linh hoạt"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="rounded-2xl border bg-white p-5">
                        <div className="flex items-center gap-2 text-slate-700">
                            <HeartHandshake size={18} /> Cảm ơn bạn đã ủng hộ tác giả nội dung độc lập!
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
