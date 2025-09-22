// src/components/TripPlannerDrawer.jsx
import { useState, useEffect } from "react";
import { usePlannerStore } from "../store/usePlannerStore";
import { X, Trash2 } from "lucide-react";
import { getAllItineraries, getItineraryById } from "../service/tripService";

export default function TripPlannerDrawer({ isOpen, onClose }) {
  const {
    itinerary,
    setName,
    setDates,
    setItinerary,
    addPlaceToDay,
    removePlaceFromDay,
  } = usePlannerStore();

  const [trips, setTrips] = useState([]); // danh sách tất cả lịch trình
  const [selectedId, setSelectedId] = useState(""); // id lịch trình được chọn

  // load danh sách lịch trình khi mở drawer
  useEffect(() => {
    if (isOpen) {
      getAllItineraries()
        .then((res) => {
          setTrips(res); // res là mảng itineraries
        })
        .catch((err) =>
          console.error("Lỗi khi tải danh sách lịch trình:", err)
        );
    }
  }, [isOpen]);

  // khi chọn 1 lịch trình từ combobox
  const handleSelectTrip = async (id) => {
    setSelectedId(id);
    if (!id) return;

    try {
      const res = await getItineraryById(id);
      setItinerary(res); // set vào store để form hiển thị
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
      className={`fixed top-0 right-0 h-full w-[360px] bg-white shadow-xl transform transition-transform z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">Chỉnh sửa lịch trình</h3>
        <button onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Combobox chọn lịch trình */}
        <div>
          <label className="text-sm font-medium">Chọn lịch trình</label>
          <select
            className="w-full border rounded p-2"
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

        {/* Nếu đã chọn 1 trip thì hiển thị form edit */}
        {selectedId && (
          <>
            <div>
              <label className="text-sm font-medium">Tên lịch trình</label>
              <input
                className="w-full border rounded p-2"
                value={itinerary?.title || ""}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ngày bắt đầu</label>
              <input
                type="date"
                value={itinerary?.startDate || ""}
                onChange={(e) => setDates(e.target.value, itinerary.endDate)}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ngày kết thúc</label>
              <input
                type="date"
                value={itinerary?.endDate || ""}
                onChange={(e) => setDates(itinerary.startDate, e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>

            <hr />

            <div className="space-y-6">
              {itinerary?.days?.map((day) => (
                <div key={day.date}>
                  <h4 className="text-md font-bold mb-2">{day.date}</h4>
                  <ul className="pl-2 space-y-2">
                    {day.places.map((place) => (
                      <li
                        key={place.id}
                        className="flex items-center justify-between text-sm bg-slate-100 p-2 rounded"
                      >
                        {place.name}
                        <button
                          onClick={() => removePlaceFromDay(day.date, place.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 text-xs text-blue-600 underline"
                    onClick={() => handleAddMockPlace(day.date)}
                  >
                    + Thêm địa điểm
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
