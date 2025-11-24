import { useState, useContext } from "react";
import LocalGuideRegistration from "./LocalGuideRegistration";
import { AuthContext } from "../context/AuthContext.jsx";

export default function LocalGuideButton({ userStatus }) {
  // userStatus: "not-registered" | "pending" | "approved"
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);

  if (!user) return null; // ẩn nút nếu chưa đăng nhập

  const renderButton = () => {
    switch (userStatus) {
      case "not-registered":
        return (
          <button
            onClick={() => setIsOpen(true)}
            className="px-3 py-1 bg-amber-500 text-white text-sm rounded-full hover:opacity-90 transition"
          >
            Trở thành Local Guide
          </button>
        );
      case "pending":
        return (
          <button className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-full cursor-not-allowed">
            Chờ duyệt
          </button>
        );
      case "approved":
        return (
          <button className="px-3 py-1 bg-green-500 text-white text-sm rounded-full cursor-default">
            Local Guide
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderButton()}

      {/* Modal đăng ký */}
      {isOpen && <LocalGuideRegistration />}
    </>
  );
}
