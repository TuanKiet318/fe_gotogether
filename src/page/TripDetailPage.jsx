import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar, Clock, DollarSign, Navigation, MapPin,
  ArrowLeft, Plus, Edit2, Trash2, Save, X
} from "lucide-react";
import { getItineraryById, updateItem, createItem /*, createItem, updateItem, deleteItem */ } from "../service/tripService";
import { GetMyFavoritePlaces } from "../service/api.admin.service";


export default function TripDetailPage() {
  const { id } = useParams(); // /trip/:id
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    startTime: "",
    endTime: "",
    estimatedCost: "",
    transportMode: "",
    dayNumber: 1
  });


  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const trimSec = (t) => (t ? String(t).slice(0, 5) : "");
  const vnd = (n) =>
    n === null || n === undefined || n === ""
      ? ""
      : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(+n);

  // Helper nhóm items theo ngày
  const groupItemsByDay = (items) => {
    const grouped = {};
    items.forEach(item => {
      const day = item.dayNumber || 1;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(item);
    });
    return grouped;
  };

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        setErrMsg("");
        const data = await getItineraryById(id);
        // Kỳ vọng BE trả: { id, title, startDate:"YYYY-MM-DD", endDate:"YYYY-MM-DD", items:[...] }
        const items = Array.isArray(data.items)
          ? data.items.map((it, idx) => ({
            id: it.id ?? idx,
            description: it.description ?? "",
            startTime: trimSec(it.startTime),
            endTime: trimSec(it.endTime),
            estimatedCost: it.estimatedCost ?? "",
            transportMode: it.transportMode ?? "",
            dayNumber: it.dayNumber ?? 1
          }))
          : [];

        if (mounted) {
          setTrip({
            id: data.id,
            title: data.title,
            startDate: fmtDate(data.startDate),
            endDate: fmtDate(data.endDate),
            itemsByDay: groupItemsByDay(items)
          });
        }
      } catch (e) {
        if (mounted) setErrMsg("Không tải được chi tiết lịch trình.");
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) fetchData();
    return () => { mounted = false; };
  }, [id]);
  // load favorites
  useEffect(() => {
    async function fetchFavorites() {
      try {
        setLoadingFavorites(true);
        const res = await GetMyFavoritePlaces();
        setFavorites(res || []);
      } catch (e) {
        console.error("Không tải được danh sách địa điểm yêu thích", e);
      } finally {
        setLoadingFavorites(false);
      }
    }
    fetchFavorites();
  }, []);
  const resetForm = () => {
    setFormData({
      description: "",
      startTime: "",
      endTime: "",
      estimatedCost: "",
      transportMode: "",
      dayNumber: 1
    });
  };


  const handleAddItem = async () => {
    if (!formData.description || !formData.startTime || !formData.endTime) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      // Gửi request tạo item
      await createItem(trip.id, {
        ...formData,
        estimatedCost: formData.estimatedCost
          ? +formData.estimatedCost
          : undefined,
      });

      // ✅ Sau khi thêm thành công → gọi lại API itinerary
      const res = await axios.get(`/api/itineraries/${trip.id}`);
      setTrip(res.data); // refresh lại toàn bộ chuyến đi

      resetForm();
      setIsAddingItem(false);
    } catch (err) {
      console.error("Lỗi khi thêm item:", err);
      alert("Thêm thất bại!");
    }
  };



  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setFormData({
      description: item.description,
      startTime: item.startTime,
      endTime: item.endTime,
      estimatedCost: item.estimatedCost || "",
      transportMode: item.transportMode || "",
      dayNumber: item.dayNumber || 1
    });
  };

  const handleUpdateItem = async () => {
    if (!formData.description || !formData.startTime || !formData.endTime) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      // Gọi API để lưu thay đổi trên backend
      await updateItem(trip.id, editingItemId, {
        dayNumber: formData.dayNumber,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description,
        estimatedCost: formData.estimatedCost ? +formData.estimatedCost : undefined,
        transportMode: formData.transportMode || undefined
      });

      // Cập nhật state frontend
      setTrip(prev => {
        const grouped = { ...prev.itemsByDay };
        // Xóa item cũ
        Object.keys(grouped).forEach(day => {
          grouped[day] = grouped[day].filter(i => i.id !== editingItemId);
        });
        // Thêm item mới vào ngày hiện tại
        const day = formData.dayNumber;
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push({ ...formData, id: editingItemId });
        return { ...prev, itemsByDay: grouped };
      });

      resetForm();
      setEditingItemId(null);
    } catch (error) {
      console.error(error);
      alert("Cập nhật hoạt động thất bại!");
    }
  };

  // favorites
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Khi chọn từ favorites
  const handleAddFromFavorite = (fav) => {
    setIsAddingItem(true);
    setFormData({
      ...formData,
      placeId: fav.id,
      description: fav.name,
      transportMode: "",
      estimatedCost: "",
    });
  };

  const handleDeleteItem = (itemId) => {
    if (!confirm("Bạn có chắc muốn xóa hoạt động này?")) return;
    setTrip(prev => {
      const grouped = { ...prev.itemsByDay };
      Object.keys(grouped).forEach(day => {
        grouped[day] = grouped[day].filter(i => i.id !== itemId);
      });
      return { ...prev, itemsByDay: grouped };
    });
  };

  const handleCancelEdit = () => {
    resetForm();
    setEditingItemId(null);
    setIsAddingItem(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải chi tiết lịch trình...</p>
        </div>
      </div>
    );
  }

  if (errMsg || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{errMsg || "Không tìm thấy lịch trình"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 py-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full hover:bg-gray-50 transition-all shadow-sm hover:shadow-md border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Quay lại</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Trip Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl mb-8 text-white">
          <h1 className="text-4xl font-bold mb-4">{trip.title}</h1>
          <div className="flex items-center gap-2 text-blue-100">
            <Calendar className="w-5 h-5" />
            <span className="text-lg">{trip.startDate} → {trip.endDate}</span>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAddingItem || editingItemId) && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingItemId ? "Chỉnh sửa hoạt động" : "Thêm hoạt động mới"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.dayNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, dayNumber: +e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả hoạt động <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ví dụ: Thăm quan bảo tàng..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chi phí ước tính
                </label>
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedCost: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ví dụ: 500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương tiện
                </label>
                <input
                  type="text"
                  value={formData.transportMode}
                  onChange={(e) =>
                    setFormData({ ...formData, transportMode: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ví dụ: Tàu điện ngầm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={editingItemId ? handleUpdateItem : handleAddItem}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" /> Lưu hoạt động
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Favorite Places */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Địa điểm yêu thích</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="p-4 bg-yellow-50 rounded-xl shadow hover:shadow-md transition-all border border-yellow-100"
              >
                <h4 className="font-semibold text-gray-800 mb-2">{fav.name}</h4>
                <p className="text-sm text-gray-600 mb-1">Phương tiện: {fav.transport}</p>
                <p className="text-sm text-gray-600 mb-3">
                  Chi phí gợi ý: {vnd(fav.defaultCost)}
                </p>
                <button
                  onClick={() => handleAddFromFavorite(fav)}
                  className="w-full px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  + Thêm vào lịch trình
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Activities by Day */}
        {Object.keys(trip.itemsByDay).sort((a, b) => a - b).map(day => (
          <div key={day} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Ngày {day}</h2>
            <div className="space-y-4">
              {trip.itemsByDay[day].map((item, index) => (
                <div key={item.id}>
                  {editingItemId === item.id ? (
                    // Form chỉnh sửa
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Chỉnh sửa hoạt động</h3>
                      <div className="space-y-4">
                        {/* Form edit giống form thêm, bỏ lặp code tương tự */}
                        {/* Bạn có thể copy lại form thêm ở trên và thay handleAddItem -> handleUpdateItem */}
                      </div>
                    </div>
                  ) : (
                    // Hiển thị item
                    <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                      <div className="absolute -left-3 top-6 w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="ml-6 pr-20">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors">
                          {item.description}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Thời gian</p>
                              <p className="text-sm font-semibold text-gray-800">{item.startTime} - {item.endTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Chi phí ước tính</p>
                              <p className="text-sm font-semibold text-gray-800">{item.estimatedCost ? vnd(item.estimatedCost) : "Chưa xác định"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3 md:col-span-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Navigation className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Phương tiện di chuyển</p>
                              <p className="text-sm font-semibold text-gray-800">{item.transportMode || "Chưa xác định"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
