import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import LocationMap from "../components/LocationMap.jsx";
import PlaceCard from "../components/PlaceCard.jsx";
import PlaceModal from "../components/PlaceModal.jsx";
import {
  GetAllCategories,
  GetPlacesByCategory,
} from "../service/api.admin.service.jsx";
import {
  HomeIcon,
  FireIcon,
  ShoppingBagIcon,
  MapIcon,
  UsersIcon,
  MapPinIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

const categoryIcons = {
  "cat-food": FireIcon,
  "cat-beach": HomeIcon,
  "cat-market": ShoppingBagIcon,
  "cat-temple": MapIcon,
  "cat-cultural": UsersIcon,
  "cat-nature": MapPinIcon,
  "cat-restaurant": FireIcon, // icon cho nhà hàng
};

export default function SearchCategoryPage() {
  const { category } = useParams(); // categoryId từ URL
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [searchLocation, setSearchLocation] = useState(
    searchParams.get("q") || "" // destinationId
  );

  const [sortOption, setSortOption] = useState("desc");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const openModal = (place) => setSelectedPlace(place);
  const closeModal = () => setSelectedPlace(null);

  // Sync state khi URL thay đổi
  useEffect(() => {
    setSelectedCategory(category || "");
    setSearchLocation(searchParams.get("q") || "");
  }, [category, searchParams]);

  // Load categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await GetAllCategories();
        if (res) setCategories(res);
      } catch (err) {
        console.error("Lỗi load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Load places từ API theo destination + category
  useEffect(() => {
    if (!searchLocation || !selectedCategory) return;
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const res = await GetPlacesByCategory("dest-quynhon", selectedCategory);
        if (res) setPlaces(res.places || []);
      } catch (err) {
        console.error("Lỗi load places:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [searchLocation, selectedCategory]);

  // Sort
  const filteredPlaces = [...places].sort((a, b) => {
    if (sortOption === "desc") return b.rating - a.rating;
    return a.rating - b.rating;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-xl">
            Kết quả cho "{searchLocation}"
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mt-4 opacity-90">
            Gợi ý hành trình, địa điểm ăn uống và trải nghiệm đáng nhớ
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Khám phá theo danh mục
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id];
            const isActive = String(selectedCategory) === String(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() =>
                  navigate(
                    `/category/${cat.id}?q=${encodeURIComponent(
                      searchLocation
                    )}`
                  )
                }
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 shadow-sm
                  ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                      : "bg-white hover:bg-gray-50 border-gray-200"
                  }`}
              >
                {Icon && (
                  <Icon
                    className={`w-7 h-7 mb-2 ${
                      isActive ? "text-white" : "text-blue-600"
                    }`}
                  />
                )}
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Filter */}
      <div className="max-w-5xl mx-auto px-4 mb-6 flex justify-end">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">
            Sắp xếp theo:
          </label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="desc">⭐ Rating: Cao → Thấp</option>
            <option value="asc">⭐ Rating: Thấp → Cao</option>
          </select>
        </div>
      </div>

      {/* Main content */}
      <section className="container mx-auto py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Danh sách địa điểm
            </h2>
            {loading ? (
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            ) : filteredPlaces.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {filteredPlaces.map((place, index) => {
                  const catObj = categories.find(
                    (c) => c.id === selectedCategory
                  );
                  return (
                    <div key={place.id} className="space-y-2">
                      {/* Category Tag */}
                      <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-md">
                        {catObj?.name || "Danh mục"}
                      </span>
                      <PlaceCard
                        place={place}
                        index={index + 1} // 👈 truyền thêm index
                        onClick={() => openModal(place, index)} // 👈 nếu muốn dùng index trong modal
                        onHover={(hoveredPlace) =>
                          setHoveredId(hoveredPlace?.id || null)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Không có địa điểm nào.</p>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="h-[600px] lg:sticky lg:top-24 rounded-xl overflow-hidden shadow-xl">
          <LocationMap locations={filteredPlaces} hoveredId={hoveredId} />
        </div>
      </section>

      {selectedPlace && (
        <PlaceModal place={selectedPlace} onClose={closeModal} />
      )}
    </div>
  );
}
