import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Navigation,
  Star,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Share2,
  Printer,
  AlertCircle,
} from "lucide-react";
import { GetItineraryDetail } from "../service/api.admin.service";

// Optional: use framer-motion if your project already has it installed.
// If not installed, the component still works (we fallback to plain div).
let Motion;
try {
  // eslint-disable-next-line global-require
  const { motion } = require("framer-motion");
  Motion = motion;
} catch {
  Motion = {
    div: (p) => <div {...p} />,
    section: (p) => <section {...p} />,
  };
}

/* ---------- ICON MAPS ---------- */
const transportModeIcons = {
  WALK: "🚶",
  CAR: "🚗",
  BUS: "🚌",
  TRAIN: "🚆",
  PLANE: "✈️",
  BIKE: "🚴",
};
const transportModeLabels = {
  WALK: "Đi bộ",
  CAR: "Xe hơi",
  BUS: "Xe buýt",
  TRAIN: "Tàu hỏa",
  PLANE: "Máy bay",
  BIKE: "Xe đạp",
};

/* ---------- UTILS ---------- */
function generateDays(startDate, endDate, items) {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const out = [];

  for (let d = new Date(start), i = 1; d <= end; d.setDate(d.getDate() + 1), i++) {
    const dateStr = d.toISOString().split("T")[0];
    const dayItems = (items || [])
      .filter((it) => it.date === dateStr || it.dayNumber === i)
      .map((it, idx) => ({
        id: it.id || `item-${i}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        placeId: it.placeId,
        placeName: it.placeName || "Địa điểm không xác định",
        placeAddress: it.placeAddress || "",
        placeImage:
          it.placeImage ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
        placeDescription: it.placeDescription || "",
        placeRating: it.placeRating || 0,
        placeReviews: it.placeReviews || 0,
        dayNumber: it.dayNumber || i,
        orderInDay: it.orderInDay || idx + 1,
        startTime: it.startTime || "",
        endTime: it.endTime || "",
        description: it.description || "",
        estimatedCost: it.estimatedCost || 0,
        transportMode: it.transportMode || null,
        mapsUrl:
          it.mapsUrl ||
          (it.placeAddress
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${it.placeName} ${it.placeAddress}`
            )}`
            : null),
      }));

    out.push({ dayNumber: i, date: dateStr, items: dayItems });
  }
  return out;
}

const currency = (v) =>
  (v ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " đ";

const fmtDate = (iso) => {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
};

/* ---------- SKELETONS ---------- */
function Line({ w = "w-24" }) {
  return <div className={`h-3 ${w} bg-gray-200/70 rounded-md animate-pulse`} />;
}
function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="h-52 bg-gray-100 animate-pulse" />
      <div className="p-5 space-y-3">
        <Line w="w-3/5" />
        <Line w="w-4/5" />
        <div className="flex gap-3 pt-2">
          <Line w="w-20" />
          <Line w="w-28" />
        </div>
      </div>
    </div>
  );
}

/* ---------- SUBCOMPONENTS ---------- */
function EmptyDay() {
  return (
    <div className="text-center py-12 bg-white/60 border rounded-2xl text-gray-500">
      <MapPin size={28} className="mx-auto mb-2 text-gray-400" />
      Chưa có địa điểm nào cho ngày này
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs">
      {children}
    </span>
  );
}

function PlaceCard({ item, isLast }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="relative"
    >
      <div className="group bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur border rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div className="relative h-52">
          <img
            src={item.placeImage}
            alt={item.placeName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          {(item.startTime || item.endTime) && (
            <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm">
              <Clock size={14} className="text-gray-600" />
              <span>
                {item.startTime || "?"} {item.endTime ? `- ${item.endTime}` : ""}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <h4 className="text-lg font-semibold text-gray-900">{item.placeName}</h4>
            {item.mapsUrl && (
              <a
                href={item.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                <Navigation size={16} /> Chỉ đường
              </a>
            )}
          </div>

          {(item.placeRating > 0 || item.placeReviews > 0) && (
            <div className="flex items-center gap-3 text-sm mt-1 mb-2">
              {item.placeRating > 0 && (
                <div className="inline-flex items-center gap-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-gray-700">{item.placeRating}</span>
                </div>
              )}
              {item.placeReviews > 0 && (
                <div className="inline-flex items-center gap-1 text-gray-500">
                  <MessageSquare size={14} />
                  <span>{item.placeReviews} đánh giá</span>
                </div>
              )}
            </div>
          )}

          {item.placeAddress && (
            <div className="flex items-start gap-2 text-gray-600 text-sm mb-3">
              <MapPin size={16} className="mt-0.5 text-gray-400" />
              <span>{item.placeAddress}</span>
            </div>
          )}

          {item.description && (
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">{item.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
            {item.estimatedCost > 0 && (
              <Badge>
                <DollarSign size={14} />
                <span>{currency(item.estimatedCost)}</span>
              </Badge>
            )}
            {item.transportMode && (
              <Badge>
                <span>{transportModeIcons[item.transportMode]}</span>
                <span>{transportModeLabels[item.transportMode]}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {!isLast && (
        <div className="flex justify-center py-3">
          <Navigation size={18} className="text-gray-300" />
        </div>
      )}
    </Motion.div>
  );
}

function DaySection({ day }) {
  const totalCost = useMemo(
    () => day.items.reduce((sum, i) => sum + (i.estimatedCost || 0), 0),
    [day.items]
  );

  return (
    <Motion.section
      id={`day-${day.dayNumber}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-12 scroll-mt-28"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">
          Ngày {day.dayNumber} • {fmtDate(day.date)}
        </h2>
        <span className="text-gray-600 text-sm">Tổng chi phí: {currency(totalCost)}</span>
      </div>

      {day.items.length === 0 ? (
        <EmptyDay />
      ) : (
        <div className="space-y-6">
          {day.items
            .sort((a, b) => (a.orderInDay || 0) - (b.orderInDay || 0))
            .map((item, idx) => (
              <PlaceCard key={item.id} item={item} isLast={idx === day.items.length - 1} />
            ))}
        </div>
      )}
    </Motion.section>
  );
}

/* ---------- MAIN ---------- */
export default function ItineraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await GetItineraryDetail(id);
        const data = res?.data || res;

        const days = generateDays(data.startDate, data.endDate, data.items || []);
        setItinerary({
          id: data.id,
          title: data.title,
          destination: data.destination?.name || data.destinationName || "Chuyến đi",
          startDate: data.startDate,
          endDate: data.endDate,
          days,
        });
      } catch (err) {
        console.error(err);
        setError("Không tải được lịch trình. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const totalCost = useMemo(() => {
    if (!itinerary) return 0;
    return itinerary.days.reduce(
      (sum, d) => sum + d.items.reduce((s, i) => s + (i.estimatedCost || 0), 0),
      0
    );
  }, [itinerary]);

  const heroImage =
    itinerary?.days?.[0]?.items?.[0]?.placeImage ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop";

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: itinerary?.title || "Lịch trình",
          text: `${itinerary?.destination} • ${fmtDate(itinerary?.startDate)} → ${fmtDate(
            itinerary?.endDate
          )}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Đã sao chép link!");
      }
    } catch {
      /* ignore */
    }
  };

  const onPrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-3">
              <div className="rounded-2xl border bg-white/60 p-4">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white border rounded-2xl p-6 text-center">
          <AlertCircle className="mx-auto text-amber-500" size={36} />
          <h3 className="mt-3 text-lg font-semibold text-gray-900">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mt-1">{error || "Không tìm thấy lịch trình."}</p>
          <button
            onClick={() => navigate("/trip-list")}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={18} /> Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* HERO */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Cover"
            className="w-full h-[32vh] md:h-[40vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
        </div>

        {/* HEADER */}
        <header className="relative bg-transparent">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate("/trip-list")}
              className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border"
            >
              <ArrowLeft size={18} /> <span>Quay lại</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onShare}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white/80 backdrop-blur text-gray-800 hover:bg-white"
                title="Chia sẻ"
              >
                <Share2 size={16} /> Chia sẻ
              </button>
              <button
                onClick={onPrint}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white/80 backdrop-blur text-gray-800 hover:bg-white"
                title="In"
              >
                <Printer size={16} /> In
              </button>
            </div>
          </div>
        </header>

        {/* HERO CONTENT */}
        <div className="relative max-w-6xl mx-auto px-4 pb-6">
          <div className="mt-[14vh] md:mt-[18vh] w-full md:w-[72%]">
            <Motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white/80 backdrop-blur border rounded-2xl p-4 md:p-6 shadow-sm"
            >
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {itinerary.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-500" />
                  <span>{itinerary.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-500" />
                  <span>
                    {fmtDate(itinerary.startDate)} → {fmtDate(itinerary.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-gray-500" />
                  <span>{currency(totalCost)}</span>
                </div>
              </div>
            </Motion.div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTENT */}
        <div className="lg:col-span-9">
          {itinerary.days.map((day) => (
            <DaySection key={day.dayNumber} day={day} />
          ))}
        </div>

        {/* SIDEBAR: DAY NAV */}
        <aside className="lg:col-span-3 print:hidden">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Đi nhanh tới ngày</h3>
              <nav className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                {itinerary.days.map((d) => (
                  <a
                    key={d.dayNumber}
                    href={`#day-${d.dayNumber}`}
                    className="group relative overflow-hidden rounded-xl border bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="px-3 py-2">
                      <div className="text-xs text-gray-500">Ngày {d.dayNumber}</div>
                      <div className="text-sm font-medium text-gray-800">{fmtDate(d.date)}</div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gray-200 to-gray-100 group-hover:from-gray-300 group-hover:to-gray-200" />
                  </a>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl border bg-white/70 backdrop-blur p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Mẹo</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Nhấn “Chỉ đường” để mở Google Maps cho từng địa điểm.</li>
                <li>• Dùng mục “Đi nhanh tới ngày” để điều hướng nhanh.</li>
                <li>• Bấm “In” để xuất lịch trình ra PDF.</li>
              </ul>
            </div>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="py-10 text-center text-sm text-gray-500">
        Được tạo bởi Travel Planner • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
