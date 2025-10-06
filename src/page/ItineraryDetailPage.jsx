import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { GetItineraryDetail } from "../service/api.admin.service";

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

function generateDays(startDate, endDate, items) {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];

  for (
    let d = new Date(start), i = 1;
    d <= end;
    d.setDate(d.getDate() + 1), i++
  ) {
    const dateStr = d.toISOString().split("T")[0];
    const dayItems = (items || [])
      .filter((it) => it.date === dateStr || it.dayNumber === i)
      .map((it, idx) => ({
        id: it.id || `item-${Math.random()}`,
        placeId: it.placeId,
        placeName: it.placeName || "Địa điểm không xác định",
        placeAddress: it.placeAddress || "",
        placeImage: it.placeImage || "https://via.placeholder.com/400x250",
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
      }));

    days.push({ dayNumber: i, date: dateStr, items: dayItems });
  }
  return days;
}

/* ---------- PLACE CARD ---------- */
function PlaceCard({ item, isLast }) {
  return (
    <div className="relative">
      <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div className="relative h-52">
          <img
            src={item.placeImage}
            alt={item.placeName}
            className="w-full h-full object-cover"
          />
          {item.startTime && item.endTime && (
            <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm">
              <Clock size={14} className="text-gray-600" />
              <span>
                {item.startTime} - {item.endTime}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <h4 className="text-lg font-semibold text-gray-800 mb-1">
            {item.placeName}
          </h4>

          {item.placeRating > 0 && (
            <div className="flex items-center gap-2 text-sm mb-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={14} fill="currentColor" />
                <span>{item.placeRating}</span>
              </div>
              {item.placeReviews > 0 && (
                <div className="flex items-center gap-1 text-gray-500">
                  <MessageSquare size={14} />
                  <span>{item.placeReviews} đánh giá</span>
                </div>
              )}
            </div>
          )}

          {item.placeAddress && (
            <div className="flex items-start gap-2 text-gray-600 text-sm mb-3">
              <MapPin size={16} className="mt-0.5 text-gray-500" />
              <span>{item.placeAddress}</span>
            </div>
          )}

          {item.description && (
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
            {item.estimatedCost > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <DollarSign size={16} />
                <span>{item.estimatedCost.toLocaleString()} đ</span>
              </div>
            )}
            {item.transportMode && (
              <div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-sm">
                <span>{transportModeIcons[item.transportMode]}</span>
                <span>{transportModeLabels[item.transportMode]}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isLast && (
        <div className="flex justify-center py-3">
          <Navigation size={18} className="text-gray-400" />
        </div>
      )}
    </div>
  );
}

/* ---------- DAY SECTION ---------- */
function DaySection({ day }) {
  const totalCost = day.items.reduce(
    (sum, i) => sum + (i.estimatedCost || 0),
    0
  );

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-800">
          Ngày {day.dayNumber} • {day.date}
        </h2>
        <span className="text-gray-500 text-sm">
          Tổng chi phí: {totalCost.toLocaleString()} đ
        </span>
      </div>

      {day.items.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 border rounded-xl text-gray-500">
          <MapPin size={28} className="mx-auto mb-2 text-gray-400" />
          Chưa có địa điểm nào cho ngày này
        </div>
      ) : (
        <div className="space-y-6">
          {day.items.map((item, idx) => (
            <PlaceCard
              key={item.id}
              item={item}
              isLast={idx === day.items.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- MAIN COMPONENT ---------- */
export default function ItineraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await GetItineraryDetail(id);
        const data = res?.data || res;
        const days = generateDays(
          data.startDate,
          data.endDate,
          data.items || []
        );
        setItinerary({
          id: data.id,
          title: data.title,
          destination: data.destination?.name || data.destinationName,
          startDate: data.startDate,
          endDate: data.endDate,
          days,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gray-500" size={40} />
      </div>
    );

  if (!itinerary)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <p>Không tìm thấy lịch trình.</p>
        <button
          onClick={() => navigate("/trip-list")}
          className="mt-4 px-4 py-2 rounded-lg border hover:bg-gray-100"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );

  const totalCost = itinerary.days.reduce(
    (sum, d) => sum + d.items.reduce((s, i) => s + (i.estimatedCost || 0), 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/trip-list")}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={18} /> <span>Quay lại</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-800 truncate">
            {itinerary.title}
          </h1>
        </div>
      </header>

      {/* INFO */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border shadow-sm p-5 mb-8">
          <div className="flex flex-wrap gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gray-500" />
              <span>{itinerary.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-500" />
              <span>
                {itinerary.startDate} → {itinerary.endDate}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-gray-500" />
              <span>{totalCost.toLocaleString()} đ</span>
            </div>
          </div>
        </div>

        {itinerary.days.map((day) => (
          <DaySection key={day.dayNumber} day={day} />
        ))}
      </main>
    </div>
  );
}
