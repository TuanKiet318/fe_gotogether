import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "../components/HeroSection";

import {
  Star,
  MapPin,
  Globe,
  Phone,
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Navigation,
  Award,
  ExternalLink,
  CalendarPlus,
} from "lucide-react";
import { GetPlaceDetail } from "../service/api.admin.service.jsx";

export default function PlaceDetail() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Fetch place detail data từ API như code gốc
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        const res = await GetPlaceDetail(id);
        let data = res.data || res; // để chắc chắn lấy đúng body trả về

        // Nếu chưa có reviews -> gắn data giả
        if (!data.reviews || data.reviews.length === 0) {
          data.reviews = [
            {
              id: 1,
              reviewer: "Phạm Minh Tuấn",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pham",
              rating: 5,
              date: "2024-02-15",
              comment:
                "Bảo tàng rất ấn tượng với nhiều hiện vật quý giá về triều đại Tây Sơn. Kiến trúc đẹp và thông tin được trình bày rất chi tiết.",
            },
            {
              id: 2,
              reviewer: "Nguyễn Thị Lan",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nguyen",
              rating: 4,
              date: "2024-02-10",
              comment:
                "Nơi tuyệt vời để tìm hiểu về lịch sử Việt Nam. Hướng dẫn viên rất nhiệt tình và am hiểu.",
            },
            {
              id: 3,
              reviewer: "Trần Văn Hùng",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tran",
              rating: 5,
              date: "2024-02-08",
              comment:
                "Di tích lịch sử quan trọng được bảo tồn rất tốt. Rất đáng để ghé thăm khi đến Bình Định.",
            },
          ];
        }

        setPlace(data);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu");
        console.error("Lỗi load place detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlace();
    }
  }, [id]);

  const nextImage = () => {
    if (place?.images?.length) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === place.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (place?.images?.length) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? place.images.length - 1 : prevIndex - 1
      );
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="w-4 h-4 fill-yellow-400/50 text-yellow-400"
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  const handleShare = async () => {
    if (navigator.share && place) {
      try {
        await navigator.share({
          title: place.name,
          text: place.description,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert("Đã sao chép link vào clipboard!");
      }
    }
  };

  const openInMaps = () => {
    if (place) {
      const url =
        place.lat && place.lng
          ? `https://www.google.com/maps?q=${place.lat},${place.lng}`
          : `https://www.google.com/maps?q=${encodeURIComponent(
              place.address || "Quy Nhon"
            )}`;
      window.open(url, "_blank");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-center">
              Đang tải thông tin địa điểm...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <div className="text-red-500 text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600">
              {error || "Không tìm thấy thông tin địa điểm"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section with Image Gallery */}
      <div className="mb-8 overflow-hidden shadow-lg">
        <HeroSection place={place} />
      </div>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 -mt-20 relative z-10 backdrop-blur-sm bg-white/95">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {place.category && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {place.category.name}
                  </span>
                )}
                {place.destination && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {place.destination.name}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {place.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(place.rating)}
                  <span className="text-lg font-semibold text-gray-700">
                    {place.rating}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>
                    {place.address || "123 Đường Nguyễn Huệ, TP. Quy Nhơn"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => addPlace(place)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-medium 
             bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md
             hover:from-sky-600 hover:to-blue-600 transition-all duration-300 
             mr-3"
            >
              <CalendarPlus className="w-5 h-5" />
              Thêm vào lịch trình
            </button>
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isLiked
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-red-50"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={openInMaps}
                className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200"
              >
                <Navigation className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            {/* Additional info */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Giới thiệu
            </h2>
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <p className="text-gray-700 leading-relaxed">
                {place.category?.name === "Di tích văn hóa"
                  ? "Đây là một di tích văn hóa quan trọng, nơi lưu giữ những giá trị lịch sử và văn hóa quý báu của dân tộc. Địa điểm này không chỉ có ý nghĩa giáo dục mà còn là nơi tham quan hấp dẫn cho du khách."
                  : "Một điểm đến tuyệt vời để khám phá và trải nghiệm. Nơi đây mang đến cho du khách những khoảnh khắc đáng nhớ và cơ hội tìm hiểu về văn hóa, lịch sử địa phương."}
              </p>
            </div>
          </div>

          {/* Highlights Section (fake data) */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Điểm nổi bật
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {[
                "View biển tuyệt đẹp, check-in sống ảo",
                "Hải sản tươi ngon, giá hợp lý",
                "Nhiều hoạt động ngoài trời: lặn biển, chèo SUP, trekking",
                "Không khí trong lành, gần gũi thiên nhiên",
              ].map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Travel Tips Section (fake data) */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Kinh nghiệm du lịch
            </h2>
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl space-y-2">
              {[
                "Nên đi vào sáng sớm hoặc chiều muộn để tránh nắng gắt",
                "Mang theo kem chống nắng, kính râm và mũ",
                "Chuẩn bị tiền mặt vì một số quán nhỏ không nhận thẻ",
                "Cuối tuần thường đông, nên đặt phòng/homestay trước",
              ].map((tip, idx) => (
                <p key={idx} className="text-sm text-gray-700">
                  💡 {tip}
                </p>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          {place.reviews && place.reviews.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Đánh giá từ du khách
              </h2>
              <div className="space-y-4">
                {place.reviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <img
                        src={review.avatar}
                        alt={review.reviewer}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {review.reviewer}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm font-medium text-gray-600">
                            {review.rating}/5
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nearby Places */}
        {place.nearbyPlaces && place.nearbyPlaces.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Địa điểm gần đây
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {place.nearbyPlaces.slice(0, 6).map((nearbyPlace) => (
                  <div key={nearbyPlace.id} className="group cursor-pointer">
                    <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={nearbyPlace.mainImage}
                          alt={nearbyPlace.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x200/e5e7eb/6b7280?text=No+Image";
                          }}
                        />
                        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 text-sm font-medium">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{nearbyPlace.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {nearbyPlace.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {nearbyPlace.address}
                        </p>
                        <p className="text-gray-700 text-sm line-clamp-2">
                          {nearbyPlace.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Vị trí trên bản đồ
            </h2>

            {/* Embedded Google Maps */}
            <div className="rounded-xl overflow-hidden shadow-lg border h-80 mb-4">
              <iframe
                src={
                  place.lat && place.lng
                    ? `https://www.google.com/maps?q=${place.lat},${place.lng}&output=embed&z=15`
                    : `https://www.google.com/maps?q=${encodeURIComponent(
                        place.address || "Quy Nhon"
                      )}&output=embed`
                }
                width="100%"
                height="100%"
                className="border-0"
                allowFullScreen=""
                loading="lazy"
                title="Bản đồ vị trí"
              ></iframe>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  📍 {place.address || "123 Đường Nguyễn Huệ, TP. Quy Nhơn"}
                </p>
                {place.lat && place.lng && (
                  <p className="text-gray-600 text-sm">
                    Tọa độ: {place.lat}°N, {place.lng}°E
                  </p>
                )}
              </div>
              <button
                onClick={openInMaps}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Mở Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
