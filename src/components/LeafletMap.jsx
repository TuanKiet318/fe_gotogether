import React, { useEffect, useRef } from "react";

// Component Map sử dụng Leaflet (không cần API key)
export function LeafletMap({ places = [], hoveredPlaceId = null, route = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLineRef = useRef(null);

  useEffect(() => {
    // Load Leaflet CSS và JS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    // Theo dõi thay đổi kích thước container
    let resizeObserver;
    if (mapRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          setTimeout(() => {
            mapInstanceRef.current.invalidateSize();
          }, 100);
        }
      });
      resizeObserver.observe(mapRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
      updateRoute();
    }
  }, [places, hoveredPlaceId, route]);

  // Handle map resize khi container thay đổi kích thước
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Đợi animation hoàn tất rồi invalidate size
      const timer = setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
        updateMarkers();
        updateRoute();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [places.length, route.length]);
  const initMap = () => {
    if (!mapRef.current || !window.L) return;

    // Default center (Ho Chi Minh City)
    const center = [10.8231, 106.6297];

    mapInstanceRef.current = window.L.map(mapRef.current, {
      center: center,
      zoom: 13,
      zoomControl: false,
    });

    // Add OpenStreetMap tiles (miễn phí)
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    updateMarkers();
    updateRoute();
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (places.length === 0) return;

    const bounds = [];

    places.forEach((place, index) => {
      // Kiểm tra có tọa độ hợp lệ
      if (!place.lat || !place.lng) return;

      const isHovered = place.id === hoveredPlaceId;
      const isRoute = route.some((r) => r.id === place.id);

      // Icon style
      let iconHtml = "";
      if (isRoute) {
        const routeIndex = route.findIndex((r) => r.id === place.id) + 1;
        iconHtml = `
    <div style="
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      width: ${isHovered ? "40px" : "36px"};
      height: ${isHovered ? "40px" : "36px"};
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: ${isHovered ? "16px" : "14px"};
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      transition: all 0.2s ease;
      ${isHovered ? "transform: scale(1.2); z-index: 1000;" : ""}
    ">
      ${routeIndex}
    </div>
  `;
      } else {
        iconHtml = `
    <div style="
      background: ${
        isHovered
          ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          : "linear-gradient(135deg, #64748b 0%, #475569 100%)"
      };
      width: ${isHovered ? "32px" : "28px"};
      height: ${isHovered ? "32px" : "28px"};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: ${
        isHovered
          ? "0 4px 12px rgba(59, 130, 246, 0.4)"
          : "0 2px 8px rgba(0,0,0,0.2)"
      };
      transition: all 0.2s ease;
      ${isHovered ? "transform: scale(1.2); z-index: 999;" : ""}
    "></div>
  `;
      }

      const icon = window.L.divIcon({
        html: iconHtml,
        className: "custom-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = window.L.marker([place.lat, place.lng], { icon }).addTo(
        mapInstanceRef.current
      );

      // Popup
      const popupContent = `
  <div style="min-width: 220px; max-width: 300px;">
    <h3 style="font-weight: 600; margin: 0 0 8px 0; font-size: 15px; color: #1e293b; line-height: 1.4;">
      ${place.name || place.placeName}
    </h3>
    ${
      place.address || place.placeAddress
        ? `<p style="margin: 0; font-size: 13px; color: #64748b; display: flex; align-items: start; gap: 6px;">
        <span style="flex-shrink: 0;">📍</span>
        <span style="line-height: 1.5;">${
          place.address || place.placeAddress
        }</span>
      </p>`
        : ""
    }
  </div>
`;
      marker.bindPopup(popupContent);

      if (isHovered) {
        marker.openPopup();
      }

      markersRef.current.push(marker);
      bounds.push([place.lat, place.lng]);
    });

    // Fit bounds
    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const updateRoute = () => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear old route
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (route.length < 2) return;

    const routeCoords = route
      .filter((r) => r.lat && r.lng)
      .map((r) => [r.lat, r.lng]);

    if (routeCoords.length < 2) return;

    routeLineRef.current = window.L.polyline(routeCoords, {
      color: "#ef4444",
      weight: 4,
      opacity: 0.7,
      smoothFactor: 1,
    }).addTo(mapInstanceRef.current);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg"></div>

      {places.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-sm">Chưa có địa điểm nào</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {(places.length > 0 || route.length > 0) && (
        <div className="absolute bottom-4 left-4 bg-white/98 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-gray-200 text-xs space-y-2">
          {places.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full border-2 border-white"></div>
              <span>Địa điểm</span>
            </div>
          )}
          {route.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              <span>Lịch trình</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Demo component
export default function MapDemo() {
  const [hoveredId, setHoveredId] = React.useState(null);

  const samplePlaces = [
    {
      id: 1,
      name: "Bến Thành Market",
      lat: 10.772,
      lng: 106.698,
      address: "Quận 1, TP.HCM",
    },
    {
      id: 2,
      name: "Notre-Dame Cathedral",
      lat: 10.7797,
      lng: 106.6991,
      address: "Quận 1, TP.HCM",
    },
    {
      id: 3,
      name: "Independence Palace",
      lat: 10.7769,
      lng: 106.6953,
      address: "Quận 1, TP.HCM",
    },
  ];

  const sampleRoute = [
    { id: 1, name: "Bến Thành Market", lat: 10.772, lng: 106.698 },
    { id: 2, name: "Notre-Dame Cathedral", lat: 10.7797, lng: 106.6991 },
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Leaflet Map Demo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Places list */}
        <div className="space-y-2">
          <h2 className="font-semibold">Danh sách địa điểm</h2>
          {samplePlaces.map((place) => (
            <div
              key={place.id}
              onMouseEnter={() => setHoveredId(place.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`p-3 border rounded-lg cursor-pointer transition ${
                hoveredId === place.id
                  ? "bg-blue-50 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <h3 className="font-medium">{place.name}</h3>
              <p className="text-sm text-gray-600">{place.address}</p>
            </div>
          ))}
        </div>

        {/* Right: Map */}
        <div className="h-[500px]">
          <LeafletMap
            places={samplePlaces}
            hoveredPlaceId={hoveredId}
            route={sampleRoute}
          />
        </div>
      </div>
    </div>
  );
}
