// src/components/Notification/NotificationItem.jsx
import React from "react";
import { Avatar, Button, Tooltip } from "antd";
import {
  UserOutlined,
  CheckOutlined,
  DeleteOutlined,
  HeartOutlined,
  CommentOutlined,
  TeamOutlined,
  CalendarOutlined,
  BellOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/vi";

moment.locale("vi");

const NotificationItem = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
}) => {
  const { id, type, content, isRead, readAt, createdAt, actor } = notification;

  // Icon dựa trên loại thông báo
  const getNotificationIcon = () => {
    const baseClass = "text-xs";

    switch (type) {
      case "BLOG_LIKE":
        return <HeartOutlined className={`${baseClass} text-red-500`} />;
      case "BLOG_COMMENT":
        return <CommentOutlined className={`${baseClass} text-blue-500`} />;
      case "TOUR_REGISTRATION":
        return <TeamOutlined className={`${baseClass} text-green-500`} />;
      case "TOUR_STATUS_CHANGE":
        return <CalendarOutlined className={`${baseClass} text-yellow-500`} />;
      case "ITINERARY_INVITE":
        return <FileTextOutlined className={`${baseClass} text-purple-600`} />;
      case "ITINERARY_SHARED":
        return <FileTextOutlined className={`${baseClass} text-cyan-500`} />;
      case "PLACE_REVIEW":
        return <EnvironmentOutlined className={`${baseClass} text-pink-500`} />;
      case "GUIDE_APPLICATION_STATUS":
        return <BellOutlined className={`${baseClass} text-orange-500`} />;
      case "SYSTEM":
        return <BellOutlined className={`${baseClass} text-gray-500`} />;
      default:
        return <BellOutlined className={baseClass} />;
    }
  };

  // Format thời gian
  const formatTime = (time) => {
    const now = moment();
    const notificationTime = moment(time);
    const diffMinutes = now.diff(notificationTime, "minutes");
    const diffHours = now.diff(notificationTime, "hours");
    const diffDays = now.diff(notificationTime, "days");

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return notificationTime.format("DD/MM/YYYY HH:mm");
  };

  return (
    <div
      className={`
        relative flex items-start px-5 py-3 cursor-pointer 
        transition-colors duration-200 border-b border-gray-200
        ${!isRead ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-100"}
        group
      `}
      onClick={onClick}
    >
      {/* Avatar hoặc Icon */}
      <div className="relative mr-3 flex-shrink-0">
        {actor && actor.avatar ? (
          <Avatar src={actor.avatar} size={40} />
        ) : actor && actor.name ? (
          <Avatar size={40} style={{ backgroundColor: "#1890ff" }}>
            {actor.name.charAt(0).toUpperCase()}
          </Avatar>
        ) : (
          <Avatar size={40} icon={<UserOutlined />} />
        )}

        {/* Type icon badge */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
          {getNotificationIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="text-sm text-gray-800 leading-6 mb-1 break-words">
          {content}
        </div>
        <div className="text-xs text-gray-500">{formatTime(createdAt)}</div>
      </div>

      {/* Actions */}
      <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
        {!isRead && (
          <Tooltip title="Đánh dấu đã đọc">
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead();
              }}
              className="p-1 w-7 h-7 rounded"
            />
          </Tooltip>
        )}

        <Tooltip title="Xóa">
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 w-7 h-7 rounded"
            danger
          />
        </Tooltip>
      </div>

      {/* Unread indicator */}
      {!isRead && (
        <div className="absolute top-1/2 right-3 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full group-hover:hidden" />
      )}
    </div>
  );
};

export default NotificationItem;
