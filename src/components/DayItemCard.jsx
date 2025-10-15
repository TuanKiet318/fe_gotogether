import React from "react";
import { Clock, MapPin, DollarSign, Trash2 } from "lucide-react";

export default function DayItemCard({ item, onRemove, onUpdate, onClick }) {
  return (
    <div
      className="p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onClick?.(item)}
      style={{ cursor: "pointer" }}
    >
      {/* Header với ảnh và tên */}
      <div className="flex gap-3 mb-2">
        <img
          src={item.placeImage}
          alt={item.placeName}
          className="w-16 h-16 object-cover rounded"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{item.placeName}</h4>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {item.placeAddress || "Địa chỉ không xác định"}
          </p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 h-fit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Thời gian */}
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-blue-600" />
        <input
          type="time"
          value={item.startTime || ""}
          onChange={(e) => onUpdate(item.id, { startTime: e.target.value })}
          className="border rounded px-2 py-1 text-xs"
        />
        <span className="text-xs">→</span>
        <input
          type="time"
          value={item.endTime || ""}
          onChange={(e) => onUpdate(item.id, { endTime: e.target.value })}
          className="border rounded px-2 py-1 text-xs"
        />
      </div>

      {/* Phương tiện & Chi phí */}
      <div className="flex gap-2 mb-2">
        <select
          value={item.transportMode || ""}
          onChange={(e) => onUpdate(item.id, { transportMode: e.target.value })}
          className="flex-1 border rounded px-2 py-1 text-xs"
        >
          <option value="">Phương tiện</option>
          <option value="WALK">🚶 Đi bộ</option>
          <option value="BIKE">🏍️ Xe máy</option>
          <option value="CAR">🚗 Ô tô</option>
          <option value="BUS">🚌 Xe buýt</option>
          <option value="BOAT">⛴️ Thuyền</option>
          <option value="TRAIN">🚆 Tàu hỏa</option>
          <option value="FLIGHT">✈️ Máy bay</option>
        </select>

        <div className="flex items-center gap-1 border rounded px-2">
          <DollarSign className="w-3 h-3 text-green-600" />
          <input
            type="number"
            value={item.estimatedCost || ""}
            onChange={(e) =>
              onUpdate(item.id, { estimatedCost: parseFloat(e.target.value) })
            }
            placeholder="0"
            className="w-16 text-xs outline-none"
          />
        </div>
      </div>

      {/* Mô tả */}
      <textarea
        value={item.description || ""}
        onChange={(e) => onUpdate(item.id, { description: e.target.value })}
        placeholder="Ghi chú cho hoạt động này..."
        className="w-full border rounded px-2 py-1 text-xs resize-none"
        rows={2}
      />
    </div>
  );
}
