// ...existing code...
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LeafletMap } from "../components/LeafletMap.jsx";
import {
  LogOut,
  MoreVertical,
  Share2,
  Plus,
  Trash2,
  Eye,
  MapPin,
  Navigation,
  AlertTriangle,
} from "lucide-react";
import instance from "../service/axios.admin.customize";
import ShareModal from "../components/ShareModal.jsx";
import {
  GetItineraryDetail,
  DeleteItineraryItem,
  GetItineraryWarnings,
  // removed GetItineraryWarningsForDay import
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
import SuggestedPlacesModal from "../components/SuggestedPlacesModal";

/* ------------------- HELPER ------------------- */
// ...existing helper functions...
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

const formatVND = (v) => {
  const n = Number(v) || 0;
  return n.toLocaleString("vi-VN") + " đ";
};

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
  const [itinerary, setItinerary] = useState(null);
  const [warningsByDay, setWarningsByDay] = useState({});
  const [loadingWarnings, setLoadingWarnings] = useState(false);
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sharedUsers, setSharedUsers] = useState([]);
  const [linkPermission, setLinkPermission] = useState("Can Edit");
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [lastAddedPlace, setLastAddedPlace] = useState(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  /* ----- HELPERS FOR WARNINGS ----- */
  // Only keep refreshWarnings - normalize various backend shapes into { "1": [...], ... }
  const refreshWarnings = async () => {
    if (!itineraryId) return {};
    try {
      setLoadingWarnings(true);

      const resp = await GetItineraryWarnings(itineraryId, "Asia/Ho_Chi_Minh");
      console.log("GetItineraryWarnings raw response:", resp);

      const payload = resp?.data || resp;
      console.log("Payload after extraction:", payload);

      const normalized = {};

      // Case 1: payload.warningsByDay is already the map
      if (
        payload &&
        typeof payload === "object" &&
        payload.warningsByDay &&
        typeof payload.warningsByDay === "object"
      ) {
        console.log("Case 1: warningsByDay exists");
        Object.entries(payload.warningsByDay).forEach(([k, v]) => {
          normalized[String(k)] = Array.isArray(v) ? v : [];
        });
      }
      // Case 2: payload.warnings is an array of warnings with dayNumber/day field
      else if (
        payload &&
        typeof payload === "object" &&
        Array.isArray(payload.warnings)
      ) {
        console.log("Case 2: warnings array exists");
        payload.warnings.forEach((w) => {
          const dayKey = String(w?.dayNumber ?? w?.day ?? "0");
          if (!normalized[dayKey]) normalized[dayKey] = [];
          normalized[dayKey].push(w);
        });
      }
      // Case 3: payload is top-level array of warnings
      else if (Array.isArray(payload)) {
        console.log("Case 3: direct array");
        payload.forEach((w) => {
          const dayKey = String(w?.dayNumber ?? w?.day ?? "0");
          if (!normalized[dayKey]) normalized[dayKey] = [];
          normalized[dayKey].push(w);
        });
      }
      // Case 4: payload is map-like object (keys => arrays)
      else if (payload && typeof payload === "object") {
        console.log("Case 4: generic object map");
        Object.entries(payload).forEach(([k, v]) => {
          // Skip non-numeric keys
          if (/^\d+$/.test(k)) {
            normalized[String(k)] = Array.isArray(v) ? v : [];
          }
        });
      }

      // Ensure all keys have arrays
      Object.keys(normalized).forEach((k) => {
        if (!Array.isArray(normalized[k])) normalized[k] = [];
      });

      console.log("Final normalized warningsByDay:", normalized);
      setWarningsByDay(normalized);
      return normalized;
    } catch (err) {
      console.error("refreshWarnings failed:", err);
      console.error("Error details:", err?.response?.data || err?.message);
      setWarningsByDay({});
      return {};
    } finally {
      setLoadingWarnings(false);
    }
  };





  /* ----- FETCH ITINERARY + WARNINGS ----- */
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
          canEdit: !!data.canEdit,
          myRole: data.myRole || "VIEWER",
        });

        // load warnings ngay sau khi load itinerary
        await refreshWarnings();
      } catch (err) {
        console.error("Error fetching itinerary:", err);
        setItinerary(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!itinerary?.canEdit) return;
    setSelectedStartDate(new Date(itinerary.startDate));
    setSelectedEndDate(new Date(itinerary.endDate));
    setCurrentMonth(new Date(itinerary.startDate));
    setShowDateModal(true);
  };

  const handleDateSelect = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else {
      if (date >= selectedStartDate) {
        setSelectedEndDate(date);
      } else {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      }
    }
  };

  const handleUpdateDates = async () => {
    if (!itinerary?.canEdit) return;
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

      // refresh all warnings since date range changed
      await refreshWarnings();

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
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
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

  /* ----- QUẢN LÝ NGÀY (THÊM / XOÁ) ----- */
  const handleAddDayBefore = async (dayNumber) => {
    if (!itinerary?.canEdit) return;
    if (!itineraryId) return;
    try {
      await insertDaysBefore(itineraryId, dayNumber, 1);
      const res = await GetItineraryDetail(itineraryId);
      const data = res?.data || res;
      const days = generateDays(data.startDate, data.endDate, data.items || []);
      setItinerary((prev) => ({ ...prev, days }));

      // reload warnings
      await refreshWarnings();
    } catch (err) {
      console.error("Error adding day before:", err);
      alert("Không thể thêm ngày trước. Vui lòng thử lại.");
    }
  };

  const handleAddDayAfter = async (dayNumber) => {
    if (!itinerary?.canEdit) return;
    if (!itineraryId) return;
    try {
      await insertDaysAfter(itineraryId, dayNumber, 1);
      const res = await GetItineraryDetail(itineraryId);
      const data = res?.data || res;
      const days = generateDays(data.startDate, data.endDate, data.items || []);
      setItinerary((prev) => ({ ...prev, days }));

      await refreshWarnings();
    } catch (err) {
      console.error("Error adding day after:", err);
      alert("Không thể thêm ngày sau. Vui lòng thử lại.");
    }
  };

  const handleDeleteDay = async (dayNumber) => {
    if (!itinerary?.canEdit) return;
    if (!itineraryId) return;
    if (!window.confirm(`Bạn có chắc muốn xóa ngày ${dayNumber}?`)) return;

    try {
      await deleteDay(itineraryId, dayNumber);
      const res = await GetItineraryDetail(itineraryId);
      const data = res?.data || res;
      const days = generateDays(data.startDate, data.endDate, data.items || []);
      setItinerary((prev) => ({ ...prev, days }));

      await refreshWarnings();
    } catch (err) {
      console.error("Error deleting day:", err);
      alert("Không thể xoá ngày. Vui lòng thử lại.");
    }
  };

  /* ----- THÊM ĐỊA ĐIỂM VÀO NGÀY ----- */
  const handleAddPlaceToDay = async (dayNumber, place) => {
    if (!itinerary?.canEdit) return;
    const newItem = {
      placeId: place.id,
      dayNumber: dayNumber,
      orderInDay: 0,
      startTime: "09:00",
      endTime: "11:00",
      description: "",
      estimatedCost: 0,
      transportMode: "WALK",
    };

    try {
      await instance.post(`/itineraries/${itineraryId}/items`, newItem);
      const res = await GetItineraryDetail(itineraryId);
      const data = res?.data || res;
      const days = generateDays(data.startDate, data.endDate, data.items || []);
      setItinerary((prev) => ({ ...prev, days }));

      setLastAddedPlace({ id: place.id, name: place.name, dayNumber });

      // refresh all warnings (we no longer fetch per-day)
      await refreshWarnings();
    } catch (err) {
      console.error("Error adding place:", err);
      alert("Không thể thêm địa điểm. Vui lòng thử lại.");
    }
  };

  const handleTitleEdit = () => {
    if (!itinerary?.canEdit) return;
    setEditedTitle(itinerary.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!itinerary?.canEdit) return;
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
    if (e.key === "Enter") handleTitleSave();
    else if (e.key === "Escape") setIsEditingTitle(false);
  };

  /* ----- UPDATE ITEM ----- */
  const updateItem = async (itemId, updates) => {
    if (!itinerary?.canEdit) return;

    const item = itinerary.days
      .flatMap((d) => d.items)
      .find((it) => it.id === itemId);

    setItinerary((prev) => {
      if (!prev) return prev;
      const newDays = prev.days.map((day) => ({
        ...day,
        items: day.items.map((it) =>
          it.id === itemId
            ? {
              ...it,
              ...updates,
            }
            : it
        ),
      }));
      return { ...prev, days: newDays };
    });

    if (item?.isNew) return;

    try {
      await instance.patch(`/itineraries/${itineraryId}/items/${itemId}`, {
        dayNumber: updates.dayNumber,
        orderInDay: updates.orderInDay,
        startTime: updates.startTime,
        endTime: updates.endTime,
        description: updates.description,
        estimatedCost: updates.estimatedCost,
        transportMode: updates.transportMode,
      });

      // refresh all warnings (replace per-day fetch)
      await refreshWarnings();
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Không thể cập nhật địa điểm. Vui lòng thử lại.");
      const response = await GetItineraryDetail(itineraryId);
      const data = response?.data || response;
      const days = generateDays(data.startDate, data.endDate, data.items || []);
      setItinerary((prev) => ({ ...prev, days }));
      await refreshWarnings();
    }
  };

  /* ----- REMOVE ITEM ----- */
  const removeItem = async (itemId) => {
    if (!itinerary?.canEdit) return;

    const item = itinerary.days
      .flatMap((d) => d.items)
      .find((it) => it.id === itemId);

    if (item?.isNew) {
      setItinerary((prev) => {
        if (!prev) return prev;
        const newDays = prev.days.map((day) => ({
          ...day,
          items: day.items.filter((it) => it.id !== itemId),
        }));
        return { ...prev, days: newDays };
      });
      // refresh all warnings
      await refreshWarnings();
      return;
    }

    try {
      await DeleteItineraryItem(itineraryId, itemId);
      setItinerary((prev) => {
        if (!prev) return prev;
        const newDays = prev.days.map((day) => ({
          ...day,
          items: day.items.filter((it) => it.id !== itemId),
        }));
        return { ...prev, days: newDays };
      });

      await refreshWarnings();
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Không thể xóa địa điểm. Vui lòng thử lại.");
    }
  };

  if (loading) return <p className="p-4">Đang tải...</p>;
  if (!itinerary) return <p className="p-4">Không tìm thấy lịch trình.</p>;

  const getRouteItems = () => {
    if (!itinerary) return [];
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

    return items
      .filter((p) => p.lat && p.lng)
      .sort((a, b) => {
        if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
        return (a.orderInDay || 0) - (b.orderInDay || 0);
      });
  };

  const grandTotal = itinerary.days.reduce(
    (sum, d) =>
      sum + d.items.reduce((s, i) => s + (Number(i.estimatedCost) || 0), 0),
    0
  );

  // ----- DRAG AND DROP HANDLER -----
  const handleDragEnd = async (result) => {
    if (!itinerary?.canEdit) return; // chặn DnD khi viewer
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceDayNumber = parseInt(source.droppableId);
    const destDayNumber = parseInt(destination.droppableId);

    const sourceDay = itinerary.days.find(
      (d) => d.dayNumber === sourceDayNumber
    );
    const destDay = itinerary.days.find((d) => d.dayNumber === destDayNumber);

    if (!sourceDay || !destDay) return;

    const movedItem = sourceDay.items[source.index];

    setItinerary((prev) => {
      const newDays = [...prev.days];
      const sourceDayIndex = newDays.findIndex(
        (d) => d.dayNumber === sourceDayNumber
      );
      const destDayIndex = newDays.findIndex(
        (d) => d.dayNumber === destDayNumber
      );

      if (sourceDayIndex === -1 || destDayIndex === -1) return prev;

      const newSourceDay = { ...newDays[sourceDayIndex] };
      const newDestDay = { ...newDays[destDayIndex] };
      const sourceItems = [...newSourceDay.items];
      const destItems =
        sourceDayIndex === destDayIndex ? sourceItems : [...newDestDay.items];

      const [removed] = sourceItems.splice(source.index, 1);

      if (sourceDayIndex === destDayIndex) {
        const originalItemsWithTimes = [...newSourceDay.items];
        sourceItems.splice(destination.index, 0, removed);
        newDays[sourceDayIndex] = {
          ...newSourceDay,
          items: sourceItems.map((item, idx) => ({
            ...item,
            orderInDay: idx + 1,
            startTime: originalItemsWithTimes[idx]?.startTime || "09:00",
            endTime: originalItemsWithTimes[idx]?.endTime || "11:00",
          })),
        };
      } else {
        const updatedItem = { ...removed, dayNumber: newDestDay.dayNumber };
        destItems.splice(destination.index, 0, updatedItem);

        newDays[sourceDayIndex] = {
          ...newSourceDay,
          items: sourceItems.map((item, idx) => ({
            ...item,
            orderInDay: idx + 1,
          })),
        };
        newDays[destDayIndex] = {
          ...newDestDay,
          items: destItems.map((item, idx) => ({
            ...item,
            orderInDay: idx + 1,
            dayNumber: newDestDay.dayNumber,
          })),
        };
      }

      return { ...prev, days: newDays };
    });

    try {
      if (movedItem.isNew) return;

      if (sourceDayNumber === destDayNumber) {
        const updatedItems = [...sourceDay.items];
        const [removed] = updatedItems.splice(source.index, 1);
        updatedItems.splice(destination.index, 0, removed);

        for (let i = 0; i < updatedItems.length; i++) {
          const item = updatedItems[i];
          if (!item.isNew) {
            await instance.patch(
              `/itineraries/${itineraryId}/items/${item.id}`,
              {
                orderInDay: i + 1,
              }
            );
          }
        }

        // refresh all warnings (previously per-day)
        await refreshWarnings();
      } else {
        await instance.patch(
          `/itineraries/${itineraryId}/items/${movedItem.id}`,
          {
            dayNumber: destDayNumber,
            orderInDay: destination.index + 1,
          }
        );

        const remainingSourceItems = sourceDay.items.filter(
          (_, idx) => idx !== source.index
        );
        for (let i = 0; i < remainingSourceItems.length; i++) {
          const item = remainingSourceItems[i];
          if (!item.isNew) {
            await instance.patch(
              `/itineraries/${itineraryId}/items/${item.id}`,
              {
                orderInDay: i + 1,
              }
            );
          }
        }

        const updatedDestItems = [...destDay.items];
        updatedDestItems.splice(destination.index, 0, movedItem);

        for (let i = 0; i < updatedDestItems.length; i++) {
          const item = updatedDestItems[i];
          if (!item.isNew && item.id !== movedItem.id) {
            await instance.patch(
              `/itineraries/${itineraryId}/items/${item.id}`,
              {
                dayNumber: destDayNumber,
                orderInDay: i + 1,
              }
            );
          }
        }

        // refresh all warnings for affected change
        await refreshWarnings();
      }
    } catch (err) {
      console.error("Error saving drag and drop:", err);
      alert("Không thể lưu thay đổi. Đang tải lại dữ liệu...");
      const response = await GetItineraryDetail(itineraryId);
      const data = response?.data || response;
      const days = generateDays(data.startDate, data.endDate, data.items || []);
      setItinerary((prev) => ({ ...prev, days }));
      await refreshWarnings();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 px-6 py-3 flex-shrink-0">
        {showShareModal && itinerary?.canEdit && (
          <ShareModal
            onClose={() => setShowShareModal(false)}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            sharedUsers={sharedUsers}
            linkPermission={linkPermission}
            setLinkPermission={setLinkPermission}
            copyPlannerLink={() => { navigator.clipboard.writeText(window.location.href); alert("Đã copy link!"); }}
            itineraryId={itinerary.id}
          />
        )}

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
                    caretColor: "#2563eb",
                  }}
                />
              ) : (
                <h1
                  onClick={handleTitleEdit}
                  className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${itinerary?.canEdit
                    ? "cursor-pointer hover:opacity-70"
                    : "cursor-default opacity-90"
                    } transition relative group`}
                  title={itinerary?.canEdit ? "Click để sửa tên" : "Chỉ xem"}
                >
                  {itinerary.title}
                  {!itinerary?.canEdit && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      VIEW ONLY
                    </span>
                  )}
                  {itinerary?.canEdit && (
                    <span className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-gray-400 text-sm">
                      ✏️
                    </span>
                  )}
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
                  className={`text-gray-600 font-medium underline decoration-dotted transition ${itinerary?.canEdit
                    ? "hover:text-blue-600 cursor-pointer"
                    : "text-gray-400 cursor-not-allowed"
                    }`}
                >
                  {itinerary.startDate}{" "}
                  <span className="text-purple-500">→</span> {itinerary.endDate}
                </button>
                <span className="text-gray-300 mx-1">•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  💰 Tổng: <b className="ml-1">{formatVND(grandTotal)}</b>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {itinerary?.canEdit && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
              >
                <Share2 size={16} />
                <span>Chia sẻ</span>
              </button>
            )}

            <button
              onClick={() => navigate(-1)}
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

      <div className="flex gap-6 flex-1">
        {/* Days List */}
        <div
          className={`transition-all duration-300 p-6 flex-shrink-0`}
          style={{
            width: mapSize === "full" ? "25%" : mapSize === "half" ? "50%" : "66.66%",
          }}
        >
          <div className="flex gap-4 min-w-max h-full">
            <DragDropContext onDragEnd={handleDragEnd}>
              {itinerary.days.map((day) => {
                const dayWarnings = warningsByDay?.[String(day.dayNumber)] || [];
                // console.log(`Warnings for day ${day.dayNumber}:`, dayWarnings);
                const warningsCount = Array.isArray(dayWarnings) ? dayWarnings.length : 0;

                return (
                  <div
                    key={day.dayNumber}
                    className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl shadow w-96 flex-shrink-0 flex flex-col max-h-full"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center flex-shrink-0">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        Ngày {day.dayNumber} ({day.date})
                        {warningsCount > 0 && (
                          <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs">
                            <AlertTriangle size={14} /> {warningsCount}
                          </span>
                        )}
                      </h3>

                      <div className="flex items-center gap-2">
                        {/* Add Place */}
                        <button
                          onClick={() => {
                            if (!itinerary?.canEdit) return;
                            setSelectedDayNumber(day.dayNumber);
                            setShowPlaceModal(true);
                          }}
                          disabled={!itinerary?.canEdit}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl text-sm ${itinerary?.canEdit
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                          <Plus size={16} />
                          <span>Thêm</span>
                        </button>

                        {/* Day Menu */}
                        {itinerary?.canEdit && (
                          <div className="relative" ref={menuRef}>
                            <button
                              onClick={() =>
                                setItinerary((prev) => ({
                                  ...prev,
                                  activeMenu:
                                    prev.activeMenu === day.dayNumber ? null : day.dayNumber,
                                }))
                              }
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
                                      setItinerary((prev) => ({ ...prev, activeMenu: null }));
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-left"
                                  >
                                    <Plus size={16} />
                                    <span>Thêm ngày trước</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleAddDayAfter(day.dayNumber);
                                      setItinerary((prev) => ({ ...prev, activeMenu: null }));
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
                                      setItinerary((prev) => ({ ...prev, activeMenu: null }));
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
                        )}
                      </div>
                    </div>

                    {/* Warnings */}
                    {warningsCount > 0 && (
                      <div className="mt-2 bg-yellow-50 border border-yellow-100 rounded-md p-2 text-sm text-yellow-800">
                        {dayWarnings.slice(0, 3).map((w, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <AlertTriangle size={14} className="mt-1" />
                            <div>
                              <div className="font-medium">{w.type || "Cảnh báo"}</div>
                              <div className="text-xs">{w.message}</div>
                            </div>
                          </div>
                        ))}
                        {dayWarnings.length > 3 && (
                          <div className="mt-1 text-xs text-yellow-800">
                            ...{dayWarnings.length - 3} cảnh báo nữa
                          </div>
                        )}
                      </div>
                    )}

                    {/* ⚠️ Scroll container fix */}
                    <div className="flex-1 min-h-0 mt-2">
                      <Droppable
                        droppableId={String(day.dayNumber)}
                        type="ITEM"
                        isDropDisabled={!itinerary?.canEdit}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`space-y-3 overflow-y-auto min-h-[100px] ${snapshot.isDraggingOver
                              ? "bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg"
                              : ""
                              }`}
                            style={{ maxHeight: "100%" }}
                          >
                            {day.items.length === 0 && (
                              <p className="text-gray-400 text-center py-8 text-sm">
                                Chưa có địa điểm nào. Nhấn "Thêm" để bắt đầu.
                              </p>
                            )}

                            {day.items.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={String(item.id)}
                                index={index}
                                isDragDisabled={!itinerary?.canEdit}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`transition-transform ${snapshot.isDragging ? "scale-[1.02] shadow-lg" : ""
                                      }`}
                                  >
                                    <DayItemCard
                                      item={item}
                                      readOnly={!itinerary?.canEdit}
                                      onRemove={removeItem}
                                      onUpdate={updateItem}
                                      onClick={(clickedItem) =>
                                        setSelectedPlaceForDetail({
                                          id: clickedItem.placeId,
                                          name: clickedItem.placeName,
                                        })
                                      }
                                      onSuggest={(clickedItem) => {
                                        if (!itinerary?.canEdit) return;
                                        setLastAddedPlace({
                                          id: clickedItem.placeId,
                                          name: clickedItem.placeName,
                                          dayNumber: clickedItem.dayNumber,
                                        });
                                        setShowSuggestionsModal(true);
                                      }}
                                      itemWarnings={(warningsByDay?.[String(day.dayNumber)] || []).filter(
                                        (w) => w.itemId === item.id
                                      )}
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
                );
              })}
            </DragDropContext>
          </div>
        </div>

        {/* Map Right Side */}
        <div
          className={`transition-all duration-300 flex-shrink-0`}
          style={{
            width: mapSize === "full" ? "75%" : mapSize === "half" ? "50%" : "33.33%",
          }}
        >
          <div className="h-full relative">
            {/* Map Controls */}
            <div className="absolute top-4 left-4 z-[1000]">
              <div className="relative">
                <button
                  onClick={() =>
                    setItinerary((prev) => ({ ...prev, showMapMenu: !prev.showMapMenu }))
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-medium"
                >
                  <Eye size={16} />
                  <span>Expand Map</span>
                </button>

                {itinerary.showMapMenu && (
                  <div className="absolute top-12 left-0 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[160px] overflow-hidden">
                    {["default", "half", "full"].map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setMapSize(size);
                          setItinerary((prev) => ({ ...prev, showMapMenu: false }));
                        }}
                        className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition ${mapSize === size ? "bg-blue-50 text-blue-600 font-medium" : ""
                          }`}
                      >
                        {mapSize === size && "✓ "} {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-100 overflow-hidden h-full">
              <LeafletMap
                places={getRouteItems()}
                image={itinerary.destinationImage}
                hoveredPlaceId={hoveredItemId}
                provider="google-roadmap"
              />
            </div>
          </div>
        </div>
      </div>


      {/* PlaceSidebar modal */}
      {showPlaceModal && itinerary?.canEdit && (
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
                  <p className="text-gray-600 mt-1">
                    {(() => {
                      if (!selectedStartDate || !selectedEndDate)
                        return "Select dates";
                      const start = selectedStartDate.toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        }
                      );
                      const end = selectedEndDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      });
                      const days =
                        Math.ceil(
                          (selectedEndDate - selectedStartDate) /
                          (1000 * 60 * 60 * 24)
                        ) + 1;
                      return `${start} - ${end} · ${days} days`;
                    })()}
                  </p>
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
                <CalendarMonth
                  monthDate={currentMonth}
                  setMonthDate={(d) =>
                    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1))
                  }
                  days={getDaysInMonth(currentMonth)}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  isSameDay={isSameDay}
                  isInRange={isInRange}
                  onSelect={(date) =>
                    itinerary?.canEdit && handleDateSelect(date)
                  }
                />

                {/* Tháng tiếp theo */}
                <CalendarMonth
                  monthDate={
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  }
                  setMonthDate={(d) =>
                    setCurrentMonth(
                      new Date(d.getFullYear(), d.getMonth() - 1, 1)
                    )
                  }
                  days={getDaysInMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1
                    )
                  )}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  isSameDay={isSameDay}
                  isInRange={isInRange}
                  onSelect={(date) =>
                    itinerary?.canEdit && handleDateSelect(date)
                  }
                  next
                />
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
                disabled={
                  !selectedStartDate || !selectedEndDate || !itinerary?.canEdit
                }
                className={`px-6 py-2.5 rounded-lg font-medium transition ${selectedStartDate && selectedEndDate && itinerary?.canEdit
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Update
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal đề xuất địa điểm tiếp theo */}
      {showSuggestionsModal && lastAddedPlace && itinerary?.canEdit && (
        <SuggestedPlacesModal
          placeId={lastAddedPlace.id}
          placeName={lastAddedPlace.name}
          onClose={() => {
            setShowSuggestionsModal(false);
            setLastAddedPlace(null);
          }}
          onSelectPlace={(place) => {
            handleAddPlaceToDay(lastAddedPlace.dayNumber, place);
          }}
        />
      )}
    </div>
  );
}

/* ------------ Tách nhỏ: CalendarMonth (UI thuần) ------------ */
// (giữ nguyên CalendarMonth giống bản trước)
function CalendarMonth({
  monthDate,
  setMonthDate,
  days,
  selectedStartDate,
  selectedEndDate,
  isSameDay,
  isInRange,
  onSelect,
  next = false,
}) {
  const label = new Date(monthDate).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {!next ? (
          <button
            onClick={() =>
              setMonthDate(
                new Date(monthDate.getFullYear(), monthDate.getMonth() - 1)
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
        ) : (
          <div className="w-9" />
        )}

        <h3 className="font-semibold text-lg">{label}</h3>

        {!next ? (
          <div className="w-9" />
        ) : (
          <button
            onClick={() =>
              setMonthDate(
                new Date(monthDate.getFullYear(), monthDate.getMonth() + 1)
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
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div
            key={d}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isStart = isSameDay(day.date, selectedStartDate);
          const isEnd = isSameDay(day.date, selectedEndDate);
          const inRange = isInRange(day.date);

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isPast = day.date < today;

          return (
            <button
              key={idx}
              onClick={() =>
                day.isCurrentMonth && !isPast && onSelect(day.date)
              }
              disabled={!day.isCurrentMonth || isPast}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm transition-all duration-200
                ${!day.isCurrentMonth || isPast
                  ? "text-gray-300 cursor-not-allowed"
                  : ""
                }
                ${day.isCurrentMonth &&
                  !isPast &&
                  !isStart &&
                  !isEnd &&
                  !inRange
                  ? "hover:bg-gray-100 text-gray-700"
                  : ""
                }
                ${isStart || isEnd ? "bg-blue-600 text-white font-semibold" : ""
                }
                ${inRange && !isStart && !isEnd
                  ? "bg-blue-100 text-blue-700"
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
  );
}
