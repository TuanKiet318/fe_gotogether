// src/components/Notification/NotificationBell.jsx
import React, { useState } from "react";
import { Badge, Dropdown } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useNotification } from "../../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";
import "./NotificationStyles.css";

const NotificationBell = () => {
  const { unreadCount } = useNotification();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (flag) => {
    setOpen(flag);
  };

  return (
    <Dropdown
      dropdownRender={() => (
        <NotificationDropdown onClose={() => setOpen(false)} />
      )}
      trigger={["click"]}
      placement="bottomRight"
      open={open}
      onOpenChange={handleOpenChange}
      overlayClassName="notification-dropdown-overlay"
      getPopupContainer={(trigger) => trigger.parentElement || document.body}
      align={{ offset: [0, 8] }}
    >
      <div className="inline-flex items-center justify-center p-2 cursor-pointer rounded-full transition-colors duration-300 hover:bg-black/5">
        <Badge count={unreadCount} overflowCount={99}>
          <BellOutlined className="text-xl text-gray-600 transition-colors duration-300 hover:text-blue-500" />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationBell;
