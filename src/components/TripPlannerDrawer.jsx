// src/components/TripPlannerDrawer.jsx
import { usePlannerStore } from "../store/usePlannerStore";
import { X, Trash2 } from "lucide-react";
import { useState } from "react";

export default function TripPlannerDrawer({ isOpen, onClose }) {
  const { itinerary, setName, setDates, addPlaceToDay, removePlaceFromDay } =
    usePlannerStore();

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
        <input
          className="text-lg font-semibold outline-none border-b flex-1"
          value={itinerary.name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Ngày bắt đầu</label>
          <input
            type="date"
            value={itinerary.startDate}
            onChange={(e) => setDates(e.target.value, itinerary.endDate)}
            className="input"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ngày kết thúc</label>
          <input
            type="date"
            value={itinerary.endDate}
            onChange={(e) => setDates(itinerary.startDate, e.target.value)}
            className="input"
          />
        </div>

        <hr />

        <div className="space-y-6">
          {itinerary.days.map((day) => (
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
      </div>
    </div>
  );
}
