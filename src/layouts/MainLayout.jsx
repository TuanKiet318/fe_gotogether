// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TripPlannerDrawer from "../components/TripPlannerDrawer";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Nút mở drawer */}
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
    </div>
  );
}
