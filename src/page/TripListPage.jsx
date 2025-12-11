// src/pages/MyItinerariesPage.jsx
import React, { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  MoreVertical,
  User,
  CalendarDays,
  MapPin,
  Trash2,
  PlusCircle,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";

/* API */
import { listMyItineraries } from "../service/tripService";
import { DeleteItinerary as apiDeleteItinerary } from "../service/api.admin.service.jsx";

/* Utils */
const formatDateVN = (dateString) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const calculateDuration = (startDate, endDate) => {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return `${diff} ngày`;
};

/* ---------------------------- Card Component ---------------------------- */
function ItineraryCard({ trip, onDelete }) {
  return (
    <Link
      to={`/itinerary-editor/${trip.id}`}
      className="group bg-white rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={
            trip.coverImage ||
            trip.image ||
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Quy-Nhon-morning-city-view-1300px.jpg/500px-Quy-Nhon-morning-city-view-1300px.jpg"
          }
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
          {calculateDuration(trip.startDate, trip.endDate)}
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(trip.id);
            }}
            className="bg-white/90 hover:bg-white p-2 rounded-xl shadow transition"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="bg-white/90 hover:bg-white p-2 rounded-xl shadow transition"
          >
            <MoreVertical className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 text-base line-clamp-2 group-hover:text-blue-600 transition">
          {trip.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <CalendarDays className="w-4 h-4 text-blue-500" />
          <span>
            {formatDateVN(trip.startDate)} → {formatDateVN(trip.endDate)}
          </span>
        </div>

        {trip.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>{trip.location}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <img
            src={trip.ownerAvatar || "/imgs/image.png"}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span>
            {trip.owner
              ? "Bạn là chủ sở hữu"
              : `Chia sẻ bởi ${trip.ownerName || "ai đó"}`}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------------------------- Main Page ---------------------------- */
const MyItinerariesPage = () => {
  const { user } = useAuth?.() || { user: { name: "Bạn" } };

  const [activeTab, setActiveTab] = useState("upcoming");
  const [sortBy, setSortBy] = useState("Ngày tạo");
  const [searchText, setSearchText] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);

  const [filter, setFilter] = useState({
    destinationId: "",
    type: "all",
    minDuration: "",
    maxDuration: "",
  });


  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------- Load Data via API ---------------------------- */
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        const period = activeTab; // upcoming | ongoing | past

        const apiFilters = {
          search: searchText || undefined,

          destinationIds:
            filter.destinationId !== "" ? [filter.destinationId] : undefined,

          type: filter.type || "all",

          minDuration:
            filter.minDuration !== "" ? Number(filter.minDuration) : undefined,

          maxDuration:
            filter.maxDuration !== "" ? Number(filter.maxDuration) : undefined,

          sortBy: sortBy === "Ngày tạo" ? "createdAt" : "title",
          sortDir: sortBy === "Tên A-Z" ? "asc" : "desc",

          period: activeTab,
        };


        console.log("🔵 Gửi filter lên API:", apiFilters);

        const res = await listMyItineraries(apiFilters);
        if (cancelled) return;
        console.log("🟢 API response:", res);
        const raw = res ?? [];
        console.log("🟢 Dữ liệu nhận về:", raw);

        const mapped = raw.map((it) => ({
          id: it.id,
          title: it.title,
          startDate: it.startDate,
          endDate: it.endDate,
          location: it.destinationName,
          coverImage: it.coverImage,
          owner: it.owner,
          ownerName: it.ownerName,
          ownerAvatar: it.ownerAvatar,
          createdAt: it.createdAt,
        }));

        setItineraries(mapped);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => (cancelled = true);
  }, [
    activeTab,
    searchText,
    filter.destinationId,
    filter.type,
    filter.minDuration,
    filter.maxDuration,
    sortBy
  ]);

  /* ---------------------------- Delete ---------------------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá?")) return;

    try {
      await apiDeleteItinerary(id);
      setItineraries((prev) => prev.filter((t) => t.id !== id));
      alert("Đã xoá!");
    } catch {
      alert("Xoá thất bại");
    }
  };

  /* ---------------------------- UI ---------------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-sm text-gray-500">Thành viên</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 bg-white rounded-2xl p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Lịch trình của tôi</h1>
            <button
              onClick={() => (window.location.href = "/trip-planner")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Tạo lịch trình
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mb-6 border-b pb-3">
            {["upcoming", "ongoing", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 font-medium relative ${activeTab === tab ? "text-blue-600" : "text-gray-500"
                  }`}
              >
                {{ upcoming: "Sắp tới", ongoing: "Đang diễn ra", past: "Quá khứ" }[
                  tab
                ]}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                type="text"
                placeholder="Tìm kiếm lịch trình..."
                className="w-full pl-12 pr-4 py-3 border rounded-lg"
              />
            </div>

            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-3 border rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Bộ lọc
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-6 py-3 pr-10 border rounded-lg"
              >
                <option>Ngày tạo</option>
                <option>Tên A-Z</option>
                <option>Ngày khởi hành</option>  {/* <-- thêm đây */}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

          </div>

          {/* LIST */}
          {loading ? (
            <div className="text-center py-20 text-gray-600">Đang tải...</div>
          ) : itineraries.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {itineraries.map((trip) => (
                <ItineraryCard key={trip.id} trip={trip} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <CalendarDays className="w-20 h-20 mx-auto opacity-30" />
              <h3 className="text-2xl font-bold mt-4">Không có dữ liệu</h3>
            </div>
          )}

          {/* FILTER MODAL */}
          {filterOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
              <div className="bg-white w-[500px] max-w-[95%] rounded-2xl p-6 shadow-xl relative">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>

                {/* DESTINATION
                <div className="mb-6">
                  <label className="font-medium text-gray-700">Điểm đến</label>
                  <select
                    value={filter.destinationId}
                    onChange={(e) =>
                      setFilter((f) => ({ ...f, destinationId: e.target.value }))
                    }
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                  >
                    <option value="">Chọn điểm đến</option>
                    {[...new Set(itineraries.map((i) => i.location))].map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* TYPE */}
                <div className="mb-6">
                  <label className="font-medium text-gray-700">Loại lịch trình</label>
                  <select
                    value={filter.type}
                    onChange={(e) =>
                      setFilter((f) => ({ ...f, type: e.target.value }))
                    }
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                  >
                    <option value="all">Tất cả</option>
                    <option value="owner">Bạn là chủ sở hữu</option>
                    <option value="collaborator">Bạn là cộng tác viên</option>
                  </select>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyItinerariesPage;
