import React, { useState, useEffect, memo } from "react";
import PlaceCard from "./PlaceCard.jsx";
import {
  GetPlacesByDestination,
  GetAllCategories,
  GetPlacesByCategory,
  GetMyFavoritePlaces,
  SearchPlacesInDestination,
} from "../service/api.admin.service.jsx";
import { Heart } from "lucide-react";
import { LeafletMap } from "./LeafletMap.jsx"; // Import component map
import PlaceDetailModalWrapper from "./PlaceDetailModalWrapper";

const MemoizedPlaceCard = memo(PlaceCard);

export default function PlaceSidebar({
  destinationId,
  onSelectPlace,
  onPlacesChange,
}) {
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [selectedPlaceForDetail, setSelectedPlaceForDetail] = useState(null);

  /* ----- Fetch categories ----- */
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await GetAllCategories();
        setCategories(res || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  /* ----- Fetch places ----- */
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPlaces();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, destinationId, page, size, selectedCategory, showFavorites]);

  async function fetchPlaces() {
    try {
      if (!destinationId) return;

      if (searchQuery.trim()) {
        const res = await SearchPlacesInDestination(destinationId, searchQuery);
        const data = res?.data?.data || res?.data || res;

        const list = (data?.places || data || []).map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address || "",
          mainImage:
            p.mainImage || p.image || "https://via.placeholder.com/150",
          description: p.description || "Chưa có mô tả",
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          lat: p.latitude || p.lat || null,
          lng: p.longitude || p.lng || null,
        }));

        setPlaces(list);
        setTotalPages(1);
        if (onPlacesChange) onPlacesChange(list);
        return;
      }

      let list = [];
      let pages = 0;

      if (showFavorites) {
        const res = await GetMyFavoritePlaces();
        const favData = res?.data || res;
        list = (favData || []).map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address || "",
          mainImage: p.mainImage || "https://via.placeholder.com/150",
          description: p.description || "Chưa có mô tả",
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          lat: p.latitude || p.lat || null,
          lng: p.longitude || p.lng || null,
        }));
        pages = 1;
        setPage(0);
      } else if (selectedCategory) {
        const res = await GetPlacesByCategory(destinationId, selectedCategory);
        const catData = res;
        list = (catData?.places || []).map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address || "",
          mainImage:
            p.mainImage || p.image || "https://via.placeholder.com/150",
          description: p.description || "Chưa có mô tả",
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          lat: p.latitude || p.lat || null,
          lng: p.longitude || p.lng || null,
        }));
        pages = 1;
        setPage(0);
      } else {
        const res = await GetPlacesByDestination(
          destinationId,
          page,
          size,
          "name",
          "asc"
        );
        const pageData = res;
        list = (pageData?.content || []).map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address || "",
          mainImage:
            p.mainImage || p.image || "https://via.placeholder.com/150",
          description: p.description || "Chưa có mô tả",
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          lat: p.latitude || p.lat || null,
          lng: p.longitude || p.lng || null,
        }));
        pages = pageData?.totalPages || 0;
      }

      setPlaces(list);
      setTotalPages(pages);
      if (onPlacesChange) onPlacesChange(list);
    } catch (err) {
      console.error("Error fetching places:", err);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* LEFT COLUMN: Search + Places */}
      <div className="lg:col-span-2 space-y-4">
        {/* Thanh tìm kiếm */}
        <input
          type="text"
          placeholder="🔍 Tìm kiếm địa điểm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        {/* Thanh điều hướng danh mục */}
        <div className="w-full">
          <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-2 hide-scrollbar whitespace-nowrap min-h-fit">
            <button
              onClick={() => {
                setSelectedCategory("");
                setShowFavorites(false);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm transition ${
                !selectedCategory && !showFavorites
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Tất cả
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowFavorites(false);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}

            <button
              onClick={() => {
                setShowFavorites((prev) => !prev);
                setSelectedCategory("");
              }}
              className={`flex items-center justify-center gap-1 px-4 py-2 rounded-full border text-sm transition flex-shrink-0 ${
                showFavorites
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-red-50 hover:text-red-500"
              }`}
              title="Địa điểm yêu thích"
            >
              <Heart
                className={`w-4 h-4 ${
                  showFavorites ? "fill-white stroke-white" : "stroke-current"
                }`}
              />
              <span>Yêu thích</span>
            </button>
          </div>
        </div>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Danh sách địa điểm */}
        <div className="max-h-[600px] overflow-y-auto pr-2 mt-4 space-y-3">
          {places.length === 0 && (
            <p className="text-center text-gray-500">Không có địa điểm nào</p>
          )}
          {places.map((place, idx) => (
            <div
              key={place.id}
              className="relative group"
              onMouseEnter={() => setHoveredPlaceId(place.id)}
              onMouseLeave={() => setHoveredPlaceId(null)}
            >
              <MemoizedPlaceCard
                place={place}
                index={idx + 1 + page * size}
                onHover={(p) => setHoveredPlaceId(p?.id || null)}
                onClick={(p) => setSelectedPlaceForDetail(p)}
                disableNavigation={true}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPlace && onSelectPlace(place);
                }}
                className="absolute bottom-3 right-3 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-all shadow-lg opacity-0 group-hover:opacity-100"
              >
                + Thêm vào ngày
              </button>
            </div>
          ))}
        </div>

        {/* Phân trang */}
        {!selectedCategory && !showFavorites && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              ◀
            </button>
            <span className="text-sm">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Map */}
      <div className="h-full sticky top-0">
        <div
          className="bg-gray-100 overflow-hidden shadow-lg border border-gray-200"
          style={{ height: "100vh" }}
        >
          <LeafletMap
            places={places.filter((p) => p.lat && p.lng)}
            hoveredPlaceId={hoveredPlaceId}
            route={[]}
          />
        </div>
      </div>

      {/* Modal hiển thị chi tiết địa điểm */}
      {selectedPlaceForDetail && (
        <PlaceDetailModalWrapper
          placeId={selectedPlaceForDetail.id}
          onClose={() => setSelectedPlaceForDetail(null)}
        />
      )}
    </div>
  );
}
