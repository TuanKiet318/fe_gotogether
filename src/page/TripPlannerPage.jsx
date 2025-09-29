// src/components/TripPlannerGlass.jsx
import React, { useState, useContext } from "react";
import { Calendar, Plus, Users } from "lucide-react";
import { createItinerary } from "../service/tripService";
import { AuthContext } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function TripPlannerGlass() {
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const validateForm = () => {
    if (!tripName.trim()) {
      toast.error("Vui lòng nhập tên kế hoạch chuyến đi");
      return false;
    }
    if (!startDate || !endDate) {
      toast.warning("Vui lòng chọn ngày bắt đầu và kết thúc");
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc");
      return false;
    }
    return true;
  };

  const handleCreateTrip = async () => {
    if (!validateForm()) return;
    setIsCreatingTrip(true);
    try {
      const tripData = { title: tripName, startDate, endDate, items: [] };
      await createItinerary(tripData);
      toast.success("Tạo lịch trình thành công!");
      setTripName("");
      setStartDate("");
      setEndDate("");
      navigate("/trip-list");
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error("Có lỗi xảy ra khi tạo lịch trình.");
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const handleStartPlanning = () => {
    if (!isAuthenticated()) setShowModal(true);
    else handleCreateTrip();
  };

  const handleAuthSuccess = () => {
    setShowModal(false);
    handleCreateTrip();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')", // 👉 ảnh nền travel
      }}
    >
      {/* Overlay để dễ đọc */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-lg backdrop-blur-xl bg-white/20 border border-white/40 rounded-3xl shadow-2xl p-10 space-y-8 text-white">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold drop-shadow-lg">
            Lên kế hoạch chuyến đi
          </h1>
          <p className="text-gray-200 mt-2">
            Tạo lịch trình và chia sẻ cùng bạn bè
          </p>
        </div>

        {/* Trip Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Tên kế hoạch chuyến đi
          </label>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="vd. Du lịch Đà Nẵng hè 2025..."
            className="w-full px-5 py-3 bg-white/20 border border-white/40 rounded-xl focus:ring-2 focus:ring-cyan-300 outline-none text-lg text-white placeholder-gray-300"
            disabled={isCreatingTrip}
          />
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Ngày (bắt buộc)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 w-5 h-5" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/40 rounded-xl focus:ring-2 focus:ring-cyan-300 outline-none text-white placeholder-gray-300"
                disabled={isCreatingTrip}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 w-5 h-5" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/40 rounded-xl focus:ring-2 focus:ring-cyan-300 outline-none text-white placeholder-gray-300"
                disabled={isCreatingTrip}
              />
            </div>
          </div>
        </div>

        {/* Extra options */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="flex items-center justify-center px-6 py-3 rounded-xl bg-white/20 border border-white/40 text-white hover:bg-white/30 font-medium transition-all"
            disabled={isCreatingTrip}
          >
            <Plus className="w-5 h-5 mr-2" /> Mời bạn đồng hành
          </button>
          <button
            className="flex items-center justify-center px-6 py-3 rounded-xl bg-white/20 border border-white/40 text-white hover:bg-white/30 font-medium transition-all"
            disabled={isCreatingTrip}
          >
            <Users className="w-5 h-5 mr-2" /> Bạn bè
          </button>
        </div>

        {/* Main button */}
        <div className="pt-4">
          <button
            onClick={handleStartPlanning}
            disabled={isCreatingTrip}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 text-lg"
          >
            {isCreatingTrip ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang tạo lịch trình...
              </div>
            ) : (
              "Bắt đầu lên kế hoạch"
            )}
          </button>
        </div>

        {/* Secondary link */}
        <div className="text-center pt-2">
          <button
            className="text-gray-200 hover:text-white transition-colors duration-200 font-medium"
            disabled={isCreatingTrip}
          >
            Hoặc viết một hướng dẫn mới
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
