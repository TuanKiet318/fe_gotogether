import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRef, useEffect } from "react";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function LocationMap({ locations = [], hoveredId }) {
  const markerRefs = useRef({});

  useEffect(() => {
    if (!hoveredId) return;

    const marker = markerRefs.current[hoveredId];
    if (marker) {
      marker.openPopup(); // mở popup
    }
  }, [hoveredId]);

  return (
    <MapContainer
      center={[13.7822, 109.2191]}
      zoom={12}
      scrollWheelZoom={false}
      className="w-full h-full rounded-xl shadow-lg overflow-hidden"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          ref={(el) => (markerRefs.current[loc.id] = el)} // lưu ref marker
        >
          <Popup>
            <div className="space-y-1">
              {loc.image && (
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
              )}
              <h3 className="font-bold">{loc.name}</h3>
              <p className="text-xs text-gray-600 capitalize">
                {loc.category?.name}
              </p>
              {loc.rating && (
                <p className="text-xs text-yellow-600">
                  ⭐ {loc.rating} ({loc.reviews})
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
