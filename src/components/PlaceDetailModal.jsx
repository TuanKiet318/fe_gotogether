import React from "react";
import { X, Star, MapPin } from "lucide-react";

export default function PlaceDetailModal({ place, onClose }) {
  if (!place) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full relative animate-fade-in">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Ảnh */}
        <img
          src={place.mainImage}
          alt={place.name}
          className="w-full h-64 object-cover rounded-t-2xl"
        />

        {/* Nội dung */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {place.name}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{place.rating}</span>
            <span className="text-gray-400">({place.reviews})</span>
          </div>

          <p className="text-gray-700 mb-3">{place.description}</p>

          <div className="flex items-center text-sm text-gray-600 gap-2">
            <MapPin className="w-4 h-4" />
            <span>{place.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
