import React, { useState, useEffect } from "react";
import { X, MapPin, Star, Navigation } from "lucide-react";
import { getNearestPlacesByCategories } from "../service/tripService";

export default function SuggestedPlacesModal({
  placeId,
  placeName,
  onClose,
  onSelectPlace,
}) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    console.log("useEffect placeId:", placeId);
    fetchSuggestions();
  }, [placeId]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await getNearestPlacesByCategories(placeId);
      console.log("Raw API response:", response);
      const data = response?.data || response;
      console.log("Fetched suggestions:", data);
      setSuggestions(data?.categoryPlaces || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white shadow-2xl w-[90%] max-w-4xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Địa điểm đề xuất tiếp theo
              </h2>
              <p className="text-blue-100 flex items-center gap-2">
                <MapPin size={16} />
                Gần <span className="font-semibold">{placeName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                <p className="text-gray-500">Đang tìm địa điểm gần đây...</p>
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy địa điểm đề xuất</p>
            </div>
          ) : (
            <div className="space-y-6">
              {suggestions.map((item) => {
                const place = item.nearestPlace;
                return (
                  <div
                    key={place.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                  >
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        {item.category.name}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Navigation size={14} />
                        <span className="font-medium">{item.distance} km</span>
                      </span>
                    </div>

                    <div className="flex gap-4">
                      {/* Image */}
                      <img
                        src={
                          place.mainImage || "https://via.placeholder.com/150"
                        }
                        alt={place.name}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">
                          {place.name}
                        </h3>

                        {place.address && (
                          <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                            <MapPin size={14} />
                            <span className="truncate">{place.address}</span>
                          </p>
                        )}

                        {place.rating && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              <Star
                                size={16}
                                className="fill-yellow-400 text-yellow-400"
                              />
                              <span className="font-medium text-gray-700">
                                {place.rating.toFixed(1)}
                              </span>
                            </div>
                            {place.favoriteCount > 0 && (
                              <span className="text-sm text-gray-500">
                                • {place.favoriteCount} lượt thích
                              </span>
                            )}
                          </div>
                        )}

                        {place.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {place.description}
                          </p>
                        )}

                        <button
                          onClick={() => {
                            onSelectPlace({
                              id: place.id,
                              name: place.name,
                              address: place.address,
                              mainImage: place.mainImage,
                              description: place.description,
                              rating: place.rating,
                              lat: place.lat,
                              lng: place.lng,
                            });
                            onClose();
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                        >
                          <MapPin size={16} />
                          Thêm vào lịch trình
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
