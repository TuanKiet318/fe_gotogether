import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Compass,
  Layers,
  Share2,
  Star,
  ChevronRight,
  PlusCircle,
  CheckCircle,
  Route,
  Search,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  Map,
} from "lucide-react";
import SearchBox from "../components/SearchBox";
import { GetAllDestinations, GetFeatured } from "../service/api.admin.service";

export default function HomePage() {
  const [destinations, setDestinations] = useState([]);
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allDestinationsRes, featuredRes] = await Promise.all([
          GetAllDestinations(),
          GetFeatured(),
        ]);
        setDestinations(allDestinationsRes || []);
        setFeaturedDestinations(featuredRes || []);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateTrip = (destination = null) => {
    if (destination) {
      navigate(
        `/trip-planner?destination=${encodeURIComponent(
          destination.name
        )}&destId=${destination.id}`
      );
    } else {
      navigate("/trip-planner");
    }
  };

  // Features with icons
  const features = [
    {
      icon: Zap,
      title: "Tạo nhanh trong 5 phút",
      description: "Tự động đề xuất lịch trình dựa trên sở thích của bạn",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Target,
      title: "Tối ưu hóa lộ trình",
      description:
        "Sắp xếp địa điểm theo vị trí để tiết kiệm thời gian di chuyển",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      title: "Thống kê chi tiết",
      description: "Xem ngân sách, thời gian và khoảng cách giữa các điểm",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Share2,
      title: "Chia sẻ dễ dàng",
      description: "Gửi lịch trình cho bạn bè hoặc xuất ra nhiều định dạng",
      color: "from-purple-500 to-pink-500",
    },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      trip: "Đà Lạt 4 ngày 3 đêm",
      text: "Tôi đã lập kế hoạch cho chuyến đi Đà Lạt chỉ trong 15 phút. Mọi thứ đều hoàn hảo!",
      rating: 5,
    },
    {
      name: "Trần Văn Bình",
      trip: "Phú Quốc 5 ngày 4 đêm",
      text: "Công cụ này giúp tôi tiết kiệm hàng giờ lên kế hoạch. Rất đáng để thử!",
      rating: 5,
    },
    {
      name: "Lê Thị Hương",
      trip: "Hội An - Đà Nẵng 3 ngày",
      text: "Dễ sử dụng, giao diện đẹp. Tôi đã chia sẻ lịch trình với cả nhóm đi cùng.",
      rating: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Tập trung vào Trip Planner */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 text-white overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="whitespace-nowrap">Lên kế hoạch du lịch</span>
                <span className="block text-yellow-300">
                  chỉ trong vài phút
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-blue-100 max-w-xl">
                Tạo lịch trình du lịch chi tiết, tối ưu hóa tuyến đường và ngân
                sách. Khám phá 63 tỉnh thành Việt Nam theo cách của riêng bạn.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => handleCreateTrip()}
                  className="group flex items-center justify-center gap-3 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <PlusCircle className="w-6 h-6" />
                  Tạo lịch trình ngay
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate("/explores")}
                  className="flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-all"
                >
                  <Map className="w-6 h-6" />
                  Khám phá điểm đến
                </button>
              </div>
            </div>

            {/* Right Content - Visual Preview */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <CalendarDays className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Chuyến đi Hà Nội
                      </h3>
                      <p className="text-sm text-gray-500">3 ngày 2 đêm</p>
                    </div>
                  </div>

                  {[
                    "Ngày 1: Khám phá Phố Cổ",
                    "Ngày 2: Hồ Hoàn Kiếm & Văn Miếu",
                    "Ngày 3: Làng gốm Bát Tràng",
                  ].map((day, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{day}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          8:00 AM - 6:00 PM
                        </p>
                      </div>
                    </div>
                  ))}

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg shadow-lg font-semibold text-sm">
                ⚡ Tiết kiệm 70% thời gian
              </div>
              <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm">
                ✓ Miễn phí sử dụng
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Interactive Cards */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tạo lịch trình chỉ với 3 bước
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Đơn giản hơn bao giờ hết với giao diện trực quan và thông minh
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Chọn & Thêm",
                description:
                  "Tìm kiếm và thêm các địa điểm bạn muốn ghé thăm vào lịch trình",
                icon: MapPin,
                color: "bg-blue-100 border-blue-200 text-blue-600",
                image:
                  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
              },
              {
                step: 2,
                title: "Sắp xếp & Tối ưu",
                description:
                  "Kéo thả để sắp xếp thứ tự và sử dụng gợi ý các địa điểm để hoàn thành lich trình",
                icon: Compass,
                color: "bg-purple-100 border-purple-200 text-purple-600",
                image:
                  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w-800&q=80",
              },
              {
                step: 3,
                title: "Xuất & Chia sẻ",
                description:
                  "Xuất lịch trình ra PDF, Excel hoặc chia sẻ trực tuyến với bạn bè",
                icon: Share2,
                color: "bg-green-100 border-green-200 text-green-600",
                image:
                  "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center`}
                    >
                      <step.icon size={24} />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="text-4xl font-bold text-white opacity-30">
                      {step.step}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center`}
                    >
                      <step.icon size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">{step.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Bước {step.step}/3
                    </span>
                    <button
                      onClick={() => handleCreateTrip()}
                      className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
                    >
                      Thử ngay
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI-Powered Features */}
      <div className=" bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại sao lịch trình của chúng tôi thông minh hơn?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 cursor-pointer ${
                  activeFeature === index ? "ring-2 ring-blue-500" : ""
                }`}
                onMouseEnter={() => setActiveFeature(index)}
                onClick={() => handleCreateTrip()}
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                >
                  <feature.icon size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Người dùng nói gì về chúng tôi?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Hàng ngàn du khách đã tin tưởng sử dụng công cụ của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="text-yellow-500 fill-current"
                    />
                  ))}
                </div>

                <p className="text-gray-600 italic mb-6">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 bg-blue-600
 rounded-full flex items-center justify-center text-white font-bold"
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.trip}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA - Sticky */}
      <div
        className="
  sticky bottom-0 z-50
  bg-slate-900/85
  backdrop-blur-xl
  border-t border-white/10
  shadow-2xl
"
      >
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white">
              <div className="font-bold text-lg">
                Sẵn sàng tạo lịch trình của riêng bạn?
              </div>
              <div className="text-slate-300 text-sm">
                Miễn phí và dễ dàng sử dụng ngay hôm nay!
              </div>
            </div>

            <button
              onClick={() => handleCreateTrip()}
              className="
          bg-blue-600 hover:bg-blue-500
          text-white
          px-8 py-3
          rounded-xl
          font-bold
          shadow-lg
          hover:shadow-xl
          flex items-center gap-3
        "
            >
              <PlusCircle size={20} />
              Bắt đầu tạo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
