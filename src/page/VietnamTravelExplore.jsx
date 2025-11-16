import React, { useState } from "react";
import {
  Search,
  MapPin,
  Star,
  Calendar,
  Users,
  TrendingUp,
  Heart,
  Navigation,
  Compass,
  Mountain,
  Waves,
} from "lucide-react";
import SearchBox from "../components/SearchBox";
export default function VietnamTravelExplore() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);

  const destinations = [
    {
      id: 1,
      name: "Quy Nhơn",
      region: "Miền Trung",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
      rating: 4.8,
      reviews: 1250,
      days: "3N2Đ",
      description: "Biển xanh, cát trắng và ẩm thực tuyệt vời",
      tags: ["Biển", "Nghỉ dưỡng", "Ẩm thực"],
      color: "from-emerald-400 to-teal-500",
    },
    {
      id: 2,
      name: "Đà Nẵng",
      region: "Miền Trung",
      image:
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80",
      rating: 4.9,
      reviews: 3420,
      days: "4N3Đ",
      description: "Thành phố đáng sống với cầu Vàng nổi tiếng",
      tags: ["Biển", "Thành phố", "Văn hóa"],
      color: "from-blue-400 to-cyan-500",
    },
    {
      id: 3,
      name: "Hà Nội",
      region: "Miền Bắc",
      image:
        "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?w=800&q=80",
      rating: 4.7,
      reviews: 2890,
      days: "3N2Đ",
      description: "Thủ đô ngàn năm văn hiến",
      tags: ["Văn hóa", "Lịch sử", "Ẩm thực"],
      color: "from-amber-400 to-orange-500",
    },
    {
      id: 4,
      name: "Phú Quốc",
      region: "Miền Nam",
      image:
        "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
      rating: 4.9,
      reviews: 4120,
      days: "4N3Đ",
      description: "Đảo ngọc thiên đường với bãi biển tuyệt đẹp",
      tags: ["Biển", "Resort", "Lặn biển"],
      color: "from-violet-400 to-purple-500",
    },
    {
      id: 5,
      name: "Sapa",
      region: "Miền Bắc",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
      rating: 4.8,
      reviews: 2340,
      days: "3N2Đ",
      description: "Ruộng bậc thang và văn hóa dân tộc",
      tags: ["Núi", "Trekking", "Văn hóa"],
      color: "from-green-400 to-emerald-600",
    },
    {
      id: 6,
      name: "Hội An",
      region: "Miền Trung",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
      rating: 4.9,
      reviews: 3890,
      days: "3N2Đ",
      description: "Phố cổ với đèn lồng lung linh",
      tags: ["Văn hóa", "Lịch sử", "Nhiếp ảnh"],
      color: "from-rose-400 to-pink-500",
    },
  ];

  const trendingSearches = [
    "Du lịch miền Trung",
    "Resort biển",
    "Tour Sapa",
    "Ẩm thực đường phố",
    "Khách sạn 5 sao",
    "Tour trọn gói",
    "Vé máy bay giá rẻ",
    "Combo Phú Quốc",
  ];

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div
        className="relative bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage: "url('/imgs/travelvietnam.jpg')",
        }}
      >
        {/* Lớp phủ tối để chữ dễ đọc */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full">
                <MapPin size={20} />
                <span className="text-sm font-medium">
                  Khám phá 63 tỉnh thành
                </span>
              </div>
            </div>

            <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              Khám Phá Việt Nam
            </h1>

            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Trải nghiệm vẻ đẹp đất nước hình chữ S qua những hành trình đáng
              nhớ
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-6">
            <SearchBox
              placeholder="Bạn muốn đi đâu? Tìm kiếm địa điểm, khách sạn, hoạt động..."
              className="shadow-2xl"
              onSelect={(place) => console.log("Đã chọn địa điểm:", place)}
            />
          </div>

          {/* Trending Searches */}
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-white/80 mb-3 font-medium">
              🔥 Tìm kiếm phổ biến:
            </p>
            <div className="flex flex-wrap gap-3">
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  className="px-5 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm transition-all backdrop-blur-md border border-white/20 hover:scale-105 font-medium"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1 */}
          <div className="border border-blue-600 bg-white text-blue-700 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-500 mb-2 text-sm font-medium">
                  Địa điểm du lịch
                </p>
                <p className="text-5xl font-bold text-blue-700">63+</p>
                <p className="text-blue-500 mt-1 text-sm">Tỉnh thành</p>
              </div>
              <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center border border-blue-200">
                <MapPin size={40} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-blue-600 bg-white text-blue-700 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-500 mb-2 text-sm font-medium">
                  Tours & Trải nghiệm
                </p>
                <p className="text-5xl font-bold text-blue-700">500+</p>
                <p className="text-blue-500 mt-1 text-sm">Gói tour</p>
              </div>
              <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center border border-blue-200">
                <Navigation size={40} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border border-blue-600 bg-white text-blue-700 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-500 mb-2 text-sm font-medium">
                  Khách hàng hài lòng
                </p>
                <p className="text-5xl font-bold text-blue-700">50K+</p>
                <p className="text-blue-500 mt-1 text-sm">Đánh giá 5 sao</p>
              </div>
              <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center border border-blue-200">
                <Users size={40} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                Điểm đến nổi bật
              </h2>
              <p className="text-gray-600">
                Những địa điểm được yêu thích nhất tại Việt Nam
              </p>
            </div>

            <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 px-6 py-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
              Xem tất cả
              <TrendingUp size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination) => (
              <div
                key={destination.id}
                className="bg-white border border-blue-200 rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group"
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => toggleFavorite(destination.id)}
                      className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg border ${
                        favorites.includes(destination.id)
                          ? "bg-blue-600 text-white border-blue-600 scale-110"
                          : "bg-white/90 text-gray-600 border-blue-200 hover:bg-white hover:scale-110"
                      }`}
                    >
                      <Heart
                        size={22}
                        fill={
                          favorites.includes(destination.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {destination.name}
                  </h3>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {destination.description}
                  </p>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                    {destination.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium border border-blue-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
