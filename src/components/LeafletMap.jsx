import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

/**
 * props:
 * - places: Array<{
 *     id, name|placeName, address|placeAddress, lat, lng,
 *     dayNumber?: number, orderInDay?: number,
 *     startTime?: string, endTime?: string,
 *     estimatedCost?: number,
 *     image?: string, placeImage?: string
 *   }>
 * - hoveredPlaceId?: string|number
 * - provider?: "esri-street" | "esri-imagery" | "google-roadmap" | "google-satellite" | "geoapify"
 * - geoapifyApiKey?: string        // chỉ cần khi provider="geoapify"
 * - mapStyle?: string              // chỉ áp dụng cho Geoapify (vd: "osm-bright", "carto-dark"...)
 * - language?: string              // chỉ áp dụng cho Geoapify (vd: "vi")
 */
function LeafletMap({
  places = [],
  hoveredPlaceId = null,
  provider = "esri-street",
  geoapifyApiKey,
  mapStyle = "osm-bright",
  language = "vi",
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]); // [{ id, marker }]
  const legendRef = useRef(null);
  const baseLayerRef = useRef(null); // giữ tham chiếu tile layer để thay đổi provider nếu cần

  /* -------------------- Days & Filter state (popover) -------------------- */
  const days = useMemo(() => {
    const s = new Set(
      (places || [])
        .filter((p) => p.lat && p.lng)
        .map((p) => Number(p.dayNumber) || 1)
    );
    return Array.from(s).sort((a, b) => a - b);
  }, [places]);

  const [selectedDays, setSelectedDays] = useState(new Set(days));
  useEffect(() => {
    setSelectedDays((prev) => {
      if (!prev || prev.size === 0) return new Set(days);
      const next = new Set([...prev].filter((d) => days.includes(d)));
      return next.size > 0 ? next : new Set(days);
    });
  }, [days.join(",")]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingDays, setPendingDays] = useState(new Set(days));
  useEffect(() => setPendingDays(new Set(selectedDays)), [selectedDays]);

  /* ------------------------------ Colors ------------------------------- */
  const dayColors = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#0ea5e9",
    "#22c55e",
    "#7c3aed",
  ];
  const colorForDay = (d) =>
    dayColors[(Math.max(1, Number(d) || 1) - 1) % dayColors.length];

  /* -------------------------- Tooltip styles --------------------------- */
  useEffect(() => {
    if (document.getElementById("leaflet-tooltip-style")) return;
    const style = document.createElement("style");
    style.id = "leaflet-tooltip-style";
    style.innerHTML = `
      .place-tooltip {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        color: #0f172a;
        border-radius: 12px;
        padding: 10px;
        box-shadow: 0 10px 24px rgba(0,0,0,.14);
        font-size: 12px;
      }
      .place-tooltip .title { font-weight:700; font-size: 13px; color:#0f172a; }
      .place-tooltip .row { display:flex; align-items:center; gap:8px; margin-top:4px; color:#6b7280; }
      .place-tooltip .img {
        width: 56px; height: 56px; border-radius: 10px; object-fit: cover; flex-shrink:0; background:#f1f5f9;
        box-shadow: 0 2px 6px rgba(0,0,0,.08);
      }
      .place-tooltip a.link {
        text-decoration:none; display:inline-flex; gap:6px; align-items:center; justify-content:center;
        background:#eff6ff; border:1px solid #dbeafe; color:#1d4ed8; padding:6px 8px; border-radius:8px;
        margin-top:8px; font-weight:700;
      }
      .place-tooltip .dot { width:10px; height:10px; border-radius:999px; display:inline-block; border:1px solid rgba(0,0,0,.08); }
    `;
    document.head.appendChild(style);
  }, []);

  /* -------------------------- Base layer helper ------------------------ */
  const buildBaseLayer = (L, map) => {
    // Gỡ base layer cũ (nếu có)
    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }

    let url = "";
    let options = { maxZoom: 20, attribution: "" };

    switch (provider) {
      case "google-roadmap": {
        url = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
        options.attribution = "© Google Maps";
        break;
      }
      case "google-satellite": {
        url = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
        options.attribution = "© Google Satellite";
        break;
      }
      case "esri-imagery": {
        url =
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        options.attribution =
          "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, GIS User Community";
        break;
      }
      case "esri-street":
      default: {
        url =
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
        options.attribution =
          "Tiles © Esri — Source: Esri, HERE, Garmin, FAO, NOAA, USGS, NGA, GEBCO, NPS";
        break;
      }
      case "geoapify": {
        if (!geoapifyApiKey) {
          console.warn(
            "LeafletMap: provider=geoapify nhưng thiếu geoapifyApiKey. Fallback sang esri-street."
          );
          url =
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
          options.attribution =
            "Tiles © Esri — Source: Esri, HERE, Garmin, FAO, NOAA, USGS, NGA, GEBCO, NPS";
          break;
        }
        url = `https://maps.geoapify.com/v1/tile/${mapStyle}/{z}/{x}/{y}.png?lang=${encodeURIComponent(
          language
        )}&apiKey=${encodeURIComponent(geoapifyApiKey)}`;
        options.attribution =
          "© OpenMapTiles © OpenStreetMap contributors • Powered by Geoapify";
        break;
      }
    }

    baseLayerRef.current = L.tileLayer(url, options).addTo(map);
  };

  /* -------------------------- Load Leaflet lib ------------------------- */
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapRef.current || !window.L || mapInstanceRef.current) return;
      const center = [16.047079, 108.20623]; // VN center
      const map = window.L.map(mapRef.current, {
        center,
        zoom: 6,
        zoomControl: false,
      });

      // Chọn base layer theo provider
      buildBaseLayer(window.L, map);

      mapInstanceRef.current = map;
      renderAll();
    };

    if (!window.L) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    let ro;
    if (mapRef.current) {
      ro = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          setTimeout(() => mapInstanceRef.current.invalidateSize(), 120);
        }
      });
      ro.observe(mapRef.current);
    }

    return () => {
      if (ro) ro.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // chỉ init một lần

  // Khi đổi provider / mapStyle / language / key -> thay base layer
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    buildBaseLayer(window.L, mapInstanceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, mapStyle, language, geoapifyApiKey]);

  /* ------------------------ Re-render conditions ----------------------- */
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const t = setTimeout(() => {
      mapInstanceRef.current.invalidateSize();
      renderAll();
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(places),
    hoveredPlaceId,
    JSON.stringify(Array.from(selectedDays)),
  ]);

  /* ------------------------------ Helpers ------------------------------ */
  const currency = (v) =>
    v == null ? "" : (Number(v) || 0).toLocaleString("vi-VN") + " đ";

  const makeMarkerIcon = (orderInDay, dayNumber, hovered = false) => {
    const color = colorForDay(dayNumber);
    const scale = hovered ? 1.12 : 1;
    const html = `
      <div style="position:relative;transform:scale(${scale});">
        <div style="
          display:flex;align-items:center;justify-content:center;
          width:32px;height:32px;border-radius:999px;
          background:#fff;border:3px solid ${color};
          color:#111827;font-weight:800;font-size:12px;
          box-shadow:0 4px 12px rgba(0,0,0,.20);
        ">
          ${orderInDay || 1}
        </div>
        <div style="
          position:absolute;top:-6px;right:-6px;
          background:${color};color:#fff;font-size:10px;
          padding:2px 6px;border-radius:10px;
          line-height:1;font-weight:700;
          box-shadow:0 2px 6px rgba(0,0,0,.15);
        ">
          D${dayNumber || 1}
        </div>
      </div>`;
    return window.L.divIcon({
      html,
      className: "custom-number-icon",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      tooltipAnchor: [0, -18],
    });
  };

  const clearLayers = () => {
    markersRef.current.forEach((m) => m.marker.remove());
    markersRef.current = [];
    if (legendRef.current) {
      mapInstanceRef.current.removeControl(legendRef.current);
      legendRef.current = null;
    }
  };

  /* ----------------------------- Renderer ------------------------------ */
  const renderAll = () => {
    if (!mapInstanceRef.current) return;
    clearLayers();

    const filtered = (places || [])
      .filter((p) => p.lat && p.lng)
      .filter((p) => selectedDays.has(Number(p.dayNumber) || 1));

    if (filtered.length === 0) return;

    // Liên tục orderInDay theo từng ngày khi thiếu
    const idxByDay = new Map();
    filtered.forEach((p) => {
      const d = Number(p.dayNumber) || 1;
      if (!idxByDay.has(d)) idxByDay.set(d, 1);
      if (!p.orderInDay || isNaN(Number(p.orderInDay))) {
        p.orderInDay = idxByDay.get(d);
        idxByDay.set(d, p.orderInDay + 1);
      } else {
        idxByDay.set(d, Math.max(idxByDay.get(d), Number(p.orderInDay) + 1));
      }
    });

    const bounds = [];
    filtered.forEach((p) => {
      const isHoveredFromList =
        hoveredPlaceId != null && String(p.id) === String(hoveredPlaceId);

      const icon = makeMarkerIcon(
        p.orderInDay,
        p.dayNumber || 1,
        isHoveredFromList
      );

      const marker = window.L.marker([p.lat, p.lng], {
        icon,
        zIndexOffset: isHoveredFromList ? 1000 : 0,
        bubblingMouseEvents: true,
      }).addTo(mapInstanceRef.current);

      const color = colorForDay(p.dayNumber || 1);
      const title = p.name || p.placeName || "Địa điểm";
      const addr = p.address || p.placeAddress || "";
      const timeStr =
        p.startTime || p.endTime
          ? `${p.startTime || ""}${p.endTime ? ` - ${p.endTime}` : ""}`
          : "";
      const costStr = currency(p.estimatedCost);
      const img = p.image || p.placeImage || "";

      const tooltipHtml = `
        <div class="place-tooltip">
          <div style="display:flex;gap:10px;align-items:center">
            ${img ? `<img class="img" src="${img}" alt="" />` : ""}
            <div style="min-width:160px;max-width:240px">
              <div class="title">${title}</div>
              <div class="row">
                <span class="dot" style="background:${color}"></span>
                <span>Ngày <b style="color:${color}">${
        p.dayNumber || 1
      }</b> • Thứ tự <b>${p.orderInDay || 1}</b></span>
              </div>
              ${
                timeStr
                  ? `<div class="row">🕒 <span>${timeStr}</span></div>`
                  : ""
              }
              ${
                costStr
                  ? `<div class="row" style="color:#047857">💰 <b>${costStr}</b></div>`
                  : ""
              }
              ${
                addr
                  ? `<div class="row" style="align-items:flex-start">📍 <span style="line-height:1.4">${addr}</span></div>`
                  : ""
              }
              <a target="_blank" rel="noreferrer"
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${title} ${addr}`
                )}"
                class="link">🧭 Mở Google Maps</a>
            </div>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipHtml, {
        direction: "top",
        opacity: 1,
        sticky: true,
        className: "place-tooltip",
      });

      marker.on("mouseover", () => marker.openTooltip());
      marker.on("mouseout", () => marker.closeTooltip());
      if (isHoveredFromList) marker.openTooltip();

      markersRef.current.push({ id: String(p.id), marker });
      bounds.push([p.lat, p.lng]);
    });

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [48, 48] });
    }

    const legendDays = Array.from(
      new Set(filtered.map((p) => Number(p.dayNumber) || 1))
    ).sort((a, b) => a - b);

    const legend = window.L.control({ position: "bottomleft" });
    legend.onAdd = () => {
      const div = window.L.DomUtil.create("div", "leaflet-control leaflet-bar");
      div.style.background = "white";
      div.style.padding = "8px 10px";
      div.style.borderRadius = "10px";
      div.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      div.style.fontSize = "12px";
      div.style.color = "#374151";
      div.innerHTML =
        `<div style="font-weight:700;margin-bottom:6px;">Chú thích</div>` +
        legendDays
          .map((d) => {
            const c = colorForDay(d);
            return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
              <span style="display:inline-block;width:12px;height:12px;border-radius:999px;background:${c};
                           border:1px solid rgba(0,0,0,0.1)"></span>
              <span>Ngày ${d}</span>
            </div>`;
          })
          .join("");
      return div;
    };
    legend.addTo(mapInstanceRef.current);
    legendRef.current = legend;
  };

  // Mở/đóng tooltip khi hover từ list
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const id = hoveredPlaceId != null ? String(hoveredPlaceId) : null;
    markersRef.current.forEach(({ id: mid, marker }) => {
      if (id && mid === id) marker.openTooltip();
      else marker.closeTooltip();
    });
  }, [hoveredPlaceId]);

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Filter days trigger + popover */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
        <button
          onClick={() => setFilterOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/95 backdrop-blur shadow-md hover:shadow-lg text-sm"
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg border bg-white">
            ⧉
          </span>
          Filter days
        </button>

        {filterOpen && (
          <>
            <div
              className="fixed inset-0 z-[999]"
              onClick={() => setFilterOpen(false)}
            />
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[1001] w-[280px] sm:w-[320px]">
              <div className="rounded-2xl border bg-white shadow-2xl">
                <div className="p-3 sm:p-4 border-b flex items-start justify-between">
                  <div className="text-sm font-semibold">
                    View itinerary by day
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm select-none">
                    <input
                      type="checkbox"
                      className="accent-blue-600 w-4 h-4"
                      checked={pendingDays.size === days.length}
                      onChange={(e) => {
                        if (e.target.checked) setPendingDays(new Set(days));
                        else setPendingDays(new Set());
                      }}
                    />
                    <span className="text-gray-700">Select all</span>
                  </label>
                </div>

                <div className="max-h-[260px] overflow-auto p-2 sm:p-3 space-y-2">
                  {days.map((d) => {
                    const checked = pendingDays.has(d);
                    return (
                      <label
                        key={d}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="accent-blue-600 w-4 h-4"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(pendingDays);
                            if (e.target.checked) next.add(d);
                            else next.delete(d);
                            setPendingDays(next);
                          }}
                        />
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full border"
                          style={{ borderColor: "#e5e7eb", background: "#fff" }}
                        >
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ background: colorForDay(d) }}
                          />
                        </span>
                        <span className="inline-flex items-center gap-2 text-sm">
                          <span
                            className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{
                              background: colorForDay(d) + "22",
                              color: "#111827",
                            }}
                          >
                            Day {d}
                          </span>
                          <span className="text-gray-500">(Untitled)</span>
                        </span>
                      </label>
                    );
                  })}
                  {days.length === 0 && (
                    <div className="text-sm text-gray-500 px-2 py-4 text-center">
                      No days to filter
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 border-t">
                  <button
                    onClick={() => setPendingDays(new Set(days))}
                    className="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDays(new Set(pendingDays));
                      setFilterOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm shadow"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {(!places || places.length === 0) && (
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
    </div>
  );
}

LeafletMap.propTypes = {
  places: PropTypes.array,
  hoveredPlaceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  provider: PropTypes.oneOf([
    "esri-street",
    "esri-imagery",
    "google-roadmap",
    "google-satellite",
    "geoapify",
  ]),
  geoapifyApiKey: PropTypes.string,
  mapStyle: PropTypes.string,
  language: PropTypes.string,
};

export default LeafletMap;
export { LeafletMap };
