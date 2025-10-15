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
  Navigation,
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
  renameItinerary,
  updateItineraryDates,
} from "../service/tripService";
import PlaceSidebar from "../components/PlaceSidebar.jsx";
import DayItemCard from "../components/DayItemCard.jsx";
import PlaceDetailModal from "../components/PlaceDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PlaceDetailModalWrapper from "../components/PlaceDetailModalWrapper";

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
        const place = it.place || {};
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

// Format số tiền VND
const formatVND = (v) => {
  const n = Number(v) || 0;
  return n.toLocaleString("vi-VN") + " đ";
};

// Haversine (km)
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(a, b) {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return null;
  const d = haversineKm(
    Number(a.lat),
    Number(a.lng),
    Number(b.lat),
    Number(b.lng)
  );
  if (!isFinite(d)) return null;
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
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
  const [selectedPlaceForDetail, setSelectedPlaceForDetail] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const titleInputRef = useRef(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

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

  const handleDateClick = () => {
    setSelectedStartDate(new Date(itinerary.startDate));
    setSelectedEndDate(new Date(itinerary.endDate));
    setCurrentMonth(new Date(itinerary.startDate));
    setShowDateModal(true);
  };

  const handleDateSelect = (date) => {
    // Không cho chọn ngày trong quá khứ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Bắt đầu chọn mới
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else {
      // Chọn ngày kết thúc
      if (date >= selectedStartDate) {
        setSelectedEndDate(date);
      } else {
        // Nếu chọn ngày trước startDate, đổi lại
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      }
    }
  };

  const handleUpdateDates = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      alert("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }

    const startDateStr = selectedStartDate.toISOString().split("T")[0];
    const endDateStr = selectedEndDate.toISOString().split("T")[0];

    try {
      await updateItineraryDates(itineraryId, startDateStr, endDateStr);

      // Reload data
      const response = await GetItineraryDetail(itineraryId);
      const data = response?.data || response;
      const days = generateDays(data.startDate, data.endDate, data.items || []);

      setItinerary((prev) => ({
        ...prev,
        startDate: data.startDate,
        endDate: data.endDate,
        days,
      }));

      setShowDateModal(false);
      alert("✅ Cập nhật ngày thành công!");
    } catch (err) {
      console.error("Error updating dates:", err);
      alert("Không thể cập nhật ngày. Vui lòng thử lại.");
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Thêm ngày của tháng trước
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Thêm ngày của tháng hiện tại
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Thêm ngày của tháng sau
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isInRange = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const formatDateRange = () => {
    if (!selectedStartDate || !selectedEndDate) return "Select dates";

    const start = selectedStartDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const end = selectedEndDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    const days =
      Math.ceil((selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24)) +
      1;

    return `${start} - ${end} · ${days} days`;
  };
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

  const handleTitleEdit = () => {
    setEditedTitle(itinerary.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!editedTitle.trim() || editedTitle === itinerary.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await renameItinerary(itineraryId, editedTitle.trim());
      setItinerary((prev) => ({ ...prev, title: editedTitle.trim() }));
      setIsEditingTitle(false);
    } catch (err) {
      console.error("Error renaming itinerary:", err);
      alert("Không thể đổi tên lịch trình. Vui lòng thử lại.");
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
    }
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

      // 1. Create new items
      if (newItems.length > 0) {
        for (const itemData of newItems) {
          await instance.post(`/itineraries/${itineraryId}/items`, itemData);
        }
      }

      // 2. Update modified items
      if (modifiedItems.length > 0) {
        for (const item of modifiedItems) {
          await instance.patch(`/itineraries/${itineraryId}/items/${item.id}`, {
            dayNumber: item.dayNumber,
            orderInDay: item.orderInDay,
            startTime: item.startTime,
            endTime: item.endTime,
            description: item.description,
            estimatedCost: item.estimatedCost,
            transportMode: item.transportMode,
          });
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
    // Mỗi item cần lat, lng, dayNumber, orderInDay
    const items = itinerary.days.flatMap((day) =>
      day.items.map((item) => ({
        id: item.id,
        name: item.placeName,
        lat: item.lat,
        lng: item.lng,
        placeAddress: item.placeAddress,
        dayNumber: day.dayNumber,
        orderInDay: item.orderInDay || 0,
      }))
    );

    // lọc thiếu tọa độ + sort ngày/thứ tự trong ngày
    return items
      .filter((p) => p.lat && p.lng)
      .sort((a, b) => {
        if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
        return (a.orderInDay || 0) - (b.orderInDay || 0);
      });
  };

  // Tổng chi phí toàn chuyến
  const grandTotal = itinerary.days.reduce(
    (sum, d) =>
      sum + d.items.reduce((s, i) => s + (Number(i.estimatedCost) || 0), 0),
    0
  );

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
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent border-b-2 border-blue-500 outline-none px-1"
                  style={{
                    width: `${Math.max(editedTitle.length * 16, 200)}px`,
                    caretColor: "#2563eb", // Màu xanh dương cho con trỏ nhập liệu
                  }}
                />
              ) : (
                <h1
                  onClick={handleTitleEdit}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:opacity-70 transition relative group"
                  title="Click để sửa tên"
                >
                  {itinerary.title}
                  <span className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-gray-400 text-sm">
                    ✏️
                  </span>
                </h1>
              )}
              <p className="text-sm flex items-center gap-2 mt-1">
                <MapPin size={16} className="text-blue-500" />
                <span className="font-semibold text-blue-600">
                  {itinerary.destination}
                </span>
                <span className="text-gray-300 mx-1">•</span>
                <button
                  onClick={handleDateClick}
                  className="text-gray-600 font-medium hover:text-blue-600 transition cursor-pointer underline decoration-dotted"
                >
                  {itinerary.startDate}{" "}
                  <span className="text-purple-500">→</span> {itinerary.endDate}
                </button>
                <span className="text-gray-300 mx-1">•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  💰 Tổng: <b>{formatVND(grandTotal)}</b>
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
              {itinerary.days.map((day) => {
                const daySubtotal = day.items.reduce(
                  (s, i) => s + (Number(i.estimatedCost) || 0),
                  0
                );
                return (
                  <div
                    key={day.dayNumber}
                    className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl shadow w-96 flex-shrink-0 flex flex-col max-h-full"
                  >
                    <div className="flex justify-between items-center flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          Ngày {day.dayNumber} ({day.date})
                        </h3>
                      </div>

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
                        {/* Tổng chi phí ngày
                        <span className="text-xs px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          Chi phí: {formatVND(daySubtotal)}
                        </span> */}
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

                      <Droppable
                        droppableId={String(day.dayNumber)}
                        type="ITEM"
                      >
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
                                  <>
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onMouseEnter={() =>
                                        setHoveredItemId(item.id)
                                      }
                                      onMouseLeave={() =>
                                        setHoveredItemId(null)
                                      }
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
                                        onClick={(clickedItem) => {
                                          setSelectedPlaceForDetail({
                                            id: clickedItem.placeId,
                                            name: clickedItem.placeName,
                                          });
                                        }}
                                      />
                                    </div>

                                    {/* Khoảng cách đến điểm tiếp theo (chỉ hiển thị nếu còn điểm sau) */}
                                    {index < day.items.length - 1 &&
                                      (() => {
                                        const next = day.items[index + 1];
                                        const dist = formatDistance(item, next);
                                        return (
                                          <div className="flex items-center gap-2 text-xs text-gray-600 pl-3 pr-2 py-1">
                                            <div className="flex-1 h-px bg-gray-200" />
                                            <div className="flex items-center gap-1 whitespace-nowrap">
                                              <Navigation
                                                size={14}
                                                className="text-gray-400"
                                              />
                                              <span>
                                                {dist
                                                  ? `~ ${dist}`
                                                  : "Khoảng cách: N/A"}
                                              </span>
                                            </div>
                                            <div className="flex-1 h-px bg-gray-200" />
                                          </div>
                                        );
                                      })()}
                                  </>
                                )}
                              </Draggable>
                            ))}

                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                );
              })}
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
      {selectedPlaceForDetail && (
        <PlaceDetailModalWrapper
          placeId={selectedPlaceForDetail.id}
          onClose={() => setSelectedPlaceForDetail(null)}
        />
      )}

      {showDateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={() => setShowDateModal(false)}
          />

          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white rounded-2xl shadow-2xl w-[800px]">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">When</h2>
                  <p className="text-gray-600 mt-1">{formatDateRange()}</p>
                </div>
                <button
                  onClick={() => setShowDateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Tháng hiện tại */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() =>
                        setCurrentMonth(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() - 1
                          )
                        )
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <h3 className="font-semibold text-lg">
                      {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <div className="w-9" />
                  </div>

                  {/* Days of week */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-gray-500 py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentMonth).map((day, idx) => {
                      const isStart = isSameDay(day.date, selectedStartDate);
                      const isEnd = isSameDay(day.date, selectedEndDate);
                      const inRange = isInRange(day.date);

                      // Kiểm tra ngày quá khứ
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isPast = day.date < today;

                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            day.isCurrentMonth &&
                            !isPast &&
                            handleDateSelect(day.date)
                          }
                          disabled={!day.isCurrentMonth || isPast}
                          className={`
          aspect-square flex items-center justify-center rounded-lg text-sm
          transition-all duration-200
          ${
            !day.isCurrentMonth || isPast
              ? "text-gray-300 cursor-not-allowed"
              : ""
          }
          ${
            day.isCurrentMonth && !isPast && !isStart && !isEnd && !inRange
              ? "hover:bg-gray-100 text-gray-700"
              : ""
          }
          ${isStart || isEnd ? "bg-red-500 text-white font-semibold" : ""}
          ${inRange && !isStart && !isEnd ? "bg-red-100 text-red-600" : ""}
        `}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tháng tiếp theo */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-9" />
                    <h3 className="font-semibold text-lg">
                      {new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <button
                      onClick={() =>
                        setCurrentMonth(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() + 1
                          )
                        )
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>

                  {/* Days of week */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-gray-500 py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      )
                    ).map((day, idx) => {
                      const isStart = isSameDay(day.date, selectedStartDate);
                      const isEnd = isSameDay(day.date, selectedEndDate);
                      const inRange = isInRange(day.date);

                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            day.isCurrentMonth && handleDateSelect(day.date)
                          }
                          disabled={!day.isCurrentMonth}
                          className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm
                      transition-all duration-200
                      ${
                        !day.isCurrentMonth
                          ? "text-gray-300 cursor-not-allowed"
                          : ""
                      }
                      ${
                        day.isCurrentMonth && !isStart && !isEnd && !inRange
                          ? "hover:bg-gray-100 text-gray-700"
                          : ""
                      }
                      ${
                        isStart || isEnd
                          ? "bg-red-500 text-white font-semibold"
                          : ""
                      }
                      ${
                        inRange && !isStart && !isEnd
                          ? "bg-red-100 text-red-600"
                          : ""
                      }
                    `}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDateModal(false)}
                className="px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDates}
                disabled={!selectedStartDate || !selectedEndDate}
                className={`
            px-6 py-2.5 rounded-lg font-medium transition
            ${
              selectedStartDate && selectedEndDate
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
              >
                Update
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
