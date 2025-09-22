// src/pages/TripDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItineraryById } from "../service/tripService";

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    if (!id) return;
    getItineraryById(id)
      .then((res) => setTrip(res)) // service đã return res.data
      .catch((err) => console.error("Lỗi tải chi tiết:", err));
  }, [id]);

  if (!trip) return <p className="p-6">Đang tải chi tiết lịch trình...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Quay lại
      </button>

      <h1 className="text-3xl font-bold">{trip.title}</h1>
      <p className="text-gray-600">
        {trip.startDate} → {trip.endDate}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Các hoạt động</h2>
      <ul className="space-y-3">
        {trip.items?.map((item) => (
          <li key={item.id} className="border rounded p-4 bg-white shadow-sm">
            <p>📍 {item.description}</p>
            <p>
              🕑 {item.startTime} → {item.endTime}
            </p>
            <p>💰 {item.estimatedCost ?? "N/A"}</p>
            <p>🚗 {item.transportMode ?? "N/A"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
