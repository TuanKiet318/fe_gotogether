import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { listTours, getJoinedTours } from "../service/tourService";

const TourListPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'my-tours'
  const [joinedTours, setJoinedTours] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;

  // Date filter state
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");

  const { user, isAuthenticated } = useContext(AuthContext);
  const currentUserId = isAuthenticated() ? user?.id : null;
  // Fetch tours from API
  useEffect(() => {
    fetchTours();
  }, [currentPage, sortBy, activeTab, startDateFrom, startDateTo]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      if (activeTab === "joined") {
        const data = await getJoinedTours();
        setTours(data || []);
        setTotalPages(1);
        setTotalElements(data?.length || 0);
        return;
      }

      const params = {
        page: currentPage,
        size: pageSize,
        status: "UPCOMING",
        sort: sortBy === "newest" ? "createdAt,desc" : "createdAt,asc",
      };

      if (activeTab === "my-tours" && currentUserId) {
        params.creatorId = currentUserId;
      }

      if (startDateFrom) params.startDateFrom = startDateFrom;
      if (startDateTo) params.startDateTo = startDateTo;

      const response = await listTours(params);
      if (response) {
        setTours(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || 0);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm) {
        // Client-side search filter
        // Trong thực tế có thể thêm search param vào API
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const popularDestinations = [
    "Tokyo",
    "Hanoi",
    "Bangkok",
    "Kuala Lumpur",
    "Seoul",
    "Đà Lạt",
    "Hội An",
    "Sapa",
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatViews = (views) => {
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + "k";
    }
    return views;
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ngày`;
  };

  const filteredTours = tours.filter(
    (tour) =>
      tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0); // Reset về trang đầu khi đổi tab
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(0);
  };

  const handleDateFilterApply = () => {
    setCurrentPage(0);
    fetchTours();
  };

  const clearDateFilter = () => {
    setStartDateFrom("");
    setStartDateTo("");
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/2533090/pexels-photo-2533090.jpeg')",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
            Chuyến đi
          </h1>

          {/* Search Bar */}
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-2 flex items-center">
            <Search className="ml-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm điểm đến, địa điểm hoặc thành phố để có kết quả tốt nhất"
              className="flex-1 px-4 py-3 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Popular Destinations */}
          <div className="mt-6 text-center">
            <p className="text-white text-sm mb-3">
              Duyệt qua các điểm đến phổ biến nhất
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {popularDestinations.map((dest) => (
                <button
                  key={dest}
                  className="px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-gray-100 transition"
                >
                  {dest}
                </button>
              ))}
              <button className="px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-gray-100 transition flex items-center gap-1">
                Điểm đến khác <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs - chỉ hiển thị khi user đã đăng nhập */}
        {currentUserId && (
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => handleTabChange("all")}
                className={`pb-4 px-2 font-medium transition ${
                  activeTab === "all"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Tất cả tours
              </button>
              <button
                onClick={() => handleTabChange("my-tours")}
                className={`pb-4 px-2 font-medium transition ${
                  activeTab === "my-tours"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Tours của tôi
              </button>
              <button
                onClick={() => handleTabChange("joined")}
                className={`pb-4 px-2 font-medium transition ${
                  activeTab === "joined"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Tour đã đăng ký
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">Sắp xếp theo</h3>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">
                Lọc theo ngày
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={startDateFrom}
                    onChange={(e) => setStartDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={startDateTo}
                    onChange={(e) => setStartDateTo(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDateFilterApply}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Áp dụng
                  </button>
                  <button
                    onClick={clearDateFilter}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-gray-800">
                Loại chuyến đi
              </h3>
              <div className="space-y-2">
                {[
                  "Tất cả",
                  "Tham quan",
                  "Leo núi & Trekking",
                  "Khám phá",
                  "Văn hóa & Nghệ thuật",
                  "Ngoài trời & Thiên nhiên",
                ].map((type) => (
                  <button
                    key={type}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      filterType === type.toLowerCase()
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setFilterType(type.toLowerCase())}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tour Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {totalElements}+ hành trình dành cho bạn
              </h2>
              <span className="text-sm text-gray-600">
                Trang {currentPage + 1} / {totalPages}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTours.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {activeTab === "my-tours"
                    ? "Bạn chưa tạo tour nào"
                    : activeTab === "joined"
                    ? "Bạn chưa tham gia tour nào"
                    : "Không tìm thấy tour nào phù hợp"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTours.map((tour) => (
                    <div
                      key={tour.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            tour.image ||
                            "https://bcp.cdnchinhphu.vn/Uploaded/duongphuonglien/2020_09_24/giai%20nhat%20thuyen%20hoa.jpg"
                          }
                          alt={tour.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800";
                          }}
                        />
                        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 text-sm">
                          <Eye size={14} className="text-gray-600" />
                          <span className="font-medium">
                            {formatViews(tour.views || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">
                          {tour.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {tour.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>
                              {calculateDuration(tour.startDate, tour.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span className="truncate">
                              {tour.itinerary?.title || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                tour.creator?.avatar ||
                                "https://i.pravatar.cc/150"
                              }
                              alt={tour.creator?.name}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                e.target.src = "https://i.pravatar.cc/150";
                              }}
                            />
                            <span className="text-sm text-gray-700">
                              {tour.creator?.name || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users size={16} />
                            <span>
                              {tour.currentParticipants}/{tour.maxParticipants}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(tour.pricePerPerson)}
                          </span>
                          <Link
                            to={`/tour/detail/${tour.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                      // Hiển thị trang đầu, cuối và các trang xung quanh trang hiện tại
                      if (
                        index === 0 ||
                        index === totalPages - 1 ||
                        (index >= currentPage - 1 && index <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={index}
                            onClick={() => handlePageChange(index)}
                            className={`px-4 py-2 rounded-lg transition ${
                              currentPage === index
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {index + 1}
                          </button>
                        );
                      } else if (
                        index === currentPage - 2 ||
                        index === currentPage + 2
                      ) {
                        return <span key={index}>...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourListPage;
