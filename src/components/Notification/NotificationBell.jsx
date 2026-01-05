// src/components/Notification/NotificationBell.jsx
import React, { useState } from "react";
import { Badge, Dropdown } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useNotification } from "../../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";
import "./NotificationStyles.css";

const NotificationBell = ({ variant = "default" }) => {
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
      <div
        className={`inline-flex items-center justify-center p-2 cursor-pointer rounded-full transition-colors duration-300 ${
          variant === "light" ? "hover:bg-white/20" : "hover:bg-black/5"
        }`}
      >
        <Badge count={unreadCount} overflowCount={99}>
          <BellOutlined
            style={{
              color: variant === "light" ? "#ffffff" : "#4b5563",
            }}
            className="text-xl transition-colors duration-300"
          />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationBell;
