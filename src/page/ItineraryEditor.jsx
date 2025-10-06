import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Save, Loader2, CheckCircle, LogOut } from "lucide-react";
import instance from "../service/axios.admin.customize";
import {
  GetItineraryDetail,
  UpdateItinerary,
  UpdateItineraryItem,
  DeleteItineraryItem,
  MoveItineraryItem,
} from "../service/api.admin.service";
import PlaceSidebar from "../components/PlaceSidebar.jsx";
import DayItemCard from "../components/DayItemCard.jsx";
import PlaceDetailModal from "../components/PlaceDetailModal";

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
      .map((it, idx) => ({
        id: it.id || `item-${Math.random()}`,
        placeId: it.placeId,
        placeName: it.placeName || "Địa điểm không xác định",
        placeAddress: it.placeAddress || "",
        placeImage: it.placeImage || "https://via.placeholder.com/150",
        dayNumber: it.dayNumber || i,
        orderInDay: it.orderInDay || idx + 1,
        startTime: it.startTime || null,
        endTime: it.endTime || null,
        description: it.description || "",
        estimatedCost: it.estimatedCost || null,
        transportMode: it.transportMode || null,
        isNew: false,
        isModified: false,
      }));

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
  const [placesForDrag, setPlacesForDrag] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const navigate = useNavigate();
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
        newItems,
        modifiedItems,
      });

      // 1. Create new items
      if (newItems.length > 0) {
        console.log("Creating new items...");
        for (const itemData of newItems) {
          try {
            console.log("Creating item with placeId:", itemData.placeId);
            await instance.post(`/itineraries/${itineraryId}/items`, itemData);
          } catch (err) {
            console.error("Failed to create item:", itemData, err);
            if (err.response) {
              console.error("Error response:", err.response.data);
            }
            throw err;
          }
        }
      }

      // 2. Update modified items
      if (modifiedItems.length > 0) {
        console.log("Updating modified items...");
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
            if (err.response) {
              console.error("Error response:", err.response.data);
            }
            throw err;
          }
        }
      }

      setHasUnsavedChanges(false);
      setSaveStatus("success");

      // Reload data to sync with server
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

  /* ----- DRAG & DROP ----- */
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    setItinerary((prev) => {
      if (!prev) return prev;
      const newDays = JSON.parse(JSON.stringify(prev.days));

      // CASE 1: Drag from sidebar to day (CREATE NEW)
      if (source.droppableId === "sidebar-places") {
        const placeId = draggableId;
        const place = placesForDrag.find(
          (p) => String(p.id) === String(placeId)
        );

        console.log("Drag from sidebar:", { draggableId, placeId, place });

        if (!place) {
          console.error("Place not found:", placeId);
          return prev;
        }

        const destDay = newDays.find(
          (d) => d.dayNumber === parseInt(destination.droppableId)
        );

        if (!destDay) {
          console.error("Destination day not found");
          return prev;
        }

        const newItem = {
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          placeId: place.id,
          placeName: place.name,
          placeAddress: place.address || "",
          placeImage: place.mainImage || "https://via.placeholder.com/150",
          placeDescription: place.description || "Chưa có mô tả",
          placeRating: place.rating || 0,
          placeReviews: place.reviews || 0,
          dayNumber: destDay.dayNumber,
          orderInDay: destination.index + 1,
          startTime: "09:00",
          endTime: "11:00",
          description: "",
          estimatedCost: 0,
          transportMode: "WALK",
          isNew: true,
          isModified: false,
        };

        destDay.items.splice(destination.index, 0, newItem);
        destDay.items.forEach((item, idx) => {
          item.orderInDay = idx + 1;
          if (!item.isNew) item.isModified = true;
        });

        setHasUnsavedChanges(true);
        return { ...prev, days: newDays };
      }

      // CASE 2: Move within days
      const srcDay = newDays.find(
        (d) => d.dayNumber === parseInt(source.droppableId)
      );
      const destDay = newDays.find(
        (d) => d.dayNumber === parseInt(destination.droppableId)
      );

      if (!srcDay || !destDay) return prev;

      const [moved] = srcDay.items.splice(source.index, 1);
      moved.dayNumber = destDay.dayNumber;
      if (!moved.isNew) moved.isModified = true;

      destDay.items.splice(destination.index, 0, moved);

      srcDay.items.forEach((item, idx) => {
        item.orderInDay = idx + 1;
        if (!item.isNew) item.isModified = true;
      });
      destDay.items.forEach((item, idx) => {
        item.orderInDay = idx + 1;
        if (!item.isNew) item.isModified = true;
      });

      setHasUnsavedChanges(true);
      return { ...prev, days: newDays };
    });
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

    // If new unsaved item, remove directly
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

    // If saved item, call API to delete
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

  return (
    <div className="p-6 space-y-6">
      {/* ---------------- Header ---------------- */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{itinerary.title}</h1>
          <p className="text-gray-600">
            📍 {itinerary.destination} | {itinerary.startDate} →{" "}
            {itinerary.endDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Thoát */}
          <button
            onClick={() => navigate("/trip-list")}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Thoát</span>
          </button>

          {/* Nút Lưu lịch trình */}
          {saveStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Đã lưu thành công!</span>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">
                Lỗi khi lưu. Vui lòng thử lại.
              </span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium
              transition-all duration-200
              ${
                hasUnsavedChanges && !saving
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Lưu lịch trình</span>
              </>
            )}
          </button>
        </div>
      </header>

      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          ⚠️ Bạn có thay đổi chưa được lưu. Nhấn nút "Lưu lịch trình" để lưu các
          thay đổi.
        </div>
      )}
      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <section className="md:col-span-2 space-y-6 overflow-y-auto max-h-[80vh]">
            {itinerary.days.map((day) => (
              <Droppable
                key={day.dayNumber}
                droppableId={String(day.dayNumber)}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      p-4 bg-white border-2 rounded-xl shadow space-y-3
                      ${
                        snapshot.isDraggingOver
                          ? "border-blue-500 bg-blue-50 scale-[1.01]"
                          : "border-gray-200"
                      }
                      transition-all duration-150
                    `}
                  >
                    <h3 className="font-semibold text-lg">
                      Ngày {day.dayNumber} ({day.date})
                    </h3>

                    {day.items.length === 0 && (
                      <p className="text-gray-400 text-center py-8 text-sm">
                        Kéo địa điểm vào đây
                      </p>
                    )}

                    {day.items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={snap.isDragging ? "opacity-50" : ""}
                            style={{
                              ...prov.draggableProps.style,
                              transform: prov.draggableProps.style?.transform,
                            }}
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
            ))}
          </section>

          <div className="md:col-span-3 sticky top-0">
            <PlaceSidebar
              destinationId={itinerary.destinationId}
              onSelectPlace={(place) => setSelectedPlace(place)}
              onPlacesChange={setPlacesForDrag}
            />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
