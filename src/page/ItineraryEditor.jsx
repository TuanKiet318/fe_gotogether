// ...existing code...
import React, { useState, useEffect, useRef } from "react";
import CreateTourModal from "../components/CreateTourModal";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
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
import {
  uploadItineraryMedia,
  saveMediaInfo,
  getAllMedia,
  getMediaByDay,
  updateMedia,
  deleteMedia,
  getMediaStats,
} from "../service/itineraryApi";
import blogApi from "../service/blogApi";

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
  const [openWarningDay, setOpenWarningDay] = useState(null);
  const [showCreateTourModal, setShowCreateTourModal] = useState(false);
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
  const [viewMode, setViewMode] = useState("editor");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedDayForMedia, setSelectedDayForMedia] = useState(null);
  const [showBlogPreview, setShowBlogPreview] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaCaption, setMediaCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (itineraryId && viewMode === "media") {
      fetchMediaFiles();
    }
  }, [itineraryId, viewMode]);

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

      const resp = await fetch(
        `http://localhost:8080/api/itineraries/${itineraryId}/warnings?timezone=Asia/Ho_Chi_Minh`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const json = await resp.json();
      console.log("RAW RESPONSE:", json);

      const warningsByDay = json?.data?.warningsByDay || {};
      setWarningsByDay(warningsByDay);

      return warningsByDay;
    } catch (err) {
      console.error("refreshWarnings failed:", err);
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

  // Function fetch all media
  const fetchMediaFiles = async () => {
    try {
      setLoadingMedia(true);
      const data = await getAllMedia(itineraryId);

      // Map data từ API sang format UI
      const mappedData = data.map((item) => ({
        id: item.id,
        type: item.mediaType.toLowerCase(), // "IMAGE" -> "image"
        url: item.mediaUrl,
        thumbnail: item.thumbnailUrl,
        caption: item.caption || "Không có mô tả",
        dayNumber: item.dayNumber,
        uploadedAt: item.createdAt,
        uploadedBy: item.userName,
        fileSize: item.fileSize,
        duration: item.duration,
        orderInDay: item.orderInDay,
      }));

      setMediaFiles(mappedData);
    } catch (error) {
      console.error("Error fetching media:", error);
      alert("Không thể tải media. Vui lòng thử lại.");
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleShareToBlog = async () => {
    if (!itinerary.id) {
      alert("Vui lòng lưu lịch trình trước khi chia sẻ lên blog!");
      return;
    }

    setIsSharing(true);
    try {
      // Generate blog content from itinerary
      const blogContent = generateBlogContent();

      const blogData = {
        title: itinerary.title,
        excerpt: `Khám phá ${itinerary.destination} trong ${itinerary.days.length
          } ngày với ${itinerary.days.reduce(
            (sum, d) => sum + d.items.length,
            0
          )} địa điểm tuyệt vời`,
        content: blogContent,
        includeMedia: true,
        autoPublish: false,
      };

      const response = await blogApi.createBlogFromItinerary(
        itinerary.id,
        blogData
      );

      if (response) {
        alert("Đã chia sẻ lên blog thành công!");
        setShowBlogPreview(false);
      }
    } catch (error) {
      console.error("Lỗi khi chia sẻ lên blog:", error);
      alert(
        error.response?.data?.message ||
        "Có lỗi xảy ra khi chia sẻ lên blog. Vui lòng thử lại!"
      );
    } finally {
      setIsSharing(false);
    }
  };

  const generateBlogContent = () => {
    let content = `# ${itinerary.title}\n\n`;
    content += `**Điểm đến:** ${itinerary.destination}\n`;
    content += `**Thời gian:** ${itinerary.startDate} → ${itinerary.endDate}\n`;
    content += `**Tổng số ngày:** ${itinerary.days.length} ngày\n\n`;
    content += `---\n\n`;

    itinerary.days.forEach((day) => {
      content += `## Ngày ${day.dayNumber}: ${day.date}\n\n`;

      const dayMedia = mediaFiles.filter((m) => m.dayNumber === day.dayNumber);

      content += `Hôm nay chúng tôi đã khám phá ${day.items.length} địa điểm tuyệt vời. `;
      content += `Hành trình bắt đầu từ ${day.items[0]?.placeName || "..."} `;
      content += `và kết thúc tại ${day.items[day.items.length - 1]?.placeName || "..."
        }.\n\n`;

      if (dayMedia.length > 0) {
        content += `### Hình ảnh\n\n`;
        dayMedia.forEach((media) => {
          if (media.caption) {
            content += `*${media.caption}*\n\n`;
          }
        });
      }

      content += `### Các địa điểm đã ghé thăm:\n\n`;
      day.items.forEach((item, idx) => {
        content += `**${idx + 1}. ${item.placeName}**\n`;
        if (item.description) {
          content += `${item.description}\n\n`;
        } else {
          content += `Một địa điểm tuyệt vời đáng để ghé thăm.\n\n`;
        }
      });

      content += `---\n\n`;
    });

    content += `## Tổng kết chuyến đi\n\n`;
    content += `Đây thực sự là một chuyến đi đáng nhớ với tổng cộng ${itinerary.days.length} ngày `;
    content += `khám phá ${itinerary.days.reduce(
      (sum, d) => sum + d.items.length,
      0
    )} địa điểm tuyệt vời. `;
    content += `Tổng chi phí ước tính cho chuyến đi là ${formatVND(
      grandTotal
    )}.\n\n`;

    return content;
  };
  // Handler chọn file - CHỈ CHỌN, CHƯA UPLOAD
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("File quá lớn. Vui lòng chọn file dưới 50MB");
      e.target.value = ""; // Reset input
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Chỉ chấp nhận file ảnh hoặc video");
      e.target.value = ""; // Reset input
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);

    // Lưu file vào state
    setSelectedFile(file);

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Reset input để có thể chọn cùng file lại
    e.target.value = "";
  };

  // Handler upload media - GỌI KHI NHẤN NÚT UPLOAD
  const handleUploadMedia = async (file) => {
    if (!file) {
      alert("Vui lòng chọn file");
      return;
    }

    if (!selectedDayForMedia) {
      alert("Vui lòng chọn ngày cho media");
      return;
    }

    try {
      setUploadingFile(true);
      console.log("Starting upload for:", file.name);
      const uploadResponse = await uploadItineraryMedia(file);
      const { url, thumbnail, type } = uploadResponse;
      const mediaData = {
        mediaUrl: url,
        thumbnailUrl: thumbnail || null,
        mediaType: type, // "IMAGE" hoặc "VIDEO"
        dayNumber: selectedDayForMedia,
        caption: mediaCaption || "Không có mô tả",
        fileSize: file.size,
        duration: null,
        width: null,
        height: null,
      };

      console.log("Media data:", mediaData);

      await saveMediaInfo(itineraryId, mediaData);
      await fetchMediaFiles();

      // Reset form
      setShowMediaModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMediaCaption("");
      setSelectedDayForMedia(null);

      alert("Upload media thành công!");
    } catch (error) {
      console.error("Error uploading media:", error);
      console.error("Error details:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Không thể upload media";

      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setUploadingFile(false);
    }
  };

  // Handler xóa media
  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm("Bạn có chắc muốn xóa media này?")) return;

    try {
      await deleteMedia(itineraryId, mediaId);

      // Cập nhật UI
      setMediaFiles((prev) => prev.filter((m) => m.id !== mediaId));

      alert("Xóa media thành công!");
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("Không thể xóa media. Vui lòng thử lại.");
    }
  };

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

  const handlePublishClick = () => {
    console.log("Publish clicked");
    setShowCreateTourModal(true);
  };

  const handleCloseTourModal = () => {
    setShowCreateTourModal(false);
  };


  const grandTotal = itinerary.days.reduce(
    (sum, d) =>
      sum + d.items.reduce((s, i) => s + (Number(i.estimatedCost) || 0), 0),
    0
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      // Giả lập event cho handleFileSelect
      const fakeEvent = {
        target: {
          files: [file],
          value: "",
        },
      };
      handleFileSelect(fakeEvent);
    }
  };

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

  // Helper functions
  const getTransportIcon = (mode) => {
    if (!mode) return "🚗";
    const lowerMode = mode.toLowerCase();
    if (lowerMode.includes("xe máy") || lowerMode.includes("moto")) return "🏍️";
    if (lowerMode.includes("ô tô") || lowerMode.includes("car")) return "🚗";
    if (lowerMode.includes("đi bộ") || lowerMode.includes("walk")) return "🚶";
    if (lowerMode.includes("taxi")) return "🚕";
    if (lowerMode.includes("bus")) return "🚌";
    if (lowerMode.includes("bike") || lowerMode.includes("xe đạp")) return "🚲";
    return "🚗";
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "2 giờ";
    try {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      const duration = endHour * 60 + endMin - (startHour * 60 + startMin);

      if (duration < 60) return `${duration} phút`;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h${minutes}` : `${hours} giờ`;
    } catch {
      return "2 giờ";
    }
  };

  const calculateTotalDistance = () => {
    const totalPlaces = itinerary.days.reduce(
      (sum, d) => sum + d.items.length,
      0
    );
    return Math.round(totalPlaces * 2.5);
  };

  const calculateTotalHours = () => {
    let total = 0;
    itinerary.days.forEach((day) => {
      day.items.forEach((item) => {
        const duration = calculateDuration(item.startTime, item.endTime);
        const hours = parseInt(duration) || 2;
        total += hours;
      });
    });
    return total;
  };

  const calculateDayDistance = (currentDay, nextDay) => {
    if (!nextDay) return 0;
    return Math.round((currentDay.items.length + nextDay.items.length) * 1.5);
  };

  const formatDistance = (item1, item2) => {
    if (!item1 || !item2) return "2.5 km";
    // Simulated distance
    const distance = 2 + Math.random();
    return `${distance.toFixed(1)} km`;
  };
  // Helper functions
  const calculateDayHours = (day) => {
    let totalHours = 0;
    day.items.forEach((item) => {
      const duration = calculateDuration(item.startTime, item.endTime);
      const hours = parseInt(duration) || 2;
      totalHours += hours;
    });
    return totalHours;
  };

  const getTransportationStats = () => {
    const stats = {};

    itinerary.days.forEach((day) => {
      day.items.forEach((item) => {
        const mode = item.transportMode || "Không xác định";
        if (!stats[mode]) {
          stats[mode] = { mode, count: 0, distance: 0, time: "0h" };
        }
        stats[mode].count++;
        stats[mode].distance += 1.5; // Giả sử mỗi chặng 1.5km
      });
    });

    // Chuyển thành mảng và tính thời gian
    return Object.values(stats).map((stat) => ({
      ...stat,
      time: `${Math.round(stat.distance * 10)} phút`, // Giả sử 10 phút/km
    }));
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
            copyPlannerLink={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Đã copy link!");
            }}
            itineraryId={itinerary.id}
          />
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            {/* LOGO */}
            <div className="flex items-center gap-2 group cursor-pointer select-none">
              <div className="w-9 h-9 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
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
                  Tổng: <b className="ml-1">{formatVND(grandTotal)}</b>
                </span>
              </p>
            </div>
          </div>
          {/* Thanh chuyển mode*/}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white p-1 rounded-lg shadow-lg border border-gray-200">
            <button
              onClick={() => setViewMode("editor")}
              className={`p-2.5 rounded-md transition-all ${
                viewMode === "editor"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              title="Chế độ chỉnh sửa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2.5 rounded-md transition-all ${
                viewMode === "calendar"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              title="Lịch"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("overview")}
              className={`p-2.5 rounded-md transition-all ${
                viewMode === "overview"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              title="Tổng quan"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("media")}
              className={`p-2.5 rounded-md transition-all ${
                viewMode === "media"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              title="Thư viện ảnh"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
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
            {/* <button
              onClick={handlePublishClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              <span>Tạo Tour</span>
            </button> */}

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

      <div className="flex gap-6 flex-1 overflow-hidden">
        {viewMode === "editor" ? (
          <>
            {/* Days List - Editor Mode */}
            <div
              className={`overflow-x-auto overflow-y-hidden transition-all duration-300 p-6 ${mapSize === "full"
                ? "w-1/4"
                : mapSize === "half"
                  ? "w-1/2"
                  : "w-3/4"
                }`}
            >
              <div className="flex gap-4 min-w-max h-full">
                <DragDropContext onDragEnd={handleDragEnd}>
                  {itinerary.days.map((day) => {
                    const dayWarnings =
                      warningsByDay?.[String(day.dayNumber)] || [];
                    const warningsCount = Array.isArray(dayWarnings)
                      ? dayWarnings.length
                      : 0;

                    return (
                      <div
                        key={day.dayNumber}
                        className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl shadow w-96 flex-shrink-0 flex flex-col max-h-full"
                      >
                        {/* Header */}
                        <div className="flex justify-between items-center flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-base">
                              Ngày {day.dayNumber} ({day.date})
                            </h3>

                            {warningsCount > 0 && (
                              <div
                                onClick={() =>
                                  setOpenWarningDay(
                                    openWarningDay === day.dayNumber
                                      ? null
                                      : day.dayNumber
                                  )
                                }
                                className="flex items-center gap-1.5 text-xs text-orange-600 cursor-pointer select-none hover:text-orange-700 bg-orange-50 px-2 py-1 rounded-full"
                              >
                                <ShieldAlert size={14} />
                                <span>{warningsCount}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Nút thêm địa điểm */}
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

                            {/* Menu 3 chấm chỉ khi có quyền */}
                            {itinerary?.canEdit && (
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
                                      initial={{
                                        opacity: 0,
                                        scale: 0.95,
                                        y: -5,
                                      }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{
                                        opacity: 0,
                                        scale: 0.95,
                                        y: -5,
                                      }}
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
                            )}
                          </div>
                        </div>

                        {/* ===== WARNINGS PANEL ===== */}
                        <AnimatePresence>
                          {openWarningDay === day.dayNumber &&
                            warningsCount > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3 mb-2 rounded-2xl p-3 bg-gradient-to-br from-orange-50 to-white border border-orange-200 shadow-sm overflow-hidden flex-shrink-0"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 text-orange-700 font-semibold">
                                    <AlertTriangle size={16} />
                                    <span>Cảnh báo trong ngày</span>
                                  </div>
                                  <span className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-0.5 rounded-full">
                                    {warningsCount} vấn đề
                                  </span>
                                </div>

                                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                  {dayWarnings.map((w, idx) => {
                                    const typeStyle =
                                      {
                                        CLOSED:
                                          "bg-red-50 text-red-700 border-red-200",
                                        PARTIAL_OPEN:
                                          "bg-yellow-50 text-yellow-700 border-yellow-200",
                                        NOT_ENOUGH_TRAVEL:
                                          "bg-orange-50 text-orange-700 border-orange-200",
                                        SHORT_VISIT:
                                          "bg-purple-50 text-purple-700 border-purple-200",
                                        MISSING_DATA:
                                          "bg-gray-50 text-gray-700 border-gray-200",
                                      }[w.type] ||
                                      "bg-blue-50 text-blue-700 border-blue-200";

                                    return (
                                      <div
                                        key={idx}
                                        className={`border rounded-xl p-3 shadow-sm ${typeStyle}`}
                                      >
                                        <div className="flex items-start gap-2">
                                          <ShieldAlert
                                            size={16}
                                            className="mt-0.5 flex-shrink-0"
                                          />
                                          <div>
                                            {/* <div className="text-xs font-semibold tracking-wide uppercase">
                                              {w.type}
                                            </div> */}
                                            <p className="text-xs leading-snug opacity-90 mt-0.5">
                                              {w.message}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 mt-2">
                          {day.items.length === 0 && (
                            <p className="text-gray-400 text-center py-8 text-sm">
                              Chưa có địa điểm nào. Nhấn "Thêm" để bắt đầu.
                            </p>
                          )}

                          <Droppable
                            droppableId={String(day.dayNumber)}
                            type="ITEM"
                            isDropDisabled={!itinerary?.canEdit}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`space-y-3 min-h-[100px] ${snapshot.isDraggingOver
                                  ? "bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg"
                                  : ""
                                  }`}
                              >
                                {day.items.map((item, index) => (
                                  <Draggable
                                    key={item.id}
                                    draggableId={String(item.id)}
                                    index={index}
                                    isDragDisabled={!itinerary?.canEdit}
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
                                          className={`transition-transform ${snapshot.isDragging
                                            ? "scale-[1.02] shadow-lg"
                                            : ""
                                            }`}
                                        >
                                          <DayItemCard
                                            item={item}
                                            readOnly={!itinerary?.canEdit}
                                            onRemove={removeItem}
                                            onUpdate={updateItem}
                                            onClick={(clickedItem) => {
                                              setSelectedPlaceForDetail({
                                                id: clickedItem.placeId,
                                                name: clickedItem.placeName,
                                              });
                                            }}
                                            onSuggest={(clickedItem) => {
                                              if (!itinerary?.canEdit) return;
                                              setLastAddedPlace({
                                                id: clickedItem.placeId,
                                                name: clickedItem.placeName,
                                                dayNumber:
                                                  clickedItem.dayNumber,
                                              });
                                              setShowSuggestionsModal(true);
                                            }}
                                          />
                                        </div>

                                        {/* Khoảng cách đến điểm tiếp theo */}
                                        {index < day.items.length - 1 &&
                                          (() => {
                                            const next = day.items[index + 1];
                                            const dist = formatDistance(
                                              item,
                                              next
                                            );
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

            {/* Map - Editor Mode */}
            <div
              className={`transition-all duration-300 flex-shrink-0 ${mapSize === "full"
                ? "w-3/4"
                : mapSize === "half"
                  ? "w-1/2"
                  : "w-1/4"
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
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition ${mapSize === "default"
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
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition ${mapSize === "half"
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
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition ${mapSize === "full"
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
                    places={getRouteItems()}
                    image={itinerary.destinationImage}
                    hoveredPlaceId={hoveredItemId}
                    provider="google-roadmap"
                  />
                </div>
              </div>
            </div>
          </>
        ) : viewMode === "calendar" ? (
          /* Calendar Mode */
          <div className="flex-1 overflow-hidden flex">
            {/* Calendar Timeline */}
            <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
              <div className="min-w-max">
                {/* Header với các ngày */}
                <div className="sticky top-0 z-10 bg-white border-b-2 border-gray-300 flex">
                  {/* Cột giờ */}
                  <div className="w-20 flex-shrink-0 border-r border-gray-300 bg-gray-50">
                    <div className="h-24 flex items-center justify-center">
                      <span className="text-xs text-gray-500 font-medium">
                        All day
                      </span>
                    </div>
                  </div>

                  {/* Các cột ngày */}
                  {itinerary.days.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="w-64 flex-shrink-0 border-r border-gray-300"
                    >
                      <div className="p-4 text-center flex items-center justify-center h-full">
                        <div className="text-xs text-gray-500 font-medium mb-1">
                          Day {day.dayNumber}:{" "}
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grid giờ và sự kiện */}
                <div className="relative">
                  {/* Grid nền */}
                  <div className="flex">
                    {/* Cột giờ */}
                    <div className="w-20 flex-shrink-0 border-r border-gray-200">
                      {Array.from({ length: 24 }, (_, i) => (
                        <div
                          key={i}
                          className="h-16 border-b border-gray-200 text-right pr-2 pt-1"
                        >
                          <span className="text-xs text-gray-500">
                            {i.toString().padStart(2, "0")}:00
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Các cột ngày với grid */}
                    {itinerary.days.map((day) => (
                      <div
                        key={day.dayNumber}
                        className="w-64 flex-shrink-0 border-r border-gray-200 relative"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <div
                            key={i}
                            className="h-16 border-b border-gray-200"
                          />
                        ))}

                        {/* Các sự kiện trong ngày */}
                        <div className="absolute inset-0 pointer-events-none">
                          {day.items.map((item, idx) => {
                            const [startHour, startMin] = (
                              item.startTime || "09:00"
                            )
                              .split(":")
                              .map(Number);
                            const [endHour, endMin] = (item.endTime || "11:00")
                              .split(":")
                              .map(Number);

                            const startMinutes = startHour * 60 + startMin;
                            const endMinutes = endHour * 60 + endMin;
                            const duration = endMinutes - startMinutes;

                            const top = (startMinutes / 60) * 64; // 64px per hour
                            const height = (duration / 60) * 64;

                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setSelectedPlaceForDetail({
                                    id: item.placeId,
                                    name: item.placeName,
                                  });
                                }}
                                className="absolute left-1 right-1 rounded-lg p-2 shadow-sm pointer-events-auto cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                                style={{
                                  top: `${top}px`,
                                  height: `${Math.max(height, 40)}px`,
                                  backgroundColor: "#86efac",
                                  borderLeft: "3px solid #22c55e",
                                }}
                              >
                                <div className="text-xs font-semibold text-gray-800 truncate">
                                  {item.startTime} - {item.endTime}
                                </div>
                                <div className="text-xs text-gray-700 font-medium truncate mt-0.5 flex items-center gap-1">
                                  📍 {item.placeName}
                                </div>
                                {item.estimatedCost > 0 && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    💰 {formatVND(item.estimatedCost)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Map - Editor Mode */}
            <div
              className={`transition-all duration-300 flex-shrink-0 ${mapSize === "full"
                ? "w-3/4"
                : mapSize === "half"
                  ? "w-1/2"
                  : "w-1/4"
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
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition ${mapSize === "default"
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
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition ${mapSize === "half"
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
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition ${mapSize === "full"
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
                    places={getRouteItems()}
                    image={itinerary.destinationImage}
                    hoveredPlaceId={hoveredItemId}
                    provider="google-roadmap"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === "media" ? (
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      📸 Thư viện Ảnh
                    </h2>
                    <p className="text-gray-600">
                      Tải và quản lý ảnh, video cho lịch trình của bạn
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBlogPreview(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Eye size={18} />
                      Xem trước bài viết
                    </button>
                    <button
                      onClick={() => {
                        if (!itinerary?.canEdit) return;
                        setSelectedDayForMedia(null);
                        setMediaCaption("");
                        setShowMediaModal(true);
                      }}
                      disabled={!itinerary?.canEdit}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${itinerary?.canEdit
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <Plus size={18} />
                      Tải ảnh lên
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-sm text-blue-600 font-medium mb-1">
                      Tổng media
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {mediaFiles.length}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="text-sm text-purple-600 font-medium mb-1">
                      Hình ảnh
                    </div>
                    <div className="text-2xl font-bold text-purple-700">
                      {mediaFiles.filter((m) => m.type === "image").length}
                    </div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                    <div className="text-sm text-pink-600 font-medium mb-1">
                      Video
                    </div>
                    <div className="text-2xl font-bold text-pink-700">
                      {mediaFiles.filter((m) => m.type === "video").length}
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <div className="text-sm text-emerald-600 font-medium mb-1">
                      Ngày có ảnh/video
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {new Set(mediaFiles.map((m) => m.dayNumber)).size}
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loadingMedia && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Đang tải media...</p>
                </div>
              )}

              {/* Media by Days */}
              {!loadingMedia &&
                itinerary.days.map((day) => {
                  const dayMedia = mediaFiles.filter(
                    (m) => m.dayNumber === day.dayNumber
                  );

                  if (dayMedia.length === 0) return null;

                  return (
                    <div key={day.dayNumber} className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          Ngày {day.dayNumber} - {day.date}
                        </h3>
                        <button
                          onClick={() => {
                            if (!itinerary?.canEdit) return;
                            setSelectedDayForMedia(day.dayNumber);
                            setMediaCaption("");
                            setShowMediaModal(true);
                          }}
                          disabled={!itinerary?.canEdit}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${itinerary?.canEdit
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          <Plus size={16} />
                          Thêm ảnh/video
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        {dayMedia.map((media) => (
                          <div
                            key={media.id}
                            onClick={() => setSelectedMedia(media)}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                          >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                              {media.type === "image" ? (
                                <img
                                  src={media.url}
                                  alt={media.caption}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="relative w-full h-full">
                                  <img
                                    src={media.thumbnail || media.url}
                                    alt={media.caption}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                      >
                                        <path
                                          d="M8 5v14l11-7L8 5z"
                                          fill="#1f2937"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {itinerary?.canEdit && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMedia(media.id);
                                  }}
                                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-gray-900 font-medium line-clamp-2 mb-1">
                                {media.caption}
                              </p>
                              <p className="text-xs text-gray-500">
                                {media.uploadedBy} •{" "}
                                {new Date(media.uploadedAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

              {/* Empty State */}
              {!loadingMedia && mediaFiles.length === 0 && (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <div className="text-6xl mb-4">📸</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Chưa có media nào
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Bắt đầu upload ảnh và video để lưu lại những khoảnh khắc đẹp
                    trong chuyến đi
                  </p>
                  <button
                    onClick={() => {
                      setMediaCaption("");
                      setShowMediaModal(true);
                    }}
                    disabled={!itinerary?.canEdit}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${itinerary?.canEdit
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    Tải ảnh/video đầu tiên
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex gap-6 p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
            {/* Left side - Full Width Journey Path Timeline */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                {/* Journey Path Timeline */}
                <div className="relative min-h-screen py-8">
                  {/* Background Path Line */}
                  <div className="absolute left-8 right-8 top-0 bottom-0 hidden md:block">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                      <path
                        d="M 0,100 
                 C 150,80 250,120 400,100
                 S 600,80 800,100
                 S 1000,120 1200,100"
                        fill="none"
                        stroke="url(#journeyGradient)"
                        strokeWidth="4"
                        strokeDasharray="15,10"
                      />
                      <defs>
                        <linearGradient
                          id="journeyGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>

                      {/* Animated travel car */}
                      <circle
                        r="8"
                        fill="#ef4444"
                        stroke="white"
                        strokeWidth="3"
                      >
                        <animateMotion
                          dur="20s"
                          repeatCount="indefinite"
                          path="M 0,100 
                      C 150,80 250,120 400,100
                      S 600,80 800,100
                      S 1000,120 1200,100"
                        />
                        <animate
                          attributeName="r"
                          values="6;8;6"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                  </div>

                  {/* Journey Content */}
                  <div className="relative z-10">
                    {itinerary.days.map((day, dayIndex) => {
                      const daySubtotal = day.items.reduce(
                        (s, i) => s + (Number(i.estimatedCost) || 0),
                        0
                      );

                      return (
                        <div
                          key={day.dayNumber}
                          id={`day-${dayIndex}`}
                          className="mb-20"
                        >
                          {/* Day Header */}
                          <div className="top-8 z-20 mb-12 bg-gradient-to-b from-white via-white/95 to-transparent">
                            <div className="inline-flex items-center gap-6 bg-white/95 backdrop-blur-md rounded-2xl px-8 py-6 shadow-xl border border-gray-200 max-w-2xl mx-auto">
                              <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                  {day.dayNumber}
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white text-sm flex items-center justify-center animate-pulse">
                                  {day.items.length}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900">
                                  Ngày {day.dayNumber}
                                </h3>
                                <p className="text-gray-600">{day.date}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-sm text-gray-500">
                                    {day.items.length} địa điểm
                                  </span>
                                  <span className="text-sm font-bold text-emerald-600">
                                    {formatVND(daySubtotal)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <button
                                  onClick={() => {
                                    const element = document.getElementById(
                                      `day-content-${dayIndex}`
                                    );
                                    element?.classList.toggle("hidden");
                                  }}
                                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                                >
                                  {day.items.length > 0
                                    ? "Xem chi tiết"
                                    : "Thêm địa điểm"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Day's Journey Path */}
                          {day.items.length > 0 && (
                            <div
                              id={`day-content-${dayIndex}`}
                              className="relative ml-12 md:ml-24"
                            >
                              {/* Vertical connector line */}
                              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-300 via-purple-300 to-pink-300 rounded-full">
                                {/* Animated progress dots */}
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full border-3 border-blue-500 animate-pulse"
                                    style={{
                                      top: `${20 + i * 15}%`,
                                      animationDelay: `${i * 0.2}s`,
                                    }}
                                  ></div>
                                ))}
                              </div>

                              {/* Places along the journey */}
                              <div className="space-y-10 pl-10">
                                {day.items.map((item, itemIndex) => (
                                  <div
                                    key={item.id}
                                    className={`relative group ${
                                      itemIndex % 2 === 0
                                        ? "transform hover:-translate-x-3"
                                        : "transform hover:translate-x-3"
                                    } transition-all duration-500`}
                                    style={{
                                      marginLeft: `${Math.min(
                                        itemIndex * 16,
                                        64
                                      )}px`,
                                      animationDelay: `${itemIndex * 0.1}s`,
                                    }}
                                    onMouseEnter={() =>
                                      setHoveredItemId(item.id)
                                    }
                                    onClick={() =>
                                      setSelectedPlaceForDetail({
                                        id: item.placeId,
                                        name: item.placeName,
                                      })
                                    }
                                  >
                                    {/* Journey marker */}
                                    <div className="absolute -left-10 top-1/2 transform -translate-y-1/2">
                                      <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center shadow-xl">
                                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                        </div>
                                        <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping"></div>
                                      </div>
                                    </div>

                                    {/* Time badge */}
                                    <div
                                      className={`absolute ${
                                        itemIndex % 2 === 0
                                          ? "-top-2 -right-2"
                                          : "-top-2 -left-2"
                                      } z-10`}
                                    >
                                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-lg shadow-lg">
                                        <div className="text-sm font-bold">
                                          {item.startTime}
                                        </div>
                                        <div className="text-xs opacity-90">
                                          → {item.endTime}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Place Card */}
                                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.03]">
                                      {/* Card Content */}
                                      <div className="p-6">
                                        <div className="flex items-start gap-6">
                                          {/* Image */}
                                          <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-100">
                                            <img
                                              src={item.placeImage}
                                              alt={item.placeName}
                                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                          </div>

                                          {/* Info */}
                                          <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                              <div>
                                                <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                  {item.placeName}
                                                </h4>
                                                <p className="text-gray-600 text-sm flex items-center gap-2 mb-3">
                                                  <span className="text-blue-500">
                                                    📍
                                                  </span>
                                                  <span className="line-clamp-1">
                                                    {item.placeAddress}
                                                  </span>
                                                </p>
                                              </div>
                                              {item.estimatedCost > 0 && (
                                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
                                                  {formatVND(
                                                    item.estimatedCost
                                                  )}
                                                </div>
                                              )}
                                            </div>

                                            {/* Quick info badges */}
                                            <div className="flex flex-wrap gap-3 mb-4">
                                              {item.transportMode && (
                                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                  {getTransportIcon(
                                                    item.transportMode
                                                  )}{" "}
                                                  {item.transportMode}
                                                </span>
                                              )}
                                              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                ⏱️{" "}
                                                {calculateDuration(
                                                  item.startTime,
                                                  item.endTime
                                                )}
                                              </span>
                                              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                                ⭐ 4.5
                                              </span>
                                            </div>

                                            {/* Description */}
                                            {item.description && (
                                              <p className="text-gray-600 text-sm line-clamp-2 mb-6">
                                                {item.description}
                                              </p>
                                            )}

                                            {/* Action buttons */}
                                            <div className="flex gap-3">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedPlaceForDetail({
                                                    id: item.placeId,
                                                    name: item.placeName,
                                                  });
                                                }}
                                                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3"
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="18"
                                                  height="18"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                >
                                                  <circle
                                                    cx="11"
                                                    cy="11"
                                                    r="8"
                                                  />
                                                  <path d="m21 21-4.3-4.3" />
                                                </svg>
                                                Xem chi tiết
                                              </button>
                                              <button
                                                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-gray-700 font-medium transition-all duration-300"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                Đánh dấu
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Hover gradient overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                                    </div>

                                    {/* Transportation to next location */}
                                    {itemIndex < day.items.length - 1 && (
                                      <div className="relative h-12 flex items-center justify-center">
                                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full"></div>
                                        <div className="absolute left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-lg flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center animate-bounce">
                                            {getTransportIcon(
                                              item.transportMode
                                            )}
                                          </div>
                                          <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                              5 phút di chuyển
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                              Khoảng 1.5 km
                                            </div>
                                          </div>
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-blue-500"
                                          >
                                            <path d="m6 9 6 6 6-6" />
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Empty state for day */}
                          {day.items.length === 0 && (
                            <div className="text-center py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl border-2 border-dashed border-gray-300 mx-6">
                              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="40"
                                  height="40"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-400"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="8" x2="12" y2="12" />
                                  <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                              </div>
                              <h4 className="text-xl font-bold text-gray-700 mb-2">
                                Chưa có địa điểm nào
                              </h4>
                              <p className="text-gray-500 mb-6">
                                Thêm địa điểm để bắt đầu hành trình ngày{" "}
                                {day.dayNumber}
                              </p>
                              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow">
                                + Thêm địa điểm đầu tiên
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Combined Journey Summary */}
            <div className="w-[450px] flex-shrink-0">
              <div className="sticky top-6 h-[calc(100vh-48px)]">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-full flex flex-col">
                  {/* Combined Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-purple-50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Tổng Quan Hành Trình
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Thống kê chi tiết về chuyến đi của bạn
                        </p>
                      </div>
                    </div>

                    {/* Journey Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-blue-600"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-blue-600">
                              Tổng số ngày
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {itinerary.days.length}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-purple-600"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-purple-600">
                              Tổng địa điểm
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {itinerary.days.reduce(
                                (sum, d) => sum + d.items.length,
                                0
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-emerald-600"
                            >
                              <line x1="12" y1="1" x2="12" y2="23" />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-emerald-600">
                              Tổng chi phí
                            </div>
                            <div className="text-xl font-bold text-emerald-700">
                              {formatVND(grandTotal)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-amber-600"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-amber-600">
                              Tổng quãng đường
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {calculateTotalDistance()} km
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable content */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Daily Breakdown */}
                    <div className="p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        Chi tiết theo ngày
                      </h4>
                      <div className="space-y-4">
                        {itinerary.days.map((day, idx) => {
                          const daySubtotal = day.items.reduce(
                            (s, i) => s + (Number(i.estimatedCost) || 0),
                            0
                          );
                          const dayDistance = calculateDayDistance(
                            day,
                            itinerary.days[idx + 1]
                          );

                          return (
                            <div
                              key={day.dayNumber}
                              className="group relative bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                              onClick={() => {
                                const element = document.getElementById(
                                  `day-${idx}`
                                );
                                if (element) {
                                  element.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                      {day.dayNumber}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">
                                      {day.items.length}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      Ngày {day.dayNumber}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {day.date}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-emerald-600">
                                    {formatVND(daySubtotal)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {dayDistance} km
                                  </div>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="mt-3">
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${Math.min(
                                        (day.items.length / 8) * 100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>{day.items.length} địa điểm</span>
                                  <span>{calculateDayHours(day)} giờ</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cost Distribution */}
                    <div className="px-6 pb-6">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
                        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span>💰</span>
                          Phân bổ chi phí
                        </h4>
                        <div className="space-y-3">
                          {itinerary.days.map((day, idx) => {
                            const subtotal = day.items.reduce(
                              (s, i) => s + (Number(i.estimatedCost) || 0),
                              0
                            );
                            const percentage =
                              grandTotal > 0
                                ? (subtotal / grandTotal) * 100
                                : 0;

                            return (
                              <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700">
                                    Ngày {day.dayNumber}
                                  </span>
                                  <span className="font-medium">
                                    {formatVND(subtotal)}
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Transportation Summary */}
                    <div className="px-6 pb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          Phương tiện di chuyển
                        </h4>
                        <div className="space-y-3">
                          {getTransportationStats().map((stat, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                  {getTransportIcon(stat.mode)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {stat.mode}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {stat.count} lần
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {stat.distance} km
                                </div>
                                <div className="text-xs text-gray-500">
                                  {stat.time}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Export & Actions */}
                    <div className="p-6 border-t border-gray-200">
                      <h4 className="text-sm font-bold text-gray-900 mb-4">
                        Tác vụ nhanh
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-3 group-hover:bg-blue-50">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-600"
                              >
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <line x1="10" y1="9" x2="8" y2="9" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-blue-700">
                              Xuất PDF
                            </span>
                          </div>
                        </button>

                        <button className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all group">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-3 group-hover:bg-purple-50">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-purple-600"
                              >
                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                                <path d="M18 14h-8" />
                                <path d="M15 18h-5" />
                                <path d="M10 6h8v4h-8V6Z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-purple-700">
                              Google Maps
                            </span>
                          </div>
                        </button>

                        <button className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-3 group-hover:bg-emerald-50">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-emerald-600"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-emerald-700">
                              Chia sẻ
                            </span>
                          </div>
                        </button>

                        <button className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl hover:border-amber-500 hover:shadow-md transition-all group">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-3 group-hover:bg-amber-50">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-amber-600"
                              >
                                <path d="M3 3h18v18H3z" />
                                <path d="m9 9 6 6" />
                                <path d="m15 9-6 6" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-amber-700">
                              Huỷ hành trình
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
      {/* Create Tour Modal */}
      {showCreateTourModal && (
        <CreateTourModal onClose={() => setShowCreateTourModal(false)} />
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

      {/* Modal Upload Media */}
      {showMediaModal && itinerary?.canEdit && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={() => {
              if (!uploadingFile) {
                setShowMediaModal(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setMediaCaption("");
              }
            }}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  Tải ảnh/video
                </h3>
                <button
                  onClick={() => {
                    if (!uploadingFile) {
                      setShowMediaModal(false);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setMediaCaption("");
                    }
                  }}
                  disabled={uploadingFile}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
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

            <div className="p-6">
              {/* Preview nếu đã chọn file */}
              {previewUrl && selectedFile && (
                <div className="mb-4 rounded-lg overflow-hidden border-2 border-gray-200">
                  {selectedFile.type.startsWith("image/") ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      className="w-full h-64 object-cover"
                      controls
                    />
                  )}
                  <div className="bg-gray-50 p-3 text-sm">
                    <p className="font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-gray-50 hover:bg-blue-50 cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="mediaFileInput"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploadingFile}
                />

                <label
                  htmlFor="mediaFileInput"
                  className="cursor-pointer block"
                >
                  <div className="text-5xl mb-4">
                    {uploadingFile ? "⏳" : "📤"}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {uploadingFile
                      ? "Đang upload..."
                      : "Kéo thả file hoặc click để chọn"}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Hỗ trợ: JPG, PNG, GIF, MP4, MOV (Max 50MB)
                  </p>
                  {!uploadingFile && (
                    <span className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Chọn file
                    </span>
                  )}
                </label>

                {/* Progress bar khi đang upload */}
                {uploadingFile && (
                  <div className="mt-4 max-w-md mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full animate-pulse"
                        style={{ width: "70%" }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form chỉ hiện khi đã chọn file */}
              {selectedFile && !uploadingFile && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn ngày <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDayForMedia || ""}
                      onChange={(e) =>
                        setSelectedDayForMedia(Number(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">-- Chọn ngày --</option>
                      {itinerary.days.map((day) => (
                        <option key={day.dayNumber} value={day.dayNumber}>
                          Ngày {day.dayNumber} - {day.date}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={mediaCaption}
                      onChange={(e) => setMediaCaption(e.target.value)}
                      placeholder="Thêm mô tả cho media..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowMediaModal(false);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setMediaCaption("");
                        setSelectedDayForMedia(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => handleUploadMedia(selectedFile)}
                      disabled={!selectedDayForMedia}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${selectedDayForMedia
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      Upload
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal View Media Detail */}
      {selectedMedia && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
            onClick={() => setSelectedMedia(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90vw] max-w-4xl">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">
                  {selectedMedia.caption}
                </h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-400 hover:text-gray-600"
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
              <div className="bg-black">
                {selectedMedia.type === "image" ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.caption}
                    className="w-full max-h-[70vh] object-contain"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="w-full max-h-[70vh]"
                  />
                )}
              </div>
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Uploaded by {selectedMedia.uploadedBy} •{" "}
                  {new Date(selectedMedia.uploadedAt).toLocaleString("vi-VN")}
                </p>
                {selectedMedia.fileSize && (
                  <p className="text-xs text-gray-500 mt-1">
                    Kích thước:{" "}
                    {(selectedMedia.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {/* Modal Blog Preview */}
      {showBlogPreview && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={() => setShowBlogPreview(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white rounded-2xl shadow-2xl w-[900px] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  Preview Blog Post
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleShareToBlog}
                    disabled={isSharing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSharing ? "Đang chia sẻ..." : "Chia sẻ lên Blog"}
                  </button>
                  <button
                    onClick={() => setShowBlogPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
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
            </div>

            <div className="p-8">
              {/* Blog Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {itinerary.title}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-2">
                    <MapPin size={18} />
                    {itinerary.destination}
                  </span>
                  <span>•</span>
                  <span>
                    {itinerary.startDate} → {itinerary.endDate}
                  </span>
                  <span>•</span>
                  <span>{itinerary.days.length} ngày</span>
                </div>
              </div>

              {/* Blog Content */}
              {itinerary.days.map((day) => {
                const dayMedia = mediaFiles.filter(
                  (m) => m.dayNumber === day.dayNumber
                );

                return (
                  <div key={day.dayNumber} className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Ngày {day.dayNumber}: {day.date}
                    </h2>

                    {/* Day description */}
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Hôm nay chúng tôi đã khám phá {day.items.length} địa điểm
                      tuyệt vời. Hành trình bắt đầu từ{" "}
                      {day.items[0]?.placeName || "..."} và kết thúc tại{" "}
                      {day.items[day.items.length - 1]?.placeName || "..."}.
                    </p>

                    {/* Media Gallery */}
                    {dayMedia.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {dayMedia.map((media) => (
                          <div
                            key={media.id}
                            className="rounded-lg overflow-hidden"
                          >
                            {media.type === "image" ? (
                              <img
                                src={media.url}
                                alt={media.caption}
                                className="w-full h-64 object-cover"
                              />
                            ) : (
                              <div className="relative">
                                <img
                                  src={media.thumbnail}
                                  alt={media.caption}
                                  className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <path
                                        d="M8 5v14l11-7L8 5z"
                                        fill="#1f2937"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mt-2 italic">
                              {media.caption}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Places */}
                    <div className="space-y-4">
                      {day.items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {item.placeName}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.description ||
                                "Một địa điểm tuyệt vời đáng để ghé thăm."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Blog Footer */}
              <div className="border-t border-gray-200 pt-8 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Tổng kết chuyến đi
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Đây thực sự là một chuyến đi đáng nhớ với tổng cộng{" "}
                  {itinerary.days.length} ngày khám phá{" "}
                  {itinerary.days.reduce((sum, d) => sum + d.items.length, 0)}{" "}
                  địa điểm tuyệt vời. Tổng chi phí ước tính cho chuyến đi là{" "}
                  {formatVND(grandTotal)}.
                </p>
              </div>
            </div>
          </div>

        </>
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
