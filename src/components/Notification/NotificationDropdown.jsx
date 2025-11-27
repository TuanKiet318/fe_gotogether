// src/components/Notification/NotificationDropdown.jsx
import React, { useState, useEffect } from "react";
import { List, Tabs, Button, Empty, Spin, message } from "antd";
import { CheckOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../service/notificationService";
import { useNotification } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";

const NotificationDropdown = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { decrementUnread, resetUnread, fetchStats } = useNotification();

  // Load notifications
  const loadNotifications = async (currentPage = 0, append = false) => {
    setLoading(true);
    try {
      const response =
        activeTab === "all"
          ? await getNotifications(currentPage, 10)
          : await getUnreadNotifications(currentPage, 10);

      const newNotifications = response.content;

      if (append) {
        setNotifications((prev) => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setHasMore(!response.last);
      setPage(currentPage);
    } catch (error) {
      message.error("Không thể tải thông báo");
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load khi đổi tab
  useEffect(() => {
    loadNotifications(0, false);
  }, [activeTab]);

  // Xử lý đánh dấu đã đọc
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);

      // Cập nhật UI
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );

      decrementUnread(1);
      message.success("Đã đánh dấu đã đọc");
    } catch (error) {
      message.error("Không thể đánh dấu đã đọc");
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();

      // Cập nhật UI
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );

      resetUnread();
      message.success("Đã đánh dấu tất cả đã đọc");
    } catch (error) {
      message.error("Không thể đánh dấu tất cả");
    }
  };

  // Xóa thông báo
  const handleDelete = async (notificationId, isRead) => {
    try {
      await deleteNotification(notificationId);

      // Xóa khỏi UI
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );

      if (!isRead) {
        decrementUnread(1);
      }

      message.success("Đã xóa thông báo");
    } catch (error) {
      message.error("Không thể xóa thông báo");
    }
  };

  // Click vào thông báo
  const handleNotificationClick = async (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Điều hướng đến trang tương ứng (implement logic của bạn)
    // Example: navigate to detail page based on entityType and entityId
    onClose();
  };

  // Load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1, true);
    }
  };

  const tabItems = [
    {
      key: "all",
      label: "Tất cả",
    },
    {
      key: "unread",
      label: "Chưa đọc",
    },
  ];

  return (
    <div className=" w-[400px] max-h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
        <h3 className="m-0 text-lg font-semibold">Thông báo</h3>
        <Button
          type="link"
          size="small"
          icon={<CheckOutlined />}
          onClick={handleMarkAllAsRead}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
        />
      </div>

      {/* List */}
      <div className="max-h-[450px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {loading && page === 0 ? (
          <div className="flex justify-center items-center py-10">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            description="Không có thông báo nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <NotificationItem
                notification={item}
                onClick={() => handleNotificationClick(item)}
                onMarkAsRead={() => handleMarkAsRead(item.id)}
                onDelete={() => handleDelete(item.id, item.isRead)}
              />
            )}
          />
        )}

        {/* Load more */}
        {hasMore && notifications.length > 0 && (
          <div className="text-center py-3 border-t border-gray-200">
            <Button type="link" onClick={handleLoadMore} loading={loading}>
              Xem thêm
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-3 border-t border-gray-200">
        <Button type="link" onClick={onClose}>
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
