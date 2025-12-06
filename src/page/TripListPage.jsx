// src/pages/MyItinerariesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";

/* API services */
import { getAllItineraries as apiGetAllItineraries } from "../service/tripService";
import { DeleteItinerary as apiDeleteItinerary } from "../service/api.admin.service.jsx";

/* ---------------------------- Util Functions ---------------------------- */
const parseDate = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt) ? null : dt;
};

const formatDateVN = (dateString) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const calculateDuration = (startDate, endDate) => {
  const s = parseDate(startDate);
  const e = parseDate(endDate);
  if (!s || !e) return "";
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return `${diff} ngày`;
};

const todayStart = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

/* ---------------------------- ItineraryCard ---------------------------- */
function ItineraryCard({ trip, onDelete }) {
  return (
    <Link
      to={`/itinerary-editor/${trip.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
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
              onDelete?.(e, trip.id);
            }}
            className="bg-white/90 hover:bg-white p-2 rounded-xl shadow opacity-80 transition"
            title="Xoá"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="bg-white/90 hover:bg-white p-2 rounded-xl shadow opacity-90 transition"
            title="More"
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

          {/* Trường hợp bạn là chủ sở hữu */}
          {trip.owner ? (
            <>
              <img
                src={trip.ownerAvatar || "/imgs/image.png"}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span>Bạn là chủ sở hữu</span>
            </>
          ) : (
            /* Trường hợp người khác tạo/chia sẻ */
            <>
              <img
                src={trip.ownerAvatar || "/imgs/image.png"}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span>
                {trip.ownerName
                  ? `Chia sẻ bởi ${trip.ownerName}`
                  : "Chia sẻ bởi ai đó"}
              </span>
            </>
          )}

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
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockData = []; // mock đã bỏ, dùng mapping API thật

  /* ---------------------------- LOAD + MAP API DATA ---------------------------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await apiGetAllItineraries();
        const raw = res?.data || res || [];

        const mapped = raw.map((it) => ({
          id: it.id,
          title: it.title,
          startDate: it.startDate,
          endDate: it.endDate,
          location: it.destinationName,

          coverImage: it.coverImage || null,
          image: it.coverImage || null,

          // owner info
          owner: it.owner, // boolean
          ownerId: it.ownerId,
          ownerName: it.ownerName,
          ownerAvatar: it.ownerAvatar,

          createdAt: it.createdAt || it.startDate || null,
          updatedAt: it.updatedAt || it.endDate || null,
        }));

        if (!cancelled) setItineraries(mapped);
      } catch (err) {
        console.error("Lỗi load itineraries:", err);
        if (!cancelled) setItineraries(mockData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => (cancelled = true);
  }, []);


  /* ---------------------------- DELETE ITEM ---------------------------- */
  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Bạn có chắc muốn xoá lịch trình này?")) return;

    try {
      await apiDeleteItinerary(id);
      setItineraries((prev) => prev.filter((t) => t.id !== id));
      alert("Đã xoá!");
    } catch (err) {
      console.error("Lỗi xoá:", err);
      alert("Xoá thất bại.");
    }
  };

  /* ---------------------------- FILTER + SORT ---------------------------- */
  const filtered = useMemo(() => {
    const now = todayStart();
    const q = searchText.toLowerCase().trim();

    return itineraries
      .filter((it) => {
        const s = parseDate(it.startDate);
        const e = parseDate(it.endDate);
        if (!s || !e) return true;
        if (activeTab === "upcoming") return s > now;
        if (activeTab === "ongoing") return s <= now && e >= now;
        if (activeTab === "past") return e < now;
        return true;
      })
      .filter((it) => {
        if (!q) return true;
        return (
          it.title?.toLowerCase().includes(q) ||
          it.location?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "Ngày tạo") {
          return (parseDate(b.createdAt) || 0) - (parseDate(a.createdAt) || 0);
        }
        if (sortBy === "Tên A-Z") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [itineraries, activeTab, searchText, sortBy]);

  /* ---------------------------- RENDER ---------------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{user?.name}</h2>
                <p className="text-sm text-gray-500">Thành viên</p>
              </div>

              <nav className="space-y-1">
                <a className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                  🎟️ Hồ sơ
                </a>
                <a className="flex items-center gap-3 px-4 py-3 bg-white text-blue-600 rounded-lg font-medium shadow-sm">
                  📋 Hành trình
                  <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm">
                    {itineraries.length}
                  </span>
                </a>
                <a className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                  📅 Bài viết
                </a>
                <a className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                  ❤️ Yêu thích
                </a>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 bg-white rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lịch trình của tôi</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Quản lý và theo dõi hành trình của bạn
                </p>
              </div>

              <button
                onClick={() => (window.location.href = "/trip-planner")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Tạo lịch trình
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mb-6 border-b border-gray-200">
              {["upcoming", "ongoing", "past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-medium relative ${activeTab === tab ? "text-blue-600" : "text-gray-500"
                    }`}
                >
                  {
                    { upcoming: "Sắp tới", ongoing: "Đang diễn ra", past: "Quá khứ" }[tab]
                  }
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  type="text"
                  placeholder="Tìm kiếm lịch trình..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <SlidersHorizontal className="w-5 h-5" />
                Bộ lọc
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-6 py-3 pr-10 border border-gray-300 rounded-lg"
                >
                  <option>Ngày tạo</option>
                  <option>Tên A-Z</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="text-center py-20 text-gray-600">Đang tải...</div>
            ) : filtered.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {filtered.map((trip) => (
                  <ItineraryCard key={trip.id} trip={trip} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <CalendarDays className="w-20 h-20 mx-auto text-gray-300" />
                <h3 className="text-2xl font-bold text-gray-700 mt-4">
                  Chưa có lịch trình nào
                </h3>

                {/* <button
                  onClick={() => (window.location.href = "/trip-planner")}
                  className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-full"
                >
                  <PlusCircle className="w-5 h-5" />
                  Tạo lịch trình đầu tiên
                </button> */}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyItinerariesPage;
