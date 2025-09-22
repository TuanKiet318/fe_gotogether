import { useState, useContext } from "react";
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
} from "lucide-react";
import { AuthContext } from "../context/AuthContext.jsx";
import SearchBox from "./SearchBox";

export default function Header({ setActiveSection }) {
  const [showModal, setShowModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                GoTogether
              </span>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-8 ml-8">
              <Link
                to="/"
                className="relative text-gray-800 font-semibold transition hover:after:w-full"
              >
                Trang Chủ
              </Link>
              <Link
                to="/"
                className="relative text-gray-800 font-semibold transition hover:after:w-full"
              >
                Khám Phá
              </Link>
              <Link
                to="/trip-planner"
                className="relative text-gray-800 font-semibold transition hover:after:w-full"
              >
                Lịch trình
              </Link>
            </div>

            {/* Desktop search */}
            <div className="hidden md:flex w-[500px] ml-auto">
              <SearchBox />
            </div>

            {/* User Menu */}
            <div className="flex gap-4 items-center relative">
              {isAuthenticated() ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <UserCircle className="w-6 h-6 text-gray-600" />
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        Xin chào,{" "}
                        <span className="font-semibold">
                          {user?.username || user?.name}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                      >
                        <UserCircle className="w-4 h-4" />
                        <span>Thông tin tài khoản</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/booking");
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Đặt chỗ & Chuyến đi</span>
                      </button>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                          navigate("/");
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <User className="w-6 h-6 text-gray-600" />
                    <span className="text-gray-700">Tài khoản</span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="md:hidden pb-4">
            <SearchBox />
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
