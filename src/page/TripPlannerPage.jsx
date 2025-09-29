// src/components/TripPlanner.jsx
import React, { useState, useContext } from "react";
import { Calendar, Plus, Users, Trash2 } from "lucide-react";
import { createItinerary } from "../service/tripService";
import { AuthContext } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import InviteCollaboratorModal from "../components/InviteCollaboratorModal"; // <-- NEW
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function TripPlanner() {
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false); // <-- NEW
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [collaborators, setCollaborators] = useState([]); // <-- NEW
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

  // NEW: thêm cộng tác viên
  const handleAddCollaborator = ({ email, role }) => {
    const e = (email || "").trim().toLowerCase();
    if (!e) return toast.warning("Email không hợp lệ");
    const exists = collaborators.some(c => c.email.toLowerCase() === e);
    if (exists) return toast.warning("Email đã có trong danh sách.");
    setCollaborators(prev => [...prev, { email: e, role }]);
    toast.success("Đã thêm người đồng hành");
  };
  // NEW: xóa cộng tác viên
  const handleRemoveCollaborator = (email) => {
    setCollaborators((prev) => prev.filter((c) => c.email !== email));
    toast.success("Đã xóa người đồng hành");
  };

  const handleCreateTrip = async () => {
    if (!validateForm()) return;
    setIsCreatingTrip(true);
    try {
      const tripData = {
        title: tripName,
        startDate,
        endDate,
        items: null,
        ...(collaborators.length > 0 && {
          invites: collaborators.map(c => ({
            inviteEmail: c.email,
            role: (c.role || "EDITOR").toUpperCase(),
          })),
        }),
      };

      const result = await createItinerary(tripData); // kỳ vọng { id: "..." }

      toast.success("Tạo lịch trình thành công!", { position: "top-right", autoClose: 3000 });

      // Reset form
      setTripName("");
      setStartDate("");
      setEndDate("");
      setCollaborators([]);

      navigate("/trip-list");
    } catch (error) {
      console.error("Error creating trip:", error);
      alert("Có lỗi xảy ra khi tạo lịch trình. Vui lòng thử lại.");
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const handleStartPlanning = () => {
    if (!isAuthenticated()) {
      setShowModal(true);
    } else {
      handleCreateTrip();
    }
  };

  const handleAuthSuccess = () => {
    setShowModal(false);
    handleCreateTrip();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="p-12 w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Lên kế hoạch chuyến đi mới
          </h1>
        </div>

        <div className="space-y-8">
          {/* Trip Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tên kế hoạch chuyến đi
            </label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="vd. Chuyến đi Hà Nội cuối tuần, Du lịch Đà Nẵng hè 2024..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 text-lg"
              disabled={isCreatingTrip}
            />
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ngày (bắt buộc)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                  placeholder="Ngày bắt đầu"
                  disabled={isCreatingTrip}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                  placeholder="Ngày kết thúc"
                  disabled={isCreatingTrip}
                />
              </div>
            </div>
          </div>

          {/* Collaborators - NEW */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="flex items-center justify-center px-6 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                disabled={isCreatingTrip}
              >
                <Plus className="w-5 h-5 mr-2" />
                Mời bạn đồng hành
              </button>

              <button
                className="flex items-center justify-center px-6 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                disabled={isCreatingTrip}
              >
                <Users className="w-5 h-5 mr-2" />
                Bạn bè
              </button>
            </div>

            {collaborators.length > 0 && (
              <div className="border-2 border-gray-100 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-3">
                  Đã thêm {collaborators.length} người đồng hành:
                </div>
                <ul className="space-y-2">
                  {collaborators.map((c) => (
                    <li
                      key={c.email}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <div className="text-sm">
                        <span className="font-medium">{c.email}</span>
                        <span className="ml-2 text-gray-500">• {c.role}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCollaborator(c.email)}
                        className="p-1.5 rounded-lg hover:bg-gray-200"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <div className="pt-2">
            <button
              onClick={handleStartPlanning}
              disabled={isCreatingTrip}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 text-lg"
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

          {/* Secondary */}
          <div className="text-center pt-4">
            <button
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
              disabled={isCreatingTrip}
            >
              Hoặc viết một hướng dẫn mới
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Invite Collaborator Modal - NEW */}
      <InviteCollaboratorModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onAdd={handleAddCollaborator}
      />
    </div>
  );
}
