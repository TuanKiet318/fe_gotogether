import { CalendarDaysIcon, MapIcon } from "@heroicons/react/24/outline";

export default function ItineraryCard({ itinerary }) {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition group cursor-pointer">
      {/* Tiêu đề */}
      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
        {itinerary.title}
      </h3>

      {/* Thời gian */}
      <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
        <CalendarDaysIcon className="w-5 h-5" />
        <span>
          {itinerary.startDate} → {itinerary.endDate}
        </span>
      </div>

      {/* Số hoạt động */}
      <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
        <MapIcon className="w-5 h-5" />
        <span>{itinerary.totalItems} hoạt động</span>
      </div>

      {/* Nút xem chi tiết */}
      <div className="mt-4">
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform"
          onClick={() => {
            console.log("Xem chi tiết:", itinerary.id);
          }}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
