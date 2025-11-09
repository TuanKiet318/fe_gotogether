// src/pages/TripList.jsx
import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  CalendarDays,
  MapPin,
  Trash2,
  Clock,
  Plane,
} from "lucide-react";
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
  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ===== Banner Header ===== */}
      <div className="relative h-64 w-full overflow-hidden mb-12">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
          alt="Travel Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center text-white">
          <div className="flex items-center gap-2 mb-3">
            <Plane className="w-8 h-8 text-blue-200" />
            <h1 className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg">
              Lịch trình của tôi
            </h1>
          </div>
          <p className="text-lg text-gray-100 max-w-2xl">
            Quản lý, chỉnh sửa và theo dõi những hành trình đáng nhớ của bạn
          </p>

          {/* Nút tạo lịch trình */}
          <button
            onClick={() => (window.location.href = "/trip-planner")}
            className="mt-8 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-7 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="tracking-wide">Tạo lịch trình mới</span>
          </button>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-600 py-20 flex flex-col items-center">
            <Clock className="w-10 h-10 text-blue-500 mb-3 animate-spin-slow" />
            <p className="text-gray-600 font-medium">Đang tải lịch trình...</p>
          </div>
        )}

        {/* Trip Grid */}
        {!loading && trips.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-8">
              <CalendarDays className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Danh sách lịch trình
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  to={`/itinerary-editor/${trip.id}`}
                  className="relative bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 group cursor-pointer"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={
                        trip.coverImage ||
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Quy-Nhon-morning-city-view-1300px.jpg/500px-Quy-Nhon-morning-city-view-1300px.jpg"
                      }
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                    <span className="absolute bottom-3 left-3 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      {calculateDuration(trip.startDate, trip.endDate)}
                    </span>

                    {/* Delete Button */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => handleDelete(e, trip.id)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 shadow-md transition"
                        title="Xóa lịch trình"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {trip.title}
                    </h3>
                    <div className="space-y-2 text-gray-600 text-sm">
                      <div className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2 text-blue-500" />
                        {formatDate(trip.startDate)} –{" "}
                        {formatDate(trip.endDate)}
                      </div>
                      {trip.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-red-500" />
                          {trip.location}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && trips.length === 0 && (
          <div className="text-center py-20">
            <CalendarDays className="w-20 h-20 mx-auto text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-700 mt-4">
              Chưa có lịch trình nào
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy tạo lịch trình đầu tiên của bạn để bắt đầu cuộc phiêu lưu!
            </p>
            <button
              onClick={() => (window.location.href = "/trip-planner")}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-7 rounded-full shadow-md transition-all duration-300 hover:scale-105"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Tạo lịch trình đầu tiên</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
