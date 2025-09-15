import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";

export default function HeroSection({ place }) {
  if (!place || !place.images || place.images.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl ">
        No image available
      </div>
    );
  }

  return (
    <div className="relative h-[600px] overflow-hidden shadow-xl">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop={true}
        effect="fade" // bạn có thể đổi thành "slide", "cube", "coverflow"...
        className="h-full w-full"
      >
        {place.images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative w-full h-[600px]">
              <img
                src={img.imageUrl}
                alt={place.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/1200x600/e5e7eb/6b7280?text=No+Image";
                }}
              />
              {/* Overlay gradient để chữ dễ đọc */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              {/* Text hiển thị trên ảnh */}
              <div className="absolute bottom-8 left-8 text-white">
                <h1 className="text-3xl font-bold drop-shadow-lg">
                  {place.name}
                </h1>
                {place.description && (
                  <p className="max-w-xl mt-2 text-lg drop-shadow">
                    {place.description}
                  </p>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
