// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { NotificationProvider } from "../context/NotificationContext";

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
      {!hideHeader && (
        <NotificationProvider>
          <Header />
        </NotificationProvider>
      )}

      {/* Nội dung */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      {!hideFooter && <Footer />}
    </div>
  );
}
