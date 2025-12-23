// src/components/Header.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthModal from "../components/AuthModal.jsx";
import {
  Menu,
  X,
  MapPin,
  ChevronDown,
  LogOut,
  User,
  Home,
  Users,
  Compass,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import SearchBox from "./SearchBox";
import { toast } from "sonner";
import NotificationBell from "./Notification/NotificationBell";

export default function Header() {
  const [showModal, setShowModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const headerRef = useRef(null);
  const scrollStateRef = useRef({ isTransparent: false, isScrolled: false });
  // Refs cho từng menu item để đo chiều rộng
  const menuItemRefs = useRef([]);

  // Kiểm tra scroll và vị trí trang
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Các trang muốn có hiệu ứng transparent khi ở đầu trang
      const transparentPages = ["/", "/tours", "/explores"];

      // Nếu ở trang cần transparent và đang ở đầu trang
      if (transparentPages.includes(location.pathname)) {
        const newIsTransparent = scrollTop < 50;
        const newIsScrolled = scrollTop > 10;

        // Chỉ update state nếu có thay đổi
        if (newIsTransparent !== scrollStateRef.current.isTransparent) {
          setIsTransparent(newIsTransparent);
          scrollStateRef.current.isTransparent = newIsTransparent;
        }
        if (newIsScrolled !== scrollStateRef.current.isScrolled) {
          setIsScrolled(newIsScrolled);
          scrollStateRef.current.isScrolled = newIsScrolled;
        }
      } else {
        if (scrollStateRef.current.isTransparent !== false) {
          setIsTransparent(false);
          scrollStateRef.current.isTransparent = false;
        }
        if (scrollTop > 10 && !scrollStateRef.current.isScrolled) {
          setIsScrolled(true);
          scrollStateRef.current.isScrolled = true;
        } else if (scrollTop <= 10 && scrollStateRef.current.isScrolled) {
          setIsScrolled(false);
          scrollStateRef.current.isScrolled = false;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Gọi ngay lần đầu
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const transparentPages = ["/", "/tours", "/explores"];

    if (transparentPages.includes(location.pathname)) {
      const shouldBeTransparent = scrollTop < 50;
      setIsTransparent(shouldBeTransparent);
      scrollStateRef.current.isTransparent = shouldBeTransparent;
      setIsScrolled(scrollTop > 10);
    } else {
      setIsTransparent(false);
      scrollStateRef.current.isTransparent = false;
    }
  }, [location.pathname]);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('button[aria-label="Toggle mobile menu"]')
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Đóng mobile menu khi route thay đổi
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Menu items với cấu trúc rõ ràng
  const menuItems = [
    {
      name: "Trang Chủ",
      path: "/",
      icon: <Home className="w-4 h-4 md:hidden" />,
    },
    {
      name: "Khám phá",
      path: "/explores",
      icon: <Compass className="w-4 h-4 md:hidden" />,
    },
    {
      name: "Chuyến đi",
      path: "/tours",
      icon: <MapPin className="w-4 h-4 md:hidden" />,
    },
    {
      name: "Cộng đồng",
      path: "/blogs",
      icon: <Users className="w-4 h-4 md:hidden" />,
    },
  ];

  // Kiểm tra xem item có đang active không
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Hàm để lấy ref cho từng menu item
  const setMenuItemRef = (index, el) => {
    menuItemRefs.current[index] = el;
  };

  // Lấy chiều rộng của menu item
  const getMenuItemWidth = (index) => {
    if (menuItemRefs.current[index]) {
      return menuItemRefs.current[index].offsetWidth;
    }
    return "auto";
  };

  const isHomePage = location.pathname === "/";

  return (
    <>
      {/* Header luôn fixed để overlay */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ height: "var(--header-height)" }}
      >
        <div
          className={`w-full h-full ${
            isTransparent
              ? "bg-transparent border-transparent"
              : isScrolled
              ? "bg-white/95 backdrop-blur-md border-slate-200 shadow-sm"
              : "bg-white border-slate-100"
          }`}
        >
          <div className="container-custom h-full">
            <div className="flex items-center justify-between h-full">
              {/* Logo và Mobile menu button */}
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-1.5 rounded-lg transition"
                  aria-label="Toggle mobile menu"
                  style={{
                    color: isTransparent ? "white" : "#475569",
                  }}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>

                {/* Logo */}
                <Link
                  to="/"
                  className="flex items-center gap-1.5 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div
                    className={`w-7 h-7 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center ${
                      isTransparent ? "shadow-lg" : "shadow-sm"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span
                    className={`text-lg font-extrabold bg-gradient-to-r from-sky-600 to-indigo-700 bg-clip-text ${
                      isTransparent ? "text-white" : "text-transparent"
                    } group-hover:opacity-90 transition`}
                  >
                    GoTogether
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center ml-6">
                {menuItems.map((item, index) => (
                  <div key={item.path} className="relative mx-1">
                    <Link
                      ref={(el) => setMenuItemRef(index, el)}
                      to={item.path}
                      className={`relative px-3 py-1.5 font-medium transition-colors rounded-md ${
                        isTransparent
                          ? "!text-white hover:!text-sky-200"
                          : "text-slate-700 hover:text-sky-600"
                      } ${
                        isActive(item.path)
                          ? isTransparent
                            ? "text-white"
                            : "text-sky-600"
                          : ""
                      }`}
                    >
                      {item.name}
                      {isActive(item.path) && (
                        <span
                          className={`absolute left-1/2 bottom-0 h-0.5 rounded-full -translate-x-1/2 transition-all duration-300 ${
                            isTransparent
                              ? "bg-white"
                              : "bg-gradient-to-r from-sky-500 to-indigo-600"
                          }`}
                          style={{
                            width: getMenuItemWidth(index) - 24 + "px",
                            animation: "slideIn 0.3s ease-out",
                          }}
                        ></span>
                      )}
                    </Link>
                  </div>
                ))}
              </nav>

              {/* Search - Desktop */}
              <div className="hidden md:flex flex-1 max-w-sm mx-4">
                <SearchBox
                  className={`w-full rounded-full transition-colors ${
                    isTransparent
                      ? "border border-transparent"
                      : "border border-slate-200 hover:border-sky-500"
                  }`}
                  navigateOnSelect={true}
                  variant={isTransparent ? "transparent" : "default"}
                  placeholder="Tìm kiếm điểm đến..."
                />
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2 md:gap-3">
                {isAuthenticated ? (
                  <>
                    {/* Notification Bell - Desktop */}
                    <div className="hidden md:block">
                      <NotificationBell
                        variant={isTransparent ? "light" : "default"}
                      />
                    </div>

                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full transition"
                        aria-label="User menu"
                        style={{
                          backgroundColor: isTransparent
                            ? "rgba(255, 255, 255, 0.1)"
                            : "transparent",
                        }}
                      >
                        <img
                          src={user?.avatar || "/imgs/image.png"}
                          alt="avatar"
                          className="w-6 h-6 rounded-full object-cover border shadow-sm"
                        />
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            isMenuOpen ? "rotate-180" : ""
                          }`}
                          style={{
                            color: isTransparent ? "white" : "#475569",
                          }}
                        />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 animate-fadeIn">
                          <div className="px-3 py-2 text-sm text-slate-600 border-b bg-slate-50">
                            Xin chào,{" "}
                            <span className="font-semibold text-slate-800">
                              {user?.username || user?.name}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              navigate("/trip-list");
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 hover:bg-slate-50 transition-all duration-200 text-left text-sm hover:translate-x-1"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Lịch trình của bạn</span>
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
                            className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 transition-all duration-200 text-left text-sm hover:translate-x-1"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setShowModal(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium shadow-sm hover:opacity-90 transition-all duration-200 active:scale-95 ${
                      isTransparent
                        ? "bg-white/20 text-white backdrop-blur-sm border border-white/30 hover:bg-white/30"
                        : "bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:shadow-md"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Đăng nhập</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Slide-in */}
        <div
          ref={mobileMenuRef}
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Mobile Menu Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={user?.avatar || "/imgs/image.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border shadow-sm"
                />
                <div>
                  {isAuthenticated ? (
                    <>
                      <p className="font-semibold text-slate-800 text-sm">
                        {user?.username || user?.name}
                      </p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </>
                  ) : (
                    <p className="font-semibold text-slate-800 text-sm">
                      Khách
                    </p>
                  )}
                </div>
              </div>
              {!isAuthenticated && (
                <button
                  onClick={() => {
                    setShowModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-medium shadow-sm hover:opacity-90 transition-all duration-200 active:scale-95 text-sm"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            {/* Mobile Menu Items */}
            <div className="flex-1 overflow-y-auto p-2">
              <nav className="space-y-0.5">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      isActive(item.path)
                        ? "bg-sky-50 text-sky-600 font-medium scale-[1.02]"
                        : "text-slate-700 hover:bg-slate-50 hover:scale-[1.01]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {isActive(item.path) && (
                      <span className="ml-auto w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></span>
                    )}
                  </Link>
                ))}
              </nav>

              {isAuthenticated && (
                <>
                  <div className="my-3 border-t"></div>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        navigate("/trip-list");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-slate-700 hover:bg-slate-50 hover:translate-x-1 rounded-lg transition-all duration-200 text-left text-sm"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Lịch trình của bạn</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                        navigate("/");
                        toast.success("Đăng xuất thành công!", {
                          duration: 1500,
                        });
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 hover:translate-x-1 rounded-lg transition-all duration-200 text-left text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer để đẩy nội dung xuống - chỉ hiện khi KHÔNG transparent */}
      {!isTransparent && <div className="header-spacer" />}

      {/* Auth Modal */}
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
