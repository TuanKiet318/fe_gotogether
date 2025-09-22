import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "../components/HeroSection";

import {
  Star,
  MapPin,
  Heart,
  Share2,
  Navigation,
  Award,
  CalendarDays,
  Info,
  Clock,
  Loader2,
  RefreshCw,
  Ticket,
  UtensilsCrossed,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ExternalLink,
  CalendarPlus,
} from "lucide-react";

import {
  GetPlaceDetail,
  AddFavoritePlace,
  RemoveFavoritePlace,
} from "../service/api.admin.service.jsx";

// ---------- Small UI helpers ----------
const SectionCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 ${className}`}
  >
    {children}
  </div>
);


const SectionTitle = ({ icon: Icon, children, right }) => (
  <div className="flex items-center justify-between gap-3 mb-6">
    <div className="flex items-center gap-2">
      {Icon && (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600">
          <Icon className="w-5 h-5" />
        </span>
      )}
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
        {children}
      </h2>
    </div>
    {right}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colorClass =
    color === "green"
      ? "bg-green-100 text-green-700"
      : color === "purple"
        ? "bg-purple-100 text-purple-700"
        : color === "amber"
          ? "bg-amber-100 text-amber-700"
          : "bg-blue-100 text-blue-700";
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colorClass}`}>
      {children}
    </span>
  );
};

const ShimmerLine = ({ width = "100%" }) => (
  <div
    className="animate-pulse rounded-md bg-slate-200"
    style={{ height: 12, width }}
  />
);

const StarRating = ({ value = 0, size = 16 }) => {
  const safe = Number.isFinite(value) ? value : 0;
  const full = Math.floor(safe);
  const half = safe % 1 !== 0;
  const empty = 5 - Math.ceil(safe);
  const sizeCls = `w-[${size}px] h-[${size}px]`;

  return (
    <div className="inline-flex items-center" aria-label={`Rating: ${safe}/5`}>
      {[...Array(full)].map((_, i) => (
        <Star key={`f-${i}`} className={`w-4 h-4 fill-yellow-400 text-yellow-400`} />
      ))}
      {half && <Star className={`w-4 h-4 fill-yellow-400/60 text-yellow-400`} />}
      {[...Array(empty)].map((_, i) => (
        <Star key={`e-${i}`} className={`w-4 h-4 text-slate-300`} />
      ))}
      <span className="ml-2 text-sm font-semibold text-slate-700">{safe}</span>
    </div>
  );
};

export default function PlaceDetail() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Like states
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  // Lightbox & Gallery state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const galleryImages = useMemo(() => {
    const arr = Array.isArray(place?.images) ? place.images : [];
    const urls = arr
      .map(it => (typeof it === "string" ? it : it?.imageUrl))
      .filter(Boolean);

    return urls.length > 0
      ? Array.from(new Set(urls))
      : (place?.mainImage ? [place.mainImage] : []);
  }, [place]);
  // Fetch place detail
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        const res = await GetPlaceDetail(id);
        const data = res?.data ?? res;

        // Seed demo reviews if none
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
              avatar:
                "https://api.dicebear.com/7.x/avataaars/svg?seed=Nguyen",
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
        setIsLiked(!!data.favorited);
        setLikeCount(data.favoriteCount ?? 0);
      } catch (err) {
        console.error("Lỗi load place detail:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlace();
  }, [id]);
  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i + 1) % galleryImages.length);
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLightboxOpen, galleryImages.length]);
  const openInMaps = () => {
    if (!place) return;
    const url =
      place.lat && place.lng
        ? `https://www.google.com/maps?q=${place.lat},${place.lng}`
        : `https://www.google.com/maps?q=${encodeURIComponent(
          place.address || "Quy Nhon"
        )}`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    if (!place) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: place.name,
          text: place.description,
          url: window.location.href,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        alert("Đã sao chép link vào clipboard!");
      } else {
        const dummy = document.createElement("input");
        dummy.value = window.location.href;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        alert("Đã sao chép link vào clipboard!");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể chia sẻ liên kết.");
    }
  };

  const toggleFavorite = async () => {
    if (likeLoading || !place) return;
    setLikeLoading(true);

    const next = !isLiked;
    // optimistic
    setIsLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));

    try {
      if (next) await AddFavoritePlace(place.id);
      else await RemoveFavoritePlace(place.id);
    } catch (err) {
      // rollback
      setIsLiked(!next);
      setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
      const status = err?.response?.status;
      if (status === 401) alert("Bạn cần đăng nhập để dùng tính năng yêu thích.");
      else alert("Không thể cập nhật yêu thích. Vui lòng thử lại.");
    } finally {
      setLikeLoading(false);
    }
  };

  // Precompute chips
  const infoChips = useMemo(() => {
    const chips = [];
    if (place?.category?.name) chips.push({ label: place.category.name, color: "blue" });
    if (place?.destination?.name) chips.push({ label: place.destination.name, color: "green" });
    if (place?.foundedYear) chips.push({ label: `Thành lập ${place.foundedYear}`, color: "amber" });
    return chips;
  }, [place]);

  // ---------- Loading & Error ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-24">
          <SectionCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 animate-pulse" />
              <ShimmerLine width="45%" />
            </div>
            <div className="space-y-3">
              <ShimmerLine width="90%" />
              <ShimmerLine width="85%" />
              <ShimmerLine width="70%" />
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-32 text-center">
          <SectionCard className="p-10">
            <div className="text-red-500 text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h2>
            <p className="text-slate-600">{error || "Không tìm thấy thông tin địa điểm"}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" /> Thử lại
            </button>
          </SectionCard>
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
      <div className="max-w-6xl mx-auto px-4">
        {/* Glass card header */}
        <SectionCard className="p-6 md:p-10 -mt-24 relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {infoChips.map((c, idx) => (
                  <Badge key={idx} color={c.color}>{c.label}</Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                {place.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-slate-700">
                <StarRating value={place.rating} />
                <div className="flex items-center text-slate-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="truncate max-w-[60ch]" title={place.address || "123 Đường Nguyễn Huệ, TP. Quy Nhơn"}>
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
                onClick={toggleFavorite}
                disabled={likeLoading}
                className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${isLiked
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                  } disabled:opacity-60`}
                aria-pressed={isLiked}
                title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
              >
                {likeLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4" style={isLiked ? { fill: "currentColor" } : undefined} />
                )}
                <span>{isLiked ? "Đã thích" : "Yêu thích"}</span>
                <span className="ml-1 text-xs opacity-80">{likeCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                title="Chia sẻ"
              >
                <Share2 className="w-4 h-4" /> Chia sẻ
              </button>

              <button
                onClick={openInMaps}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                <Navigation className="w-4 h-4" /> Mở Maps
              </button>
            </div>
          </div>

          {/* Intro */}
          <div className="mt-8">
            <SectionTitle icon={Info}>Giới thiệu</SectionTitle>
            <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <p className="text-slate-700 leading-relaxed">
                {place.category?.name === "Di tích văn hóa"
                  ? "Đây là một di tích văn hóa quan trọng, nơi lưu giữ những giá trị lịch sử và văn hóa quý báu của dân tộc. Địa điểm này không chỉ có ý nghĩa giáo dục mà còn là nơi tham quan hấp dẫn cho du khách."
                  : "Một điểm đến tuyệt vời để khám phá và trải nghiệm. Nơi đây mang đến cho du khách những khoảnh khắc đáng nhớ và cơ hội tìm hiểu về văn hóa, lịch sử địa phương."}
              </p>
            </div>
          </div>
          {/* Inline Gallery under Intro */}
          {galleryImages.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Hình ảnh nổi bật
                </h3>
                <span className="text-xs text-slate-500">Nhấp vào ảnh để phóng to</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {galleryImages.slice(0, 6).map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setLightboxIndex(idx); setIsLightboxOpen(true); }}
                    className="group relative aspect-video overflow-hidden rounded-xl border bg-slate-100"
                    aria-label="Mở ảnh lớn"
                  >
                    <img
                      src={src}
                      alt={`Ảnh ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] md:text-xs bg-black/50 text-white">
                      <Maximize2 className="w-3.5 h-3.5" /> Xem lớn
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </SectionCard>



        {/* Highlights & Tips */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <SectionCard className="p-6">
            <SectionTitle icon={Award}>Điểm nổi bật</SectionTitle>
            <ul className="grid gap-3 text-slate-700">
              {[
                "View biển tuyệt đẹp, check-in sống ảo",
                "Hải sản tươi ngon, giá hợp lý",
                "Nhiều hoạt động ngoài trời: lặn biển, chèo SUP, trekking",
                "Không khí trong lành, gần gũi thiên nhiên",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard className="p-6">
            <SectionTitle icon={Clock}>Kinh nghiệm du lịch</SectionTitle>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-2">
              {[
                "Nên đi vào sáng sớm hoặc chiều muộn để tránh nắng gắt",
                "Mang theo kem chống nắng, kính râm và mũ",
                "Chuẩn bị tiền mặt vì một số quán nhỏ không nhận thẻ",
                "Cuối tuần thường đông, nên đặt phòng/homestay trước",
              ].map((tip, idx) => (
                <p key={idx} className="text-sm text-slate-700">💡 {tip}</p>
              ))}
            </div>
          </SectionCard>
        </div>
        {/* Operating Hours & Ticket Pricing */}
        <SectionCard className="p-6 mt-8">
          <SectionTitle
            icon={Clock}
            right={
              <div className="flex gap-2 items-center text-sm text-slate-500">
                <Ticket className="w-4 h-4" />
                <span>Thông tin thiết yếu</span>
              </div>
            }
          >
            Giờ mở cửa & Giá vé
          </SectionTitle>

          {(() => {
            const openingHours = place?.openingHours ?? {
              mon: "08:00 – 17:00",
              tue: "08:00 – 17:00",
              wed: "08:00 – 17:00",
              thu: "08:00 – 17:00",
              fri: "08:00 – 17:00",
              sat: "08:00 – 18:00",
              sun: "08:00 – 18:00",
            };
            const ticket = place?.ticket ?? {
              adult: 40000,
              child: 20000,
              student: 25000,
              note: "Miễn phí tham quan thứ Hai đầu tiên mỗi tháng.",
            };
            const rows = [
              { d: "Thứ 2", v: openingHours.mon },
              { d: "Thứ 3", v: openingHours.tue },
              { d: "Thứ 4", v: openingHours.wed },
              { d: "Thứ 5", v: openingHours.thu },
              { d: "Thứ 6", v: openingHours.fri },
              { d: "Thứ 7", v: openingHours.sat },
              { d: "Chủ nhật", v: openingHours.sun },
            ];
            return (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-3">
                    Giờ mở cửa
                  </h3>
                  <div className="grid grid-cols-2 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                    {rows.map((r, i) => (
                      <div
                        key={r.d}
                        className={`px-4 py-3 ${i % 2 === 0 ? "bg-white" : ""
                          } border-b border-slate-100 col-span-2 grid grid-cols-2`}
                      >
                        <span className="text-slate-600">{r.d}</span>
                        <span className="text-right font-medium text-slate-900">
                          {r.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-3">
                    Giá vé tham khảo
                  </h3>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span>Người lớn</span>
                      <span className="font-semibold">
                        {ticket.adult.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Trẻ em</span>
                      <span className="font-semibold">
                        {ticket.child.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Sinh viên</span>
                      <span className="font-semibold">
                        {ticket.student.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 mt-3">ℹ️ {ticket.note}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </SectionCard>
        {/* Food Nearby */}
        <SectionCard className="p-6 mt-8">
          <SectionTitle icon={UtensilsCrossed}>Ăn gì gần đây?</SectionTitle>
          {(() => {
            const foods = place?.foodNearby ?? [
              {
                id: "f1",
                name: "Bún Cá Ngon 93",
                distance: "450m",
                price: "35.000–55.000đ",
                rating: 4.6,
                img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
                note: "Nước lèo ngọt thanh, chả cá dai.",
              },
              {
                id: "f2",
                name: "Hải Sản Tươi Mộc",
                distance: "1.1km",
                price: "65.000–200.000đ",
                rating: 4.5,
                img: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800&auto=format&fit=crop",
                note: "Mực nướng, hàu phô mai đáng thử.",
              },
              {
                id: "f3",
                name: "Cafe Biển Xanh",
                distance: "300m",
                price: "25.000–60.000đ",
                rating: 4.7,
                img: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop",
                note: "View biển, có chỗ đậu xe.",
              },
            ];
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {foods.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm"
                  >
                    <div className="h-36 overflow-hidden">
                      <img
                        src={f.img}
                        alt={f.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-slate-900 line-clamp-1">
                          {f.name}
                        </h4>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{f.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {f.distance} • {f.price}
                      </p>
                      <p className="text-sm text-slate-700 mt-2 line-clamp-2">
                        {f.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </SectionCard>

        {/* Reviews */}
        {place.reviews && place.reviews.length > 0 && (
          <SectionCard className="p-6 mt-8">
            <SectionTitle icon={CalendarDays} right={<span className="text-sm text-slate-500">{place.reviews.length} đánh giá</span>}>
              Đánh giá từ du khách
            </SectionTitle>
            <div className="grid md:grid-cols-2 gap-5">
              {place.reviews.slice(0, 2).map((review) => (
                <div key={review.id} className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <img
                      src={review.avatar}
                      alt={review.reviewer}
                      className="w-10 h-10 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <h4 className="font-semibold text-slate-900 truncate" title={review.reviewer}>
                          {review.reviewer}
                        </h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(review.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex items-center mb-2">
                        <StarRating value={review.rating} />
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Nearby places */}
        {place.nearbyPlaces && place.nearbyPlaces.length > 0 && (
          <SectionCard className="p-6 mt-8">
            <SectionTitle icon={MapPin}>Địa điểm gần đây</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {place.nearbyPlaces.slice(0, 6).map((np) => (
                <div key={np.id} className="group cursor-pointer">
                  <div className="rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5">
                    <div className="relative h-48">
                      <img
                        src={np.mainImage}
                        alt={np.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/300x200/e5e7eb/6b7280?text=No+Image";
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-sm font-medium shadow">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span>{np.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600">
                        {np.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-1 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        <span className="line-clamp-1">{np.address}</span>
                      </p>
                      <p className="text-slate-700 text-sm line-clamp-2">{np.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Map */}
        <SectionCard className="p-6 mt-8">
          <SectionTitle icon={MapPin}>Vị trí trên bản đồ</SectionTitle>
          <div className="rounded-xl overflow-hidden shadow border h-80 mb-4">
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
            />
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border">
            <div>
              <p className="font-semibold text-slate-900 mb-1">
                📍 {place.address || "123 Đường Nguyễn Huệ, TP. Quy Nhơn"}
              </p>
              {place.lat && place.lng && (
                <p className="text-slate-600 text-sm">
                  Tọa độ: {place.lat}°N, {place.lng}°E
                </p>
              )}
            </div>
            <button
              onClick={openInMaps}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              <Navigation className="w-4 h-4" /> Mở Google Maps
            </button>
          </div>
        </SectionCard>

        <div className="h-12" />
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Close */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev */}
          {galleryImages.length > 1 && (
            <button
              onClick={() => setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)}
              className="absolute left-4 md:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          {/* Next */}
          {galleryImages.length > 1 && (
            <button
              onClick={() => setLightboxIndex((i) => (i + 1) % galleryImages.length)}
              className="absolute right-4 md:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
              aria-label="Ảnh kế"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {/* Image */}
          <div className="max-w-[92vw] max-h-[86vh]">
            <img
              src={galleryImages[lightboxIndex]}
              alt={`Ảnh ${lightboxIndex + 1}`}
              className="w-full h-full object-contain select-none"
            />
          </div>
        </div>
      )}

    </div>
  );
}
