import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import AuthModal from "../components/AuthModal.jsx";
import { toast } from "sonner";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  DollarSign,
  User,
  Mail,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import {
  getTourDetail,
  joinTour,
  cancelJoinTour,
  updateTour,
} from "../service/tourService";

const TourDetailPage = () => {
  const { tourId } = useParams();
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);
  const currentUser = isAuthenticated() ? user : null;
  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTourDetail(tourId);
        setTourData(response);
      } catch (err) {
        console.error("Error loading tour detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tourId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ngày ${days - 1} đêm`;
  };

  // Kiểm tra trạng thái
  const isCreator = currentUser && tourData?.creator?.id === currentUser.id;
  const isParticipant =
    currentUser &&
    tourData?.participants?.some((p) => p.user.id === currentUser.id);
  const isFull =
    tourData && tourData.currentParticipants >= tourData.maxParticipants;
  const isDeadlinePassed =
    tourData && new Date(tourData.registrationDeadline) < new Date();

  // Xử lý đăng ký tour
  const handleJoinTour = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      console.log("showAuthModal:", showAuthModal);
      return;
    }

    if (!tourId) return;
    setJoining(true);
    try {
      await joinTour(tourId);
      toast.success("Đăng ký tour thành công!");
      const response = await getTourDetail(tourId);
      setTourData(response);
    } catch (err) {
      toast.error(
        "Không thể đăng ký tour: " + (err.response?.data?.message || "")
      );
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  // Xử lý hủy tour
  const handleCancelTour = async () => {
    if (!tourId) return;
    if (!window.confirm("Bạn có chắc muốn hủy tham gia tour này không?"))
      return;
    setJoining(true);
    try {
      await cancelJoinTour(tourId);
      toast.success("Đã hủy tham gia tour!");
      const response = await getTourDetail(tourId);
      setTourData(response);
    } catch (err) {
      toast.error("Không thể hủy tour: " + (err.response?.data?.message || ""));
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin tour...</p>
        </div>
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-xl">Không tìm thấy tour</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-semibold">Quay lại</span>
        </button>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full"></div>
            </div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1 mb-4 md:mb-0">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                    {tourData.title}
                  </h1>
                  <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
                    {tourData.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <span
                    className={`inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold shadow-lg ${
                      tourData.status === "UPCOMING"
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {tourData.status === "UPCOMING"
                      ? "Sắp diễn ra"
                      : tourData.status}
                  </span>

                  {isCreator && !isDeadlinePassed && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-all shadow-lg"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </button>
                  )}

                  {isCreator && isDeadlinePassed && (
                    <button
                      disabled
                      className="flex items-center justify-center px-6 py-3 bg-gray-300 text-gray-500 rounded-full font-semibold cursor-not-allowed shadow-lg"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Đã hết hạn — không thể chỉnh sửa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-gradient-to-b from-white to-gray-50">
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Thời gian</p>
              </div>
              <p className="font-bold text-gray-800 mb-1">
                {formatDate(tourData.startDate)}
              </p>
              <p className="text-sm text-gray-600">
                {calculateDuration(tourData.startDate, tourData.endDate)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Hạn đăng ký</p>
              </div>
              <p className="font-bold text-gray-800 mb-1">
                {formatDate(tourData.registrationDeadline)}
              </p>
              {isDeadlinePassed && (
                <div className="flex items-center text-red-600 text-sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  Đã hết hạn
                </div>
              )}
              {!isDeadlinePassed && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Còn hạn
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Số lượng</p>
              </div>
              <p className="font-bold text-gray-800 mb-2">
                {tourData.currentParticipants}/{tourData.maxParticipants} người
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all ${
                    isFull ? "bg-red-500" : "bg-indigo-600"
                  }`}
                  style={{
                    width: `${
                      (tourData.currentParticipants /
                        tourData.maxParticipants) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Giá tour</p>
              </div>
              <p className="font-bold text-2xl text-green-600 mb-1">
                {formatCurrency(tourData.pricePerPerson)}
              </p>
              <p className="text-sm text-gray-600">/ người</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Itinerary */}
            {tourData.itinerary && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Lịch trình chi tiết
                  </h2>
                </div>
                <a
                  href={`/itinerary-editor/${tourData.itinerary.id}`}
                  className="block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 hover:from-blue-100 hover:to-indigo-100 transition-all border-2 border-blue-200 hover:border-blue-400"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xl text-blue-900 mb-1">
                        {tourData.itinerary.title}
                      </p>
                      <p className="text-blue-700">Xem chi tiết lịch trình →</p>
                    </div>
                    <div className="bg-blue-600 text-white p-3 rounded-full">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* Participants */}
            {tourData.participants?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Người tham gia ({tourData.participants.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tourData.participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-shadow border border-gray-200"
                    >
                      {p.user.avatar ? (
                        <img
                          src={p.user.avatar}
                          alt={p.user.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-blue-400"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {p.user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{p.user.name}</p>
                        <p className="text-sm text-gray-600">{p.user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Creator Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Người tổ chức
              </h2>
              <div className="flex flex-col items-center text-center">
                <img
                  src={tourData.creator.avatar}
                  alt={tourData.creator.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-600 mb-4 shadow-lg"
                />
                <p className="font-bold text-xl text-gray-800 mb-2">
                  {tourData.creator.name}
                </p>
                <p className="text-gray-600 text-sm flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {tourData.creator.email}
                </p>
              </div>
            </div>

            {/* Action Button */}
            {!isCreator && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {!isParticipant ? (
                  <button
                    onClick={handleJoinTour}
                    disabled={isFull || isDeadlinePassed || joining}
                    className={`w-full py-5 px-6 rounded-xl font-bold text-lg transition-all shadow-lg ${
                      isFull || isDeadlinePassed 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl transform hover:-translate-y-1"
                    }`}
                  >
                    {joining
                      ? "Đang xử lý..."
                      : isFull
                      ? "Tour đã đầy"
                      : isDeadlinePassed
                      ? "Đã hết hạn đăng ký"
                      : "Đăng ký tham gia tour"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-semibold">
                        Bạn đã đăng ký tour này
                      </p>
                    </div>
                    {!isDeadlinePassed && (
                      <button
                        onClick={handleCancelTour}
                        disabled={joining}
                        className="w-full py-5 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                      >
                        {joining ? "Đang hủy..." : "Hủy tham gia tour"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Creator Badge */}
            {isCreator && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-center text-white">
                <User className="w-12 h-12 mx-auto mb-3" />
                <p className="font-bold text-lg">Bạn là người tạo tour này</p>
                <p className="text-blue-100 text-sm mt-2">
                  Bạn có thể chỉnh sửa thông tin tour
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Edit Modal */}
      {showEditModal && (
        <EditTourModal
          tourData={tourData}
          onClose={() => setShowEditModal(false)}
          onUpdate={async () => {
            try {
              const response = await getTourDetail(tourId);
              setTourData(response);
            } catch (err) {
              console.error("Error reloading tour:", err);
            }
          }}
        />
      )}
    </div>
  );
};

// Edit Tour Modal Component
const EditTourModal = ({ tourData, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: tourData.title,
    description: tourData.description,
    startDate: tourData.startDate,
    endDate: tourData.endDate,
    registrationDeadline: tourData.registrationDeadline,
    maxParticipants: tourData.maxParticipants,
    pricePerPerson: tourData.pricePerPerson,
  });
  const [saving, setSaving] = useState(false);

  const hasChanges = () => {
    return (
      formData.title !== tourData.title ||
      formData.description !== tourData.description ||
      formData.startDate !== tourData.startDate ||
      formData.endDate !== tourData.endDate ||
      formData.registrationDeadline !== tourData.registrationDeadline ||
      formData.maxParticipants !== tourData.maxParticipants ||
      formData.pricePerPerson !== tourData.pricePerPerson
    );
  };

  const handleSubmit = async () => {
    if (!hasChanges()) {
      toast.warning("Không có thay đổi nào để lưu!");
      return;
    }

    setSaving(true);
    try {
      await updateTour(tourData.id, formData);
      toast.success("Cập nhật tour thành công!");
      await onUpdate();
      onClose();
    } catch (err) {
      toast.error(
        "Không thể cập nhật tour: " + (err.response?.data?.message || "")
      );
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-80 p-4">
      <div className="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6  ">
          <h2 className="text-2xl font-bold">Chỉnh sửa tour</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên tour
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hạn đăng ký
            </label>
            <input
              type="date"
              value={formData.registrationDeadline}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  registrationDeadline: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số người tối đa
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxParticipants: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giá (VND)
              </label>
              <input
                type="number"
                value={formData.pricePerPerson}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricePerPerson: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !hasChanges()} // THÊM !hasChanges()
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                saving || !hasChanges()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
