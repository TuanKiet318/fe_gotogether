// HeroSection.jsx
import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function HeroSection({ place }) {
  // Chuẩn hóa list ảnh: nhận cả string và { imageUrl }
  const images = useMemo(() => {
    if (!place) return [];
    const raw = Array.isArray(place.images) ? place.images : [];
    const urls = raw
      .map((it) => (typeof it === "string" ? it : it?.imageUrl))
      .filter(Boolean);
    return urls.length > 0 ? urls : place?.mainImage ? [place.mainImage] : [];
  }, [place]);

  if (!place || images.length === 0) {
    return (
      <div className="relative w-full h-[420px] md:h-[560px] lg:h-[600px]  overflow-hidden bg-gradient-to-r from-slate-200 to-slate-300 shadow-xl flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <ImageOff className="w-6 h-6" />
          <span>Không có hình ảnh</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-[420px] md:h-[560px] lg:h-[600px] overflow-hidden shadow-xl"
      style={{
        // Tinh chỉnh màu chủ đạo của Swiper qua CSS vars
        // (áp dụng cho bullets & focus states)
        ["--swiper-theme-color"]: "#2563eb",
        ["--swiper-navigation-size"]: "18px",
      }}
    >
      {/* Nút điều hướng custom */}
      <button
        className="hero-prev z-20 absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow ring-1 ring-black/5"
        aria-label="Ảnh trước"
      >
        <ChevronLeft className="w-5 h-5 text-slate-700" />
      </button>
      <button
        className="hero-next z-20 absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow ring-1 ring-black/5"
        aria-label="Ảnh sau"
      >
        <ChevronRight className="w-5 h-5 text-slate-700" />
      </button>

      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        navigation={{
          prevEl: ".hero-prev",
          nextEl: ".hero-next",
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet custom-bullet",
          bulletActiveClass:
            "swiper-pagination-bullet-active custom-bullet-active",
        }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop
        effect="fade"
        className="h-full w-full"
      >
        {images.map((src, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative w-full h-full">
              <img
                src={src}
                alt={`${place?.name || "Ảnh"} ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/1600x900/e5e7eb/6b7280?text=No+Image";
                }}
              />

              {/* Overlay nhiều lớp: gradient dưới + vignette viền */}
              <div className="pointer-events-none absolute inset-0">
                {/* Vignette viền tối rất nhẹ */}
                <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_30%,rgba(0,0,0,0.25)_100%)]" />
                {/* Gradient đáy để đọc text rõ ràng */}
                <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Tuỳ biến pagination chấm tròn (đặt phía dưới) */}
      <style>{`
        .custom-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255,255,255,0.6);
          opacity: 1;
          border-radius: 9999px;
          margin: 0 5px !important;
          transition: transform .2s ease, background .2s ease;
        }
        .custom-bullet-active {
          background: #fff;
          transform: scale(1.2);
        }
        .swiper-pagination {
          bottom: 14px !important;
        }
      `}</style>
    </div>
  );
}
