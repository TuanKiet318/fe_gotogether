import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Eye,
  ChevronDown,
} from "lucide-react";

const TourListPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterType, setFilterType] = useState("all");

  // Mock data - trong thực tế sẽ gọi API listTours()
  useEffect(() => {
    const mockTours = [
      {
        id: "0215eb13-31cc-4f5b-9e35-ae97952af0c4",
        title: "Tour Đà Lạt 3 ngày 2 đêm",
        description: "Khám phá Đà Lạt mùa hoa dã quỳ",
        startDate: "2025-12-01",
        endDate: "2025-12-03",
        maxParticipants: 15,
        currentParticipants: 8,
        pricePerPerson: 1500000,
        views: 24550,
        duration: "3 ngày",
        places: 10,
        image:
          "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
        creator: {
          name: "Kha",
          avatar:
            "https://imgs.vietnamnet.vn/Images/2011/08/23/10/20110823104022_avatar09.jpg",
        },
      },
      {
        id: "2",
        title: "5 Ngày Khám Phá Tokyo: Hành Trình Khó Quên",
        description: "Trải nghiệm văn hóa Nhật Bản đầy màu sắc",
        startDate: "2025-12-10",
        endDate: "2025-12-14",
        maxParticipants: 20,
        currentParticipants: 15,
        pricePerPerson: 25000000,
        views: 24260,
        duration: "5 ngày",
        places: 21,
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
        creator: {
          name: "José Cruze",
          avatar: "https://i.pravatar.cc/150?img=12",
        },
      },
      {
        id: "3",
        title: "Hành Trình Qua Thời Gian: Bangkok 2 Ngày",
        description: "Khám phá thủ đô sôi động của Thái Lan",
        startDate: "2025-11-20",
        endDate: "2025-11-21",
        maxParticipants: 12,
        currentParticipants: 6,
        pricePerPerson: 8000000,
        views: 18490,
        duration: "2 ngày",
        places: 15,
        image:
          "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800",
        creator: {
          name: "Bobby Smith",
          avatar: "https://i.pravatar.cc/150?img=8",
        },
      },
      {
        id: "4",
        title: "Phố Cổ Hội An 4 Ngày 3 Đêm",
        description: "Khám phá di sản văn hóa thế giới",
        startDate: "2025-12-05",
        endDate: "2025-12-08",
        maxParticipants: 18,
        currentParticipants: 12,
        pricePerPerson: 3500000,
        views: 31200,
        duration: "4 ngày",
        places: 12,
        image:
          "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
        creator: {
          name: "Minh Anh",
          avatar: "https://i.pravatar.cc/150?img=5",
        },
      },
      {
        id: "5",
        title: "Vịnh Hạ Long 2 Ngày 1 Đêm",
        description: "Du thuyền sang trọng trên di sản thiên nhiên",
        startDate: "2025-11-28",
        endDate: "2025-11-29",
        maxParticipants: 25,
        currentParticipants: 20,
        pricePerPerson: 4200000,
        views: 42300,
        duration: "2 ngày",
        places: 8,
        image:
          "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
        creator: {
          name: "Thanh Tùng",
          avatar: "https://i.pravatar.cc/150?img=13",
        },
      },
      {
        id: "6",
        title: "Sapa Mùa Lúa Chín 3 Ngày",
        description: "Trekking và khám phá văn hóa vùng cao",
        startDate: "2025-12-15",
        endDate: "2025-12-17",
        maxParticipants: 16,
        currentParticipants: 10,
        pricePerPerson: 2800000,
        views: 19800,
        duration: "3 ngày",
        places: 14,
        image:
          "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
        creator: {
          name: "Lan Hương",
          avatar: "https://i.pravatar.cc/150?img=9",
        },
      },
    ];

    setTimeout(() => {
      setTours(mockTours);
      setLoading(false);
    }, 800);
  }, []);

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

  const filteredTours = tours.filter(
    (tour) =>
      tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600')",
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">Sắp xếp theo</h3>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>
              </select>
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
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {filteredTours.length}+ hành trình dành cho bạn
            </h2>

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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={tour.image}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 text-sm">
                        <Eye size={14} className="text-gray-600" />
                        <span className="font-medium">
                          {formatViews(tour.views)}
                        </span>
                      </div>
                      {/* Pagination dots */}
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <div
                            key={dot}
                            className={`w-2 h-2 rounded-full ${
                              dot === 1 ? "bg-white" : "bg-white/50"
                            }`}
                          ></div>
                        ))}
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
                          <span>{tour.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{tour.places} địa điểm</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <img
                            src={tour.creator.avatar}
                            alt={tour.creator.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm text-gray-700">
                            {tour.creator.name}
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
                          to={"/tour/detail"} // <-- đường dẫn đến trang chi tiết tour
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourListPage;
