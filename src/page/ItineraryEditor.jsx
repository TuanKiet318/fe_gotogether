import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LeafletMap } from "../components/LeafletMap.jsx";
import {
  Save,
  Loader2,
  CheckCircle,
  LogOut,
  MoreVertical,
  Plus,
  Trash2,
  Eye,
  MapPin,
  EyeOff,
} from "lucide-react";
import instance from "../service/axios.admin.customize";
import {
  GetItineraryDetail,
  DeleteItineraryItem,
} from "../service/api.admin.service";
import {
  insertDaysAfter,
  insertDaysBefore,
  deleteDay,
} from "../service/tripService";
import PlaceSidebar from "../components/PlaceSidebar.jsx";
import DayItemCard from "../components/DayItemCard.jsx";
import PlaceDetailModal from "../components/PlaceDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/* ------------------- HELPER ------------------- */
function generateDays(startDate, endDate, items) {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];

  for (
    let d = new Date(start), i = 1;
    d <= end;
    d.setDate(d.getDate() + 1), i++
  ) {
    const dateStr = d.toISOString().split("T")[0];
    const dayItems = (items || [])
      .filter((it) => it.date === dateStr || it.dayNumber === i)
      .map((it, idx) => {
        const place = it.place || {}; // <-- thêm dòng này
        return {
          id: it.id || `item-${Math.random()}`,
          placeId: it.placeId || place.id,
          placeName: it.placeName || place.name || "Địa điểm không xác định",
          placeAddress: it.placeAddress || place.address || "",
          placeImage:
            it.placeImage ||
            place.mainImage ||
            "https://via.placeholder.com/150",
          dayNumber: it.dayNumber || i,
          orderInDay: it.orderInDay || idx + 1,
          startTime: it.startTime || null,
          endTime: it.endTime || null,
          description: it.description || "",
          estimatedCost: it.estimatedCost || null,
          transportMode: it.transportMode || null,
          lat: it.lat || place.lat || null,
          lng: it.lng || place.lng || null,
          isNew: false,
          isModified: false,
        };
      });

    days.push({ dayNumber: i, date: dateStr, items: dayItems });
  }

  return days;
}

function cleanPlaceId(placeId) {
  return placeId;
}

/* ------------------- COMPONENT ------------------- */
export default function ItineraryEditor({ itineraryId: propItineraryId }) {
  const params = useParams();
  const itineraryId = propItineraryId || params.id;
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [mapSize, setMapSize] = useState("default");
  // showMapMenu sẽ được quản lý trong itinerary state
  /* ----- FETCH ITINERARY ----- */
  useEffect(() => {
    if (!itineraryId) {
      setLoading(false);
      return;
    }
    async function fetchData() {
      try {
        setLoading(true);
        const response = await GetItineraryDetail(itineraryId);
        const data = response?.data || response;

        if (!data) {
          setItinerary(null);
          return;
        }

        const days = generateDays(
          data.startDate,
          data.endDate,
          data.items || []
        );

        setItinerary({
          id: data.id,
          title: data.title,
          startDate: data.startDate,
          endDate: data.endDate,
          destination: data.destination?.name || data.destinationName || "",
          destinationId: data.destination?.id || data.destinationId,
          days,
          showMapMenu: false,
        });
      } catch (err) {
        console.error("Error fetching itinerary:", err);
        setItinerary(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [itineraryId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setItinerary((prev) => ({ ...prev, activeMenu: null }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ----- QUẢN LÝ NGÀY (THÊM / XOÁ) ----- */
  const handleAddDayBefore = async (dayNumber) => {
    if (!itineraryId) return;
    try {
      await insertDaysBefore(itineraryId, dayNumber, 1);
      const res = await GetItineraryDetail(itineraryId);
      const data = res?.data || res;
      const days = generateDays(data.startDate, data.endDate, data.items || []);
      setItinerary((prev) => ({ ...prev, days }));
    } catch (err) {
      console.error("Error adding day before:", err);
      alert("Không thể thêm ngày trước. Vui lòng thử lại.");
    }
  };

  const handleAddDayAfter = async (dayNumber) => {
    if (!itineraryId) return;
    try {
      await insertDaysAfter(itineraryId, dayNumber, 1);
      const res = await GetItineraryDetail(itineraryId);
      const data = res?.data || res;
      const days = generateDays(data.startDate, data.endDate, data.items || []);
      setItinerary((prev) => ({ ...prev, days }));
    } catch (err) {
      console.error("Error adding day after:", err);
      alert("Không thể thêm ngày sau. Vui lòng thử lại.");
    }
  };

  const handleDeleteDay = async (dayNumber) => {
    if (!itineraryId) return;
    if (!window.confirm(`Bạn có chắc muốn xóa ngày ${dayNumber}?`)) return;

    try {
      await deleteDay(itineraryId, dayNumber);
      const res = await GetItineraryDetail(itineraryId);
      const data = res?.data || res;
      const days = generateDays(data.startDate, data.endDate, data.items || []);
      setItinerary((prev) => ({ ...prev, days }));
    } catch (err) {
      console.error("Error deleting day:", err);
      alert("Không thể xoá ngày. Vui lòng thử lại.");
    }
  };

  /* ----- THÊM ĐỊA ĐIỂM VÀO NGÀY ----- */
  const handleAddPlaceToDay = (dayNumber, place) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const newDays = JSON.parse(JSON.stringify(prev.days));

      const targetDay = newDays.find((d) => d.dayNumber === dayNumber);
      if (!targetDay) return prev;

      const newItem = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        placeId: place.id,
        placeName: place.name,
        placeAddress: place.address || "",
        placeImage: place.mainImage || "https://via.placeholder.com/150",
        placeDescription: place.description || "Chưa có mô tả",
        placeRating: place.rating || 0,
        placeReviews: place.reviews || 0,
        dayNumber: targetDay.dayNumber,
        orderInDay: targetDay.items.length + 1,
        startTime: "09:00",
        endTime: "11:00",
        description: "",
        estimatedCost: 0,
        transportMode: "WALK",
        lat: place.lat || null,
        lng: place.lng || null,
        isNew: true,
        isModified: false,
      };

      targetDay.items.push(newItem);
      setHasUnsavedChanges(true);

      return { ...prev, days: newDays };
    });
  };

  /* ----- SAVE ITINERARY ----- */
  const handleSave = async () => {
    if (!itinerary || !itineraryId) return;

    try {
      setSaving(true);
      setSaveStatus(null);

      const newItems = [];
      const modifiedItems = [];

      itinerary.days.forEach((day) => {
        day.items.forEach((item) => {
          if (item.isNew) {
            newItems.push({
              placeId: cleanPlaceId(item.placeId),
              dayNumber: item.dayNumber,
              orderInDay: item.orderInDay,
              startTime: item.startTime,
              endTime: item.endTime,
              description: item.description,
              estimatedCost: item.estimatedCost,
              transportMode: item.transportMode,
            });
          } else if (item.isModified) {
            modifiedItems.push({
              id: item.id,
              dayNumber: item.dayNumber,
              orderInDay: item.orderInDay,
              startTime: item.startTime,
              endTime: item.endTime,
              description: item.description,
              estimatedCost: item.estimatedCost,
              transportMode: item.transportMode,
            });
          }
        });
      });

      console.log("Saving changes:", {
        newItemsCount: newItems.length,
        modifiedItemsCount: modifiedItems.length,
      });

      // 1. Create new items
      if (newItems.length > 0) {
        for (const itemData of newItems) {
          try {
            await instance.post(`/itineraries/${itineraryId}/items`, itemData);
          } catch (err) {
            console.error("Failed to create item:", itemData, err);
            throw err;
          }
        }
      }

      // 2. Update modified items
      if (modifiedItems.length > 0) {
        for (const item of modifiedItems) {
          try {
            await instance.patch(
              `/itineraries/${itineraryId}/items/${item.id}`,
              {
                dayNumber: item.dayNumber,
                orderInDay: item.orderInDay,
                startTime: item.startTime,
                endTime: item.endTime,
                description: item.description,
                estimatedCost: item.estimatedCost,
                transportMode: item.transportMode,
              }
            );
          } catch (err) {
            console.error("Failed to update item:", item, err);
            throw err;
          }
        }
      }

      setHasUnsavedChanges(false);
      setSaveStatus("success");

      // Reload data
      const response = await GetItineraryDetail(itineraryId);
      const data = response?.data || response;
      const days = generateDays(data.startDate, data.endDate, data.items || []);
      setItinerary((prev) => ({ ...prev, days }));

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Error saving itinerary:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  /* ----- UPDATE ITEM ----- */
  const updateItem = (itemId, updates) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const newDays = prev.days.map((day) => ({
        ...day,
        items: day.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                ...updates,
                isModified: !item.isNew ? true : item.isModified,
              }
            : item
        ),
      }));
      setHasUnsavedChanges(true);
      return { ...prev, days: newDays };
    });
  };

  /* ----- REMOVE ITEM ----- */
  const removeItem = async (itemId) => {
    const item = itinerary.days
      .flatMap((d) => d.items)
      .find((it) => it.id === itemId);

    if (item?.isNew) {
      setItinerary((prev) => {
        if (!prev) return prev;
        const newDays = prev.days.map((day) => ({
          ...day,
          items: day.items.filter((item) => item.id !== itemId),
        }));
        return { ...prev, days: newDays };
      });
      return;
    }

    try {
      await DeleteItineraryItem(itineraryId, itemId);
      setItinerary((prev) => {
        if (!prev) return prev;
        const newDays = prev.days.map((day) => ({
          ...day,
          items: day.items.filter((item) => item.id !== itemId),
        }));
        return { ...prev, days: newDays };
      });
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Không thể xóa địa điểm. Vui lòng thử lại.");
    }
  };

  if (loading) return <p className="p-4">Đang tải...</p>;
  if (!itinerary) return <p className="p-4">Không tìm thấy lịch trình.</p>;
  const getRouteItems = () => {
    if (!itinerary) return [];
    return itinerary.days
      .flatMap((day) => day.items)
      .filter((item) => item.lat && item.lng)
      .sort((a, b) => {
        if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
        return a.orderInDay - b.orderInDay;
      })
      .map((item) => ({
        id: item.id,
        name: item.placeName,
        lat: item.lat,
        lng: item.lng,
        placeAddress: item.placeAddress,
      }));
  };
  // ----- DRAG AND DROP HANDLER -----
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    setItinerary((prev) => {
      const newDays = [...prev.days];
      const sourceDayIndex = newDays.findIndex(
        (d) => String(d.dayNumber) === source.droppableId
      );
      const destDayIndex = newDays.findIndex(
        (d) => String(d.dayNumber) === destination.droppableId
      );

      if (sourceDayIndex === -1 || destDayIndex === -1) return prev;

      // Clone items
      const sourceDay = { ...newDays[sourceDayIndex] };
      const destDay = { ...newDays[destDayIndex] };
      const sourceItems = [...sourceDay.items];
      const destItems =
        sourceDayIndex === destDayIndex ? sourceItems : [...destDay.items];

      // Remove from source
      const [movedItem] = sourceItems.splice(source.index, 1);

      // Same day reorder
      if (source.droppableId === destination.droppableId) {
        sourceItems.splice(destination.index, 0, movedItem);

        newDays[sourceDayIndex] = {
          ...sourceDay,
          items: sourceItems.map((item, idx) => ({
            ...item,
            orderInDay: idx + 1,
            isModified: !item.isNew,
          })),
        };
      } else {
        // Move to different day
        const updatedItem = {
          ...movedItem,
          dayNumber: destDay.dayNumber,
          isModified: !movedItem.isNew,
        };

        destItems.splice(destination.index, 0, updatedItem);

        newDays[sourceDayIndex] = {
          ...sourceDay,
          items: sourceItems.map((item, idx) => ({
            ...item,
            orderInDay: idx + 1,
            isModified: !item.isNew,
          })),
        };

        newDays[destDayIndex] = {
          ...destDay,
          items: destItems.map((item, idx) => ({
            ...item,
            orderInDay: idx + 1,
            isModified: !item.isNew,
          })),
        };
      }

      setHasUnsavedChanges(true);
      return { ...prev, days: newDays };
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {itinerary.title}
              </h1>
              <p className="text-sm flex items-center gap-2 mt-1">
                <MapPin size={16} className="text-blue-500" />
                <span className="font-semibold text-blue-600">
                  {itinerary.destination}
                </span>
                <span className="text-gray-300 mx-1">•</span>
                <span className="text-gray-600 font-medium">
                  {itinerary.startDate}{" "}
                  <span className="text-purple-500">→</span> {itinerary.endDate}
                </span>
              </p>
            </div>

            {/* Thông báo unsaved changes trong header */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200 text-sm">
                <span>⚠️</span>
                <span>Có thay đổi chưa lưu</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {saveStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Đã lưu!</span>
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-medium">Lỗi khi lưu</span>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className={`
    flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm
          transition-all duration-200 transform
          ${
            hasUnsavedChanges && !saving
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Lưu</span>
                </>
              )}
            </button>
            <button
              onClick={() => navigate("/trip-list")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
            >
              <LogOut size={16} />
              <span>Thoát</span>
            </button>
          </div>
        </div>
      </header>

      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Days List */}
        <div
          className={`overflow-x-auto overflow-y-hidden transition-all duration-300 p-6 ${
            mapSize === "full"
              ? "w-1/4"
              : mapSize === "half"
              ? "w-1/2"
              : "w-2/3"
          }`}
        >
          <div className="flex gap-4 min-w-max h-full">
            <DragDropContext onDragEnd={handleDragEnd}>
              {itinerary.days.map((day) => (
                <div
                  key={day.dayNumber}
                  className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl shadow w-96 flex-shrink-0 flex flex-col max-h-full"
                >
                  <div className="flex justify-between items-center flex-shrink-0">
                    <h3 className="font-semibold text-lg">
                      Ngày {day.dayNumber} ({day.date})
                    </h3>

                    <div className="flex items-center gap-2">
                      {/* Nút thêm địa điểm */}
                      <button
                        onClick={() => {
                          setSelectedDayNumber(day.dayNumber);
                          setShowPlaceModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                      >
                        <Plus size={16} />
                        <span>Thêm</span>
                      </button>

                      {/* Menu 3 chấm */}
                      <div className="relative" ref={menuRef}>
                        <button
                          onClick={() => {
                            setItinerary((prev) => ({
                              ...prev,
                              activeMenu:
                                prev.activeMenu === day.dayNumber
                                  ? null
                                  : day.dayNumber,
                            }));
                          }}
                          className="p-2 rounded-full hover:bg-gray-100 transition"
                        >
                          <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {itinerary.activeMenu === day.dayNumber && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-48 z-10"
                            >
                              <button
                                onClick={() => {
                                  handleAddDayBefore(day.dayNumber);
                                  setItinerary((prev) => ({
                                    ...prev,
                                    activeMenu: null,
                                  }));
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-left"
                              >
                                <Plus size={16} />
                                <span>Thêm ngày trước</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleAddDayAfter(day.dayNumber);
                                  setItinerary((prev) => ({
                                    ...prev,
                                    activeMenu: null,
                                  }));
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-left"
                              >
                                <Plus size={16} />
                                <span>Thêm ngày sau</span>
                              </button>
                              <hr />
                              <button
                                onClick={() => {
                                  handleDeleteDay(day.dayNumber);
                                  setItinerary((prev) => ({
                                    ...prev,
                                    activeMenu: null,
                                  }));
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                              >
                                <Trash2 size={16} />
                                <span>Xóa ngày</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 mt-2">
                    {day.items.length === 0 && (
                      <p className="text-gray-400 text-center py-8 text-sm">
                        Chưa có địa điểm nào. Nhấn "Thêm" để bắt đầu.
                      </p>
                    )}

                    <Droppable droppableId={String(day.dayNumber)} type="ITEM">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[100px] ${
                            snapshot.isDraggingOver
                              ? "bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg"
                              : ""
                          }`}
                        >
                          {day.items.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={String(item.id)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onMouseEnter={() => setHoveredItemId(item.id)}
                                  onMouseLeave={() => setHoveredItemId(null)}
                                  className={`transition-transform ${
                                    snapshot.isDragging
                                      ? "scale-[1.02] shadow-lg"
                                      : ""
                                  }`}
                                >
                                  <DayItemCard
                                    item={item}
                                    onRemove={removeItem}
                                    onUpdate={updateItem}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              ))}
            </DragDropContext>
          </div>
        </div>
        {/* Map - Right side */}
        <div
          className={`transition-all duration-300 flex-shrink-0 ${
            mapSize === "full"
              ? "w-3/4"
              : mapSize === "half"
              ? "w-1/2"
              : "w-1/3"
          }`}
        >
          <div className="h-full relative">
            <div className="absolute top-4 left-4 z-[1000]">
              <div className="relative">
                <button
                  onClick={() =>
                    setItinerary((prev) => ({
                      ...prev,
                      showMapMenu: !prev.showMapMenu,
                    }))
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-medium"
                >
                  <Eye size={16} />
                  <span>Expand Map</span>
                </button>

                {itinerary.showMapMenu && (
                  <div className="absolute top-12 left-0 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[160px] overflow-hidden">
                    <button
                      onClick={() => {
                        setMapSize("default");
                        setItinerary((prev) => ({
                          ...prev,
                          showMapMenu: false,
                        }));
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition ${
                        mapSize === "default"
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : ""
                      }`}
                    >
                      {mapSize === "default" && "✓ "}Default
                    </button>
                    <button
                      onClick={() => {
                        setMapSize("half");
                        setItinerary((prev) => ({
                          ...prev,
                          showMapMenu: false,
                        }));
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition ${
                        mapSize === "half"
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : ""
                      }`}
                    >
                      {mapSize === "half" && "✓ "}Half
                    </button>
                    <button
                      onClick={() => {
                        setMapSize("full");
                        setItinerary((prev) => ({
                          ...prev,
                          showMapMenu: false,
                        }));
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition ${
                        mapSize === "full"
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : ""
                      }`}
                    >
                      {mapSize === "full" && "✓ "}Full
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-100 overflow-hidden h-full">
              <LeafletMap
                key={JSON.stringify(getRouteItems())}
                places={getRouteItems()}
                hoveredPlaceId={hoveredItemId}
                route={getRouteItems()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal chứa PlaceSidebar */}
      {showPlaceModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={() => setShowPlaceModal(false)}
          />

          <div
            className="fixed right-0 top-0 z-[9999] bg-white shadow-2xl h-full overflow-y-auto"
            style={{ width: "90%" }}
          >
            <div className="relative h-full">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold">
                  Chọn địa điểm cho Ngày {selectedDayNumber}
                </h2>
                <button
                  onClick={() => setShowPlaceModal(false)}
                  className="text-gray-500 hover:text-black text-2xl font-bold px-2"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <PlaceSidebar
                  destinationId={itinerary.destinationId}
                  onSelectPlace={(place) => {
                    handleAddPlaceToDay(selectedDayNumber, place);
                    setShowPlaceModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
