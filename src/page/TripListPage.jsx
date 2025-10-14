// src/pages/TripList.jsx
import React, { useEffect, useState } from "react";
import { Plus, Calendar, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { getAllItineraries } from "../service/tripService";
import { DeleteItinerary } from "../service/api.admin.service.jsx";
import { Link } from "react-router-dom";

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== Fetch All Itineraries =====
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await getAllItineraries();
        setTrips(res);
      } catch (err) {
        console.error("Lỗi khi tải lịch trình:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // ===== Helpers =====
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const calculateDuration = (startDate, endDate) => {
    const diff =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;
    return `${diff} ngày`;
  };

  // ===== Handle Delete =====
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xoá lịch trình này?"
    );
    if (!confirmDelete) return;

    try {
      await DeleteItinerary(id);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
      alert("✅ Xoá lịch trình thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi xoá lịch trình:", err);
      alert(err.response?.data || "Không thể xoá lịch trình!");
    }
  };

  // ===== Render =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">
              🌍 Lịch trình của tôi
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý và theo dõi tất cả các chuyến đi của bạn
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/trip-planner")}
            className="mt-4 sm:mt-0 flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Lịch trình mới
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-600 py-20">
            ⏳ Đang tải lịch trình...
          </div>
        )}

        {/* Trip Grid */}
        {!loading && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="relative bg-white border rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 group"
              >
                {/* Cover Image */}
                <div className="relative h-40 bg-gray-200">
                  <img
                    src={
                      trip.coverImage ||
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Quy-Nhon-morning-city-view-1300px.jpg/500px-Quy-Nhon-morning-city-view-1300px.jpg"
                    }
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-3 left-3 bg-white/80 text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    {calculateDuration(trip.startDate, trip.endDate)}
                  </span>

                  {/* Action buttons (hiện khi hover) */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity duration-300">
                    {/* Xem */}
                    <Link
                      to={`/itinerary/${trip.id}`} // ← Đường dẫn mới
                      className="bg-white text-gray-800 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-100 font-semibold transition"
                    >
                      <Eye className="w-4 h-4" /> Xem
                    </Link>

                    {/* Sửa */}
                    <button
                      onClick={() =>
                        (window.location.href = `/itinerary-editor/${trip.id}`)
                      }
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-700 font-semibold transition"
                    >
                      <Pencil className="w-4 h-4" /> Sửa
                    </button>

                    {/* Xóa */}
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-red-700 font-semibold transition"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                    {trip.title}
                  </h3>
                  <div className="space-y-2 text-gray-600 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </div>
                    {trip.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                        {trip.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && trips.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-20 h-20 mx-auto text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-600 mt-4">
              Chưa có lịch trình nào
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy tạo lịch trình đầu tiên của bạn để bắt đầu cuộc phiêu lưu!
            </p>
            <button
              onClick={() => (window.location.href = "/trip-planner")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200"
            >
              <Plus className="w-5 h-5 inline mr-2" /> Tạo lịch trình đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
