import { useState, useEffect } from "react";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("login");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      setTimeout(() => setShowModal(false), 250);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowModal(false);
      onClose();
    }, 250);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!showModal) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-250 ease-out ${
        isAnimating ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl transition-all duration-250 ease-out transform ${
          isAnimating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-90 opacity-0 translate-y-8"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              {activeTab === "login"
                ? "Chào mừng trở lại!"
                : "Tạo tài khoản mới"}
            </h2>
            <p className="text-center text-gray-600 text-sm">
              {activeTab === "login"
                ? "Đăng nhập để tiếp tục hành trình của bạn"
                : "Tham gia cộng đồng du lịch của chúng tôi"}
            </p>
          </div>

          {/* Form Container with slide animation */}
          <div className="relative overflow-hidden">
            <div
              className={`transition-all duration-200 ease-in-out ${
                activeTab === "login"
                  ? "transform translate-x-0 opacity-100"
                  : "transform -translate-x-full opacity-0 absolute inset-0"
              }`}
            >
              <LoginForm
                switchToRegister={() => setActiveTab("register")}
                onClose={handleClose}
              />
            </div>

            <div
              className={`transition-all duration-200 ease-in-out ${
                activeTab === "register"
                  ? "transform translate-x-0 opacity-100"
                  : "transform translate-x-full opacity-0 absolute inset-0"
              }`}
            >
              <RegisterForm switchToLogin={() => setActiveTab("login")} />
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for smoother animations */}
      <style jsx>{`
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}
