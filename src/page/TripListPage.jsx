import React, { useEffect, useState } from "react";
import { Plus, Calendar, MapPin, Users, Clock } from "lucide-react";
import { getAllItineraries } from "../service/tripService"; // service gọi API
import { Link } from "react-router-dom";
export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await getAllItineraries();
        setTrips(res); // dữ liệu dạng array [{id, title, startDate, endDate}]
      } catch (err) {
        console.error("Lỗi khi tải lịch trình:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} ngày`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Đang tải lịch trình...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Lịch trình của tôi
            </h1>
            <p className="text-gray-600">
              Quản lý và theo dõi tất cả các chuyến đi của bạn
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/trip-planner")}
            className="mt-4 sm:mt-0 flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Lịch trình mới
          </button>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              to={`/trips/${trip.id}`}
              className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer block"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                  {trip.title}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">
                      {calculateDuration(trip.startDate, trip.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {trips.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-24 h-24 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              Chưa có lịch trình nào
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy tạo lịch trình đầu tiên của bạn để bắt đầu cuộc phiêu lưu!
            </p>
            <button
              onClick={() => (window.location.href = "/trip-planner")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2 inline" />
              Tạo lịch trình đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
