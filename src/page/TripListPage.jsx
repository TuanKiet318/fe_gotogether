import React, { useEffect, useState } from "react";
import { Plus, Calendar, Clock, MapPin } from "lucide-react";
import { getAllItineraries } from "../service/tripService";
import { Link } from "react-router-dom";

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const calculateDuration = (startDate, endDate) => {
    const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    return `${diff} ngày`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">🌍 Lịch trình của tôi</h1>
            <p className="text-gray-600 mt-1">Quản lý và theo dõi tất cả các chuyến đi của bạn</p>
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
        {loading && <div className="text-center text-gray-600 py-20">⏳ Đang tải lịch trình...</div>}

        {/* Trip Grid */}
        {!loading && (
          <>
            {trips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <Link
                    key={trip.id}
                    to={`/trips/${trip.id}`}
                    className="bg-white border rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 group"
                  >
                    {/* Cover Image */}
                    <div className="relative h-40 bg-gray-200">
                      <img
                        src={trip.coverImage || "https://source.unsplash.com/random/800x600?travel"}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-3 left-3 bg-white/80 text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-md">
                        {calculateDuration(trip.startDate, trip.endDate)}
                      </span>
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
                  </Link>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="text-center py-10 text-gray-500">
                Bạn chưa có chuyến đi nào. Hãy tạo chuyến đi mới!
              </div>
            )}
          </>
        )}


        {/* Empty State */}
        {!loading && trips.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-20 h-20 mx-auto text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-600 mt-4">Chưa có lịch trình nào</h3>
            <p className="text-gray-500 mb-6">Hãy tạo lịch trình đầu tiên của bạn để bắt đầu cuộc phiêu lưu!</p>
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
