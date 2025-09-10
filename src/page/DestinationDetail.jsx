import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Slider from "react-slick";
import { Star, MapPin, Globe, Quote } from "lucide-react";
import { GetPlaceDetail } from "../service/api.admin.service.jsx";

export default function DestinationDetail() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const res = await GetPlaceDetail(id);
        let data = res.data || res; // để chắc chắn lấy đúng body trả về

        // Nếu chưa có reviews -> gắn data giả
        if (!data.reviews || data.reviews.length === 0) {
          data.reviews = [
            {
              reviewer: "Nguyễn Văn A",
              comment:
                "Địa điểm rất đẹp, phong cảnh hữu tình và dịch vụ chu đáo. Rất đáng để trải nghiệm!",
            },
            {
              reviewer: "Trần Thị B",
              comment:
                "Mình đã có chuyến đi tuyệt vời cùng gia đình ở đây. Không gian yên bình và thoải mái.",
            },
            {
              reviewer: "Lê Minh C",
              comment:
                "Khá ấn tượng với cách phục vụ chuyên nghiệp. Tuy nhiên đường đi hơi khó tìm.",
            },
          ];
        }

        setPlace(data);
      } catch (err) {
        console.error("Lỗi load place detail:", err);
      }
    };
    fetchPlace();
  }, [id]);

  if (!place) {
    return (
      <p className="p-6 text-gray-500 text-center text-lg font-medium">
        Đang tải dữ liệu...
      </p>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Carousel */}
      <div className="relative max-w-7xl mx-auto px-4">
        <Slider {...sliderSettings}>
          {place.images?.map((img, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl relative aspect-[16/9]"
            >
              <img
                src={img.imageUrl}
                alt={`${place.name} ${index}`}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          ))}
        </Slider>

        {/* Info Card */}
        <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-sm p-4 md:p-6 
                  rounded-2xl shadow-lg max-w-md text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{place.name}</h1>
          {place.category?.name && (
            <span className="inline-block bg-red-500 px-3 py-1 rounded-full text-sm font-semibold uppercase">
              {place.category.name}
            </span>
          )}
          <div className="flex items-center mt-3 gap-2 text-base">
            <Star className="w-5 h-5 text-yellow-400" />
            <span>{place.rating}</span>
            <span className="text-gray-300">({place.reviews?.length || 0} đánh giá)</span>
          </div>
        </div>
      </div>




      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto p-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Nội dung chính */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b pb-2">
                Giới thiệu
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">{place.description}</p>
            </section>

            <section className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
                Đánh giá
              </h2>

              {place.reviews?.length > 0 ? (
                place.reviews.map((r, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 p-6 rounded-2xl shadow-sm mb-6 hover:bg-gray-100 transition-colors"
                  >
                    {/* Rating stars */}
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-5 h-5 ${idx < (r.rating || 4)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600 font-medium">
                        {r.rating || 4}/5
                      </span>
                    </div>

                    {/* Comment */}
                    <p className="italic text-gray-700 flex gap-2 items-start leading-relaxed">
                      <Quote className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                      {r.comment}
                    </p>

                    {/* Reviewer */}
                    <p className="mt-3 text-sm text-gray-600 font-semibold">
                      – {r.reviewer}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Chưa có đánh giá nào.</p>
              )}
            </section>


            <section className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b pb-2">
                Bản đồ
              </h2>
              <div className="w-full h-96 rounded-2xl overflow-hidden shadow-md border">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    place.address
                  )}&output=embed`}
                  width="100%"
                  height="100%"
                  className="border-0"
                  allowFullScreen=""
                  loading="lazy"
                  title="Google Maps"
                ></iframe>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 space-y-5 h-fit sticky top-8">
            <h2 className="text-2xl font-semibold text-gray-800">Thông tin liên hệ</h2>

            {/* Địa chỉ */}
            <p className="flex items-center gap-3 text-gray-700 text-lg">
              <MapPin className="w-5 h-5 text-red-500" /> {place.address || "123 Đường Nguyễn Huệ, TP. Quy Nhơn"}
            </p>

            {/* Số điện thoại (fake) */}
            <p className="flex items-center gap-3 text-gray-700 text-lg">
              <span className="w-5 h-5 text-green-500">📞</span> {place.phone || "0901 234 567"}
            </p>

            {/* Email (fake) */}
            <p className="flex items-center gap-3 text-gray-700 text-lg">
              <span className="w-5 h-5 text-indigo-500">✉️</span> {place.email || "contact@travelviet.vn"}
            </p>

            {/* Link Google Maps */}
            {place.link ? (
              <a
                href={place.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-blue-600 font-medium hover:underline text-lg"
              >
                <Globe className="w-5 h-5 text-blue-500" /> Xem trên Google Maps
              </a>
            ) : (
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(place.address || "Quy Nhơn")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-blue-600 font-medium hover:underline text-lg"
              >
                <Globe className="w-5 h-5 text-blue-500" /> Xem trên Google Maps
              </a>
            )}
          </aside>

        </div>
      </main>
    </div>
  );
}
