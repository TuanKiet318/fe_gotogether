// src/components/TripPlannerDrawer.jsx
import { useState, useEffect } from "react";
import { usePlannerStore } from "../store/usePlannerStore";
import { X, Trash2, CalendarPlus, MapPin } from "lucide-react";
import { getAllItineraries, getItineraryById } from "../service/tripService";

export default function TripPlannerDrawer({ isOpen, onClose }) {
  const {
    itinerary,
    setDates,
    setItinerary,
    addPlaceToDay,
    removePlaceFromDay,
  } = usePlannerStore();

  const [trips, setTrips] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (isOpen) {
      getAllItineraries()
        .then((res) => setTrips(res))
        .catch((err) =>
          console.error("Lỗi khi tải danh sách lịch trình:", err)
        );
    }
  }, [isOpen]);

  const handleSelectTrip = async (id) => {
    setSelectedId(id);
    if (!id) return;

    try {
      const res = await getItineraryById(id);
      setItinerary(res);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết lịch trình:", err);
    }
  };

  const handleAddMockPlace = (date) => {
    const mockPlace = {
      id: Math.random().toString(),
      name: "Địa điểm thử nghiệm",
    };
    addPlaceToDay(date, mockPlace);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[380px] bg-gradient-to-b from-white to-gray-50 shadow-2xl border-l 
      transform transition-transform duration-300 ease-in-out z-50
      ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="sticky top-0 flex justify-between items-center px-5 py-4 border-b bg-gradient-to-r from-blue-500 to-indigo-500 text-white z-10 rounded-tl-2xl">
        <h3 className="text-lg font-semibold">🗺️ Quản lý lịch trình</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/20 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto h-[calc(100%-64px)]">
        {/* Combobox chọn lịch trình */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn lịch trình
          </label>
          <select
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={selectedId}
            onChange={(e) => handleSelectTrip(e.target.value)}
          >
            <option value="">-- Chọn lịch trình --</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Form edit nếu đã chọn lịch trình */}
        {selectedId && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={itinerary?.startDate || ""}
                  onChange={(e) =>
                    setDates(e.target.value, itinerary.endDate)
                  }
                  className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={itinerary?.endDate || ""}
                  onChange={(e) =>
                    setDates(itinerary.startDate, e.target.value)
                  }
                  className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Danh sách ngày */}
            <div className="space-y-6">
              {itinerary?.days?.map((day) => (
                <div
                  key={day.date}
                  className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-800">
                      📅 {day.date}
                    </h4>
                    <button
                      onClick={() => handleAddMockPlace(day.date)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-200 transition"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      Thêm địa điểm
                    </button>
                  </div>

                  <ul className="space-y-2">
                    {day.places.map((place) => (
                      <li
                        key={place.id}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100 transition"
                      >
                        <span className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          {place.name}
                        </span>
                        <button
                          onClick={() =>
                            removePlaceFromDay(day.date, place.id)
                          }
                          className="p-1 hover:bg-red-100 rounded transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
