import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPinIcon,
  BuildingStorefrontIcon,
  CakeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const DestinationCard = ({ destination }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/destination/${destination.id}`);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={handleCardClick}
    >
      {/* Badge phổ biến */}
      {destination.totalPlaces > 10 && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Phổ biến
          </span>
        </div>
      )}

      {/* Hình ảnh */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={destination.mainImage || "/images/default-destination.jpg"}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Nội dung */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {destination.name}
          </h3>
          {/* Rating (nếu có) */}
          {destination.averageRating && (
            <div className="flex items-center bg-blue-50 px-2 py-1 rounded-lg">
              <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="font-bold text-gray-900">
                {destination.averageRating}
              </span>
            </div>
          )}
        </div>

        {/* Địa điểm */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="w-5 h-5 mr-2 text-blue-500" />
          <span className="text-sm">{destination.country || "Việt Nam"}</span>
        </div>

        {/* Mô tả */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {destination.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Xem chi tiết button */}
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center group-hover:underline">
            Xem chi tiết
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Hiệu ứng hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-2xl transition-all duration-300 pointer-events-none" />
    </div>
  );
};

export default DestinationCard;
