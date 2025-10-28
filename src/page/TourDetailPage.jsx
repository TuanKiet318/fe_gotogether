import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  DollarSign,
  User,
  Mail,
} from "lucide-react";

const TourDetailPage = () => {
  const [tourData, setTourData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dữ liệu mẫu từ API
  useEffect(() => {
    // Giả lập API call
    const mockData = {
      status: 200,
      message: "Success",
      data: {
        id: "0215eb13-31cc-4f5b-9e35-ae97952af0c4",
        title: "Tour Đà Lạt 3 ngày 2 đêm",
        description: "Khám phá Đà Lạt mùa hoa dã quỳ",
        startDate: "2025-12-01",
        endDate: "2025-12-03",
        registrationDeadline: "2025-11-25",
        maxParticipants: 15,
        currentParticipants: 0,
        pricePerPerson: 1500000.0,
        status: "UPCOMING",
        createdAt: "2025-10-27T16:41:02.867506",
        updatedAt: "2025-10-27T17:02:53.481516",
        itinerary: {
          id: "4756245f-e133-485d-82cc-b26cc0cd5823",
          title: "Chuyến đi Đà Lạt 2026",
        },
        creator: {
          id: "960d9ee6-9137-4e11-80a1-03200353caba",
          email: "trantuankhapc2@gmail.com",
          name: "kha",
          avatar:
            "https://imgs.vietnamnet.vn/Images/2011/08/23/10/20110823104022_avatar09.jpg?width=0&s=Nr3p9UeWZWllWvXvcEkK2w",
        },
        participants: [],
      },
    };

    // Giả lập user hiện tại (không phải creator)
    setCurrentUserId("different-user-id");
    setTourData(mockData.data);
    setLoading(false);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ngày ${days - 1} đêm`;
  };

  const handleRegister = () => {
    alert("Đăng ký tham gia tour thành công!");
    // Implement registration logic here
  };

  const isCreator = tourData && currentUserId === tourData.creator.id;
  const isFull =
    tourData && tourData.currentParticipants >= tourData.maxParticipants;
  const isDeadlinePassed =
    tourData && new Date(tourData.registrationDeadline) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin tour...</p>
        </div>
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Không tìm thấy thông tin tour</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{tourData.title}</h1>
                <p className="text-blue-100 text-lg">{tourData.description}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  tourData.status === "UPCOMING"
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              >
                {tourData.status === "UPCOMING"
                  ? "Sắp diễn ra"
                  : tourData.status}
              </span>
            </div>
          </div>

          {/* Tour Info Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Thời gian</p>
                <p className="font-semibold">
                  {formatDate(tourData.startDate)} -{" "}
                  {formatDate(tourData.endDate)}
                </p>
                <p className="text-sm text-gray-600">
                  {calculateDuration(tourData.startDate, tourData.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Hạn đăng ký</p>
                <p className="font-semibold">
                  {formatDate(tourData.registrationDeadline)}
                </p>
                {isDeadlinePassed && (
                  <p className="text-sm text-red-600">Đã hết hạn đăng ký</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Số lượng</p>
                <p className="font-semibold">
                  {tourData.currentParticipants}/{tourData.maxParticipants}{" "}
                  người
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
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
            </div>

            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Giá</p>
                <p className="font-semibold text-xl text-blue-600">
                  {formatCurrency(tourData.pricePerPerson)}
                </p>
                <p className="text-sm text-gray-600">/ người</p>
              </div>
            </div>
          </div>
        </div>

        {/* Itinerary Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">Lịch trình</h2>
          </div>
          <a
            href={`/itinerary-editor/${tourData.itinerary.id}`}
            className="block bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-blue-900">
                {tourData.itinerary.title}
              </p>
              <svg
                className="w-5 h-5 text-blue-600"
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
          </a>
        </div>

        {/* Creator Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Người tổ chức</h2>
          <div className="flex items-center space-x-4">
            <img
              src={tourData.creator.avatar}
              alt={tourData.creator.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
            />
            <div>
              <p className="font-semibold text-lg">{tourData.creator.name}</p>
              <p className="text-gray-600 text-sm flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {tourData.creator.email}
              </p>
            </div>
          </div>
        </div>

        {/* Registration Button */}
        {!isCreator && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={handleRegister}
              disabled={isFull || isDeadlinePassed}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                isFull || isDeadlinePassed
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-1"
              }`}
            >
              {isFull
                ? "Tour đã đầy"
                : isDeadlinePassed
                ? "Đã hết hạn đăng ký"
                : "Đăng ký tham gia tour"}
            </button>
            {!isFull && !isDeadlinePassed && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Còn {tourData.maxParticipants - tourData.currentParticipants}{" "}
                chỗ trống
              </p>
            )}
          </div>
        )}

        {/* Creator View */}
        {isCreator && (
          <div className="bg-blue-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <User className="w-5 h-5" />
              <p className="font-semibold">Bạn là người tạo tour này</p>
            </div>
          </div>
        )}

        {/* Participants Section */}
        {tourData.participants && tourData.participants.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Danh sách người tham gia</h2>
            <div className="space-y-3">
              {tourData.participants.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {participant.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{participant.name}</p>
                    <p className="text-sm text-gray-600">{participant.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourDetailPage;
