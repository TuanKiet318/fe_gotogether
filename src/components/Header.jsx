import { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal.jsx";
import {
  Menu,
  X,
  MapPin,
  ChevronDown,
  LogOut,
  User,
  UserCircle,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import SearchBox from "./SearchBox";
import { toast } from "sonner";
import NotificationBell from "./Notification/NotificationBell";

export default function Header({ setActiveSection }) {
  const [showModal, setShowModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      // nếu click ngoài menu thì đóng
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300 relative z-[61]">
        <div className="container-custom">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-sky-600 to-indigo-700 bg-clip-text text-transparent group-hover:opacity-90 transition">
                GoTogether
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8 ml-8">
              {["Trang Chủ"].map((item, i) => (
                <Link
                  key={i}
                  to="/"
                  className="relative font-semibold text-slate-700 hover:text-sky-600 transition"
                >
                  {item}
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-sky-500 to-indigo-600 transition-all group-hover:w-full"></span>
                </Link>
              ))}
              {/* <Link
                to="/explores"
                className="relative font-semibold text-slate-700 hover:text-sky-600 transition"
              >
                Khám phá
              </Link> */}
              <Link
                to="/tours"
                className="relative font-semibold text-slate-700 hover:text-sky-600 transition"
              >
                Chuyến đi
              </Link>
              <Link
                to="/blogs"
                className="relative font-semibold text-slate-700 hover:text-sky-600 transition"
              >
                Cộng đồng
              </Link>
            </nav>

            {/* Search */}
            <div className="hidden md:flex w-[400px] ml-auto">
              <div className="flex-1">
                <SearchBox navigateOnSelect={true} />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4 ml-6">
              {isAuthenticated ? (
                <>
                  {/* Notification Bell */}
                  <NotificationBell />

                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-100 transition"
                    >
                      <img
                        src={user?.avatar || "/imgs/image.png"}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border shadow-sm"
                      />

                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    </button>

                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="px-4 py-2 text-sm text-slate-600 border-b">
                          Xin chào,{" "}
                          <span className="font-semibold text-slate-800">
                            {user?.username || user?.name}
                          </span>
                        </div>
                        {/* <button
                          onClick={() => {
                            navigate("/me");  
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition"
                        >
                          <UserCircle className="w-4 h-4" /> Trang cá nhân
                        </button> */}
                        <button
                          onClick={() => {
                            navigate("/trip-list");
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition"
                        >
                          <MapPin className="w-4 h-4" /> Lịch trình của bạn
                        </button><button
                          onClick={() => {
                            navigate("/local-guide");
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition"
                        >
                          <MapPin className="w-4 h-4" /> Hướng dẫn viên
                        </button>
                        <div className="border-t my-1"></div>
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                            navigate("/");
                            toast.success("Đăng xuất thành công!", {
                              duration: 1500,
                            });
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4" /> Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-medium shadow-md hover:opacity-90 transition"
                >
                  <User className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>

            {/* Mobile menu */}
            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <SearchBox className="rounded-full border border-slate-200 shadow-sm focus-within:border-sky-500" />
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
