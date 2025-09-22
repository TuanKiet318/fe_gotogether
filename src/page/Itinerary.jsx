import { useItinerary } from "../context/ItineraryContext";
import { Trash2 } from "lucide-react";

export default function Itinerary() {
  const { itinerary, removePlace } = useItinerary();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">📅 Lịch trình của bạn</h1>

      {itinerary.length === 0 ? (
        <p className="text-gray-600">Bạn chưa thêm địa điểm nào.</p>
      ) : (
        <div className="space-y-4">
          {itinerary.map((place, idx) => (
            <div
              key={place.id}
              className="p-4 rounded-lg border flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <p className="font-semibold">
                  {idx + 1}. {place.name}
                </p>
                <p className="text-sm text-gray-500">{place.category?.name}</p>
              </div>
              <button
                onClick={() => removePlace(place.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
