// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TripPlannerDrawer from "../components/TripPlannerDrawer";

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // 🔹 Cấu hình route cần ẩn Header
  const hideHeaderPaths = [];
  const hideHeaderPrefixes = ["/itinerary-editor/"];

  // 🔹 Cấu hình route cần ẩn Footer
  const hideFooterPaths = [];
  const hideFooterPrefixes = ["/itinerary-editor/"];

  // 🔹 Kiểm tra có nên ẩn Header hoặc Footer
  const hideHeader =
    hideHeaderPaths.includes(location.pathname) ||
    hideHeaderPrefixes.some((prefix) => location.pathname.startsWith(prefix));

  const hideFooter =
    hideFooterPaths.includes(location.pathname) ||
    hideFooterPrefixes.some((prefix) => location.pathname.startsWith(prefix));

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header */}
      {!hideHeader && <Header />}

      {/* Nội dung */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      {!hideFooter && <Footer />}

      {/* Drawer chỉ hiển thị khi không ẩn cả hai */}
      {!hideHeader && !hideFooter && (
        <>
          <button
            onClick={() => setDrawerOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
          >
            📅
          </button>

          <TripPlannerDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
        </>
      )}
    </div>
  );
}
