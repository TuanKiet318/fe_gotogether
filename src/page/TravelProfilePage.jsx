import React, { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  MoreVertical,
  User,
  CalendarDays,
  MapPin,
  Trash2,
  PlusCircle,
  X,
  FileText,
  Heart,
  Ticket,
  Camera,
  Mail,
  Phone,
  Map,
  Cake,
  Edit,
  Save,
  Lock,
  AlertCircle,
  Eye,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import { toast } from "sonner";
/* API */
import { listMyItineraries } from "../service/tripService";
import { DeleteItinerary as apiDeleteItinerary } from "../service/api.admin.service.jsx";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
} from "../service/userService";
// Thêm import blogApi
import blogApi from "../service/blogApi";

/* Utils */
const formatDateVN = (dateString) => {
  if (!dateString) return "Chưa cập nhật";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

const calculateDuration = (startDate, endDate) => {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return `${diff} ngày`;
};

/* ---------------------------- Card Component ---------------------------- */
function ItineraryCard({ trip, onDelete }) {
  return (
    <Link
      to={`/itinerary-editor/${trip.id}`}
      className="group bg-white rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={
            trip.coverImage ||
            trip.image ||
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Quy-Nhon-morning-city-view-1300px.jpg/500px-Quy-Nhon-morning-city-view-1300px.jpg"
          }
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
          {calculateDuration(trip.startDate, trip.endDate)}
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(trip.id);
            }}
            className="bg-white/90 hover:bg-white p-2 rounded-xl shadow transition"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="bg-white/90 hover:bg-white p-2 rounded-xl shadow transition"
          >
            <MoreVertical className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 text-base line-clamp-2 group-hover:text-blue-600 transition">
          {trip.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <CalendarDays className="w-4 h-4 text-blue-500" />
          <span>
            {formatDateVN(trip.startDate)} → {formatDateVN(trip.endDate)}
          </span>
        </div>

        {trip.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>{trip.location}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <img
            src={trip.ownerAvatar || "/imgs/image.png"}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span>
            {trip.owner
              ? "Bạn là chủ sở hữu"
              : `Chia sẻ bởi ${trip.ownerName || "ai đó"}`}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------------------------- Blog Card Component ---------------------------- */
function BlogCard({ blog, onDelete }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="group bg-white rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden cursor-pointer">
      {/* Blog Image */}
      <div className="relative h-48 overflow-hidden">
        {blog.media && blog.media.length > 0 ? (
          <img
            src={blog.media[0].url}
            alt={blog.title || "Blog image"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <FileText className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              blog.status === "PUBLISHED"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {blog.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(blog.id);
            }}
            className="bg-white/90 hover:bg-white p-2 rounded-xl shadow transition"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="bg-white/90 hover:bg-white p-2 rounded-xl shadow transition"
          >
            <MoreVertical className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Blog Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
          {blog.content && blog.content.length > 100
            ? `${blog.content.substring(0, 100)}...`
            : blog.content || "Không có tiêu đề"}
        </h3>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {blog.viewCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              {blog.likeCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              {blog.commentCount || 0}
            </span>
          </div>
        </div>

        {/* Author & Date */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src={blog.authorAvatar || "/imgs/image.png"}
              className="w-6 h-6 rounded-full object-cover"
              alt={blog.authorName}
            />
            <span className="text-sm text-gray-600">{blog.authorName}</span>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(blog.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Profile Component ---------------------------- */
function ProfileSection({
  userData,
  onUpdate,
  onAvatarChange,
  onChangePassword,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "MALE",
    birthday: "",
    bio: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
        gender: userData.gender || "MALE",
        birthday: formatDateForInput(userData.birthday),
        bio: userData.bio || "",
        address: userData.address || "",
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    const toastId = toast.loading("Đang cập nhật thông tin...");

    try {
      setLoading(true);
      const updatedData = await onUpdate(formData);

      toast.success("Cập nhật thông tin thành công!", {
        id: toastId,
      });
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.message || "Cập nhật thất bại!", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      setLoading(true);

      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");

      // Reset password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Đổi mật khẩu thất bại. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB!");
      return;
    }

    try {
      setAvatarLoading(true);

      const avatarUrl = await onAvatarChange(file);

      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      toast.error(
        error.response?.message || "Upload ảnh thất bại. Vui lòng thử lại!"
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={userData?.avatar || "https://via.placeholder.com/128"}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
            <Camera className="w-5 h-5" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={avatarLoading}
            />
          </label>
          {avatarLoading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            {userData?.name || "Người dùng"}
          </h2>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Mail className="w-4 h-4" />
            {userData?.email || "Chưa có email"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Tham gia từ {formatDateVN(userData?.createdAt)}
          </p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Thông tin cá nhân</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: userData.name || "",
                    phone: userData.phone || "",
                    gender: userData.gender || "MALE",
                    birthday: formatDateForInput(userData.birthday),
                    bio: userData.bio || "",
                    address: userData.address || "",
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">
                  {userData?.name || "Chưa cập nhật"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">
                  {userData?.phone || "Chưa cập nhật"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Cake className="w-4 h-4 inline mr-1" />
                Ngày sinh
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">
                  {formatDateVN(userData?.birthday)}
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">
                  {userData?.gender === "MALE"
                    ? "Nam"
                    : userData?.gender === "FEMALE"
                    ? "Nữ"
                    : "Khác"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Map className="w-4 h-4 inline mr-1" />
                Địa chỉ
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">
                  {userData?.address || "Chưa cập nhật"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới thiệu bản thân
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả về bản thân..."
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg min-h-[60px]">
                  {userData?.bio || "Chưa có giới thiệu"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-gray-700" />
          <h3 className="text-xl font-bold">Đổi mật khẩu</h3>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Main Page ---------------------------- */
const TravelProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [sortBy, setSortBy] = useState("Ngày tạo");
  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("profile"); // "profile", "itineraries", "posts", "favorites"

  // Profile state
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [filter, setFilter] = useState({
    destinationId: "",
    type: "all",
    minDuration: "",
    maxDuration: "",
  });

  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Blogs state
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsPage, setBlogsPage] = useState(0);
  const [hasMoreBlogs, setHasMoreBlogs] = useState(true);

  /* ---------------------------- Load Blogs Data ---------------------------- */
  const loadMyBlogs = async (page = 0) => {
    try {
      setBlogsLoading(true);
      const response = await blogApi.getMyBlogs(page, 10);
      console.log("Blogs API response:", response);

      if (page === 0) {
        setBlogs(response.content || []);
      } else {
        setBlogs((prev) => [...prev, ...(response.content || [])]);
      }

      setHasMoreBlogs(!response.last);
      setBlogsPage(response.number);
    } catch (error) {
      console.error("Error loading blogs:", error);
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setBlogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "posts") {
      loadMyBlogs(0);
    }
  }, [activeMenu]);

  /* ---------------------------- Delete Blog ---------------------------- */
  const handleDeleteBlog = async (blogId) => {
    toast.custom((t) => (
      <div className="bg-white rounded-xl p-4 shadow-lg border w-96">
        <p className="font-medium mb-4">Bạn có chắc muốn xoá bài viết này?</p>
        <p className="text-sm text-gray-600 mb-4">
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t);
              try {
                await blogApi.deleteBlog(blogId);
                setBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
                toast.success("Đã xoá bài viết thành công!");
              } catch (error) {
                console.error("Delete blog error:", error);
                toast.error("Xoá bài viết thất bại!");
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Xoá
          </button>
        </div>
      </div>
    ));
  };

  /* ---------------------------- Load Profile Data ---------------------------- */
  const loadProfileData = async () => {
    try {
      setProfileLoading(true);
      const response = await getUserProfile();
      setProfileData(response);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "profile") {
      loadProfileData();
    }
  }, [activeMenu]);

  /* ---------------------------- Profile API Handlers ---------------------------- */
  const handleUpdateProfile = async (data) => {
    const response = await updateUserProfile(data);
    setProfileData(response);
    return response;
  };

  const handleChangePassword = async (data) => {
    const response = await changePassword(data);
    return response;
  };

  const handleAvatarUpload = async (file) => {
    const response = await uploadAvatar(file);
    const newAvatarUrl = response.avatar;

    // Update profile data with new avatar
    setProfileData((prev) => ({
      ...prev,
      avatar: newAvatarUrl,
    }));

    return newAvatarUrl;
  };

  /* ---------------------------- Load Itineraries Data ---------------------------- */
  useEffect(() => {
    if (activeMenu !== "itineraries") return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        const apiFilters = {
          search: searchText || undefined,
          destinationIds:
            filter.destinationId !== "" ? [filter.destinationId] : undefined,
          type: filter.type || "all",
          minDuration:
            filter.minDuration !== "" ? Number(filter.minDuration) : undefined,
          maxDuration:
            filter.maxDuration !== "" ? Number(filter.maxDuration) : undefined,
          sortBy: sortBy === "Ngày tạo" ? "createdAt" : "title",
          sortDir: sortBy === "Tên A-Z" ? "asc" : "desc",
          period: activeTab,
        };

        console.log("🔵 Gửi filter lên API:", apiFilters);

        const res = await listMyItineraries(apiFilters);
        if (cancelled) return;

        console.log("🟢 API response:", res);
        const raw = res ?? [];
        console.log("🟢 Dữ liệu nhận về:", raw);

        const mapped = raw.map((it) => ({
          id: it.id,
          title: it.title,
          startDate: it.startDate,
          endDate: it.endDate,
          location: it.destinationName,
          coverImage: it.coverImage,
          owner: it.owner,
          ownerName: it.ownerName,
          ownerAvatar: it.ownerAvatar,
          createdAt: it.createdAt,
        }));

        setItineraries(mapped);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => (cancelled = true);
  }, [
    activeMenu,
    activeTab,
    searchText,
    filter.destinationId,
    filter.type,
    filter.minDuration,
    filter.maxDuration,
    sortBy,
  ]);

  /* ---------------------------- Delete Itinerary ---------------------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá?")) return;

    try {
      await apiDeleteItinerary(id);
      setItineraries((prev) => prev.filter((t) => t.id !== id));
      toast.success("Đã xoá lịch trình thành công!");
    } catch {
      toast.error("Xoá lịch trình thất bại!");
    }
  };

  /* ---------------------------- Render Content Based on Menu ---------------------------- */
  const renderContent = () => {
    switch (activeMenu) {
      case "profile":
        return (
          <div className="bg-white rounded-2xl p-8">
            {profileLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <ProfileSection
                userData={profileData}
                onUpdate={handleUpdateProfile}
                onAvatarChange={handleAvatarUpload}
                onChangePassword={handleChangePassword}
              />
            )}
          </div>
        );

      case "itineraries":
        return (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Lịch trình của tôi
              </h1>
              <button
                onClick={() => (window.location.href = "/trip-planner")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Tạo lịch trình mới
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mb-6 border-b border-gray-200">
              {["upcoming", "ongoing", "past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-medium relative ${
                    activeTab === tab
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {
                    {
                      upcoming: "Sắp tới",
                      ongoing: "Đang diễn ra",
                      past: "Quá khứ",
                    }[tab]
                  }
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Tìm kiếm lịch trình..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Bộ lọc
              </button>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-6 py-3 pr-10 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Ngày tạo</option>
                  <option>Tên A-Z</option>
                  <option>Ngày khởi hành</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Itineraries Grid */}
            {loading ? (
              <div className="text-center py-20 text-gray-600">
                Đang tải lịch trình...
              </div>
            ) : itineraries.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itineraries.map((trip) => (
                  <ItineraryCard
                    key={trip.id}
                    trip={trip}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <CalendarDays className="w-20 h-20 mx-auto opacity-30" />
                <h3 className="text-2xl font-bold mt-4">
                  Không có lịch trình nào
                </h3>
                <p className="mt-2">Tạo lịch trình đầu tiên của bạn!</p>
              </div>
            )}

            {/* FILTER MODAL */}
            {filterOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
                <div className="bg-white w-[500px] max-w-[95%] rounded-2xl p-6 shadow-xl relative">
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>

                  {/* TYPE */}
                  <div className="mb-6">
                    <label className="font-medium text-gray-700">
                      Loại lịch trình
                    </label>
                    <select
                      value={filter.type}
                      onChange={(e) =>
                        setFilter((f) => ({ ...f, type: e.target.value }))
                      }
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả</option>
                      <option value="owner">Bạn là chủ sở hữu</option>
                      <option value="collaborator">Bạn là cộng tác viên</option>
                    </select>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setFilterOpen(false)}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );

      case "posts":
        return (
          <div className="bg-white rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Bài viết của tôi
              </h1>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {blogs.length}
                    </p>
                    <p className="text-sm text-gray-600">Tổng số bài</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {blogs.reduce(
                        (sum, blog) => sum + (blog.viewCount || 0),
                        0
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Lượt xem</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {blogs.reduce(
                        (sum, blog) => sum + (blog.likeCount || 0),
                        0
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Lượt thích</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {blogs.reduce(
                        (sum, blog) => sum + (blog.commentCount || 0),
                        0
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Bình luận</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog List */}
            {blogsLoading && blogs.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog) => (
                    <BlogCard
                      key={blog.id}
                      blog={blog}
                      onDelete={handleDeleteBlog}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMoreBlogs && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => loadMyBlogs(blogsPage + 1)}
                      disabled={blogsLoading}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {blogsLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          Đang tải...
                        </>
                      ) : (
                        <>
                          Xem thêm bài viết
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chưa có bài viết nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Bắt đầu chia sẻ những trải nghiệm du lịch của bạn!
                </p>
                <button
                  onClick={() => (window.location.href = "/blog/create")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Viết bài đầu tiên
                </button>
              </div>
            )}
          </div>
        );

      case "favorites":
        return (
          <div className="bg-white rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Yêu thích</h2>
            <div className="text-center py-12">
              <Heart className="w-20 h-20 mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">Chưa có mục yêu thích nào</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Khám phá ngay
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {/* Profile Section */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      profileData?.avatar || "https://via.placeholder.com/96"
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {profileData?.name || user?.name || "Người dùng"}
                </h2>
              </div>

              {/* Menu Items */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveMenu("profile")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg ${
                    activeMenu === "profile"
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">🎟️</span>
                  <span>Hồ sơ</span>
                </button>

                <button
                  onClick={() => setActiveMenu("itineraries")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg ${
                    activeMenu === "itineraries"
                      ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">📋</span>
                  <span>Hành trình</span>
                  <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm">
                    {itineraries.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveMenu("posts")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg ${
                    activeMenu === "posts"
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">📅</span>
                  <span>Bài viết</span>
                  <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm">
                    {blogs.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveMenu("favorites")}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg ${
                    activeMenu === "favorites"
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">❤️</span>
                  <span>Yêu thích</span>
                </button>
              </nav>

              {/* Referral Card */}
              <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex gap-3 mb-3">
                  <div className="text-3xl">🎁</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Mời bạn bè & Nhận thưởng
                    </h3>
                    <p className="text-sm text-gray-600">
                      Nhận mã ưu đãi cho mỗi người bạn mời thành công.
                    </p>
                  </div>
                </div>
                <button className="w-full bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default TravelProfilePage;
