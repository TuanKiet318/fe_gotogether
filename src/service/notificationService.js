// src/services/notificationService.js
import instance from "./axios.admin.customize";

// Lấy danh sách thông báo
export const getNotifications = async (page = 0, size = 20) => {
  return instance.get("/notifications", {
    params: { page, size },
  });
};

// Lấy danh sách thông báo chưa đọc
export const getUnreadNotifications = async (page = 0, size = 20) => {
  return instance.get("/notifications/unread", {
    params: { page, size },
  });
};

// Lấy thông báo theo loại
export const getNotificationsByType = async (type, page = 0, size = 20) => {
  return instance.get(`/notifications/type/${type}`, {
    params: { page, size },
  });
};

// Lấy thống kê thông báo (số chưa đọc, hôm nay,...)
export const getNotificationStats = async () => {
  return instance.get("/notifications/stats");
};

// Đánh dấu một thông báo đã đọc
export const markAsRead = async (notificationId) => {
  return instance.put(`/notifications/${notificationId}/read`);
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllAsRead = async () => {
  return instance.put("/notifications/read-all");
};

// Xóa thông báo
export const deleteNotification = async (notificationId) => {
  return instance.delete(`/notifications/${notificationId}`);
};
