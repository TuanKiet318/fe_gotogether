import React from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Hàm lấy tọa độ từ item (giả sử có item.placeLat, item.placeLng)
function getLatLng(item) {
  // Nếu chưa có dữ liệu thật, trả về tọa độ mặc định (Hà Nội)
  return item.placeLat && item.placeLng
    ? [item.placeLat, item.placeLng]
    : [21.028511, 105.804817];
}

export default function ItineraryMap({ days, selectedDay, onSelectDay }) {
  // Hiển thị các điểm của ngày được chọn, nếu không thì ngày đầu tiên
  const day =
    days.find((d) => d.dayNumber === selectedDay) || days[0] || { items: [] };
  const positions = day.items.map(getLatLng);

  // Tính trung tâm bản đồ
  const center =
    positions.length > 0
      ? positions[0]
      : [21.028511, 105.804817]; // Hà Nội mặc định

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <div className="flex gap-2 mb-2">
        {days.map((d) => (
          <button
            key={d.dayNumber}
            className={`px-3 py-1 rounded ${
              selectedDay === d.dayNumber
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => onSelectDay(d.dayNumber)}
          >
            Ngày {d.dayNumber}
          </button>
        ))}
      </div>
      <MapContainer center={center} zoom={13} style={{ height: "350px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        {positions.map((pos, idx) => (
          <Marker key={idx} position={pos}>
            <Popup>
              {day.items[idx]?.placeName || "Địa điểm"}
              <br />
              {day.items[idx]?.placeAddress || ""}
            </Popup>
          </Marker>
        ))}
        {positions.length > 1 && <Polyline positions={positions} color="blue" />}
      </MapContainer>
    </div>
  );
}