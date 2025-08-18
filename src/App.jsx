import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./page/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
// import SupplierDashboard from "./page/SupplierDashboard";
import { AuthProvider } from "./context/AuthProvider";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Route công khai */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={<div>Trang Bảng Điều Khiển Người Dùng</div>}
        />
        <Route
          path="/supplier/:id/store"
          element={<div>Trang Gian Hàng Công Khai</div>}
        />
        <Route
          path="/supplier/:id/products"
          element={<div>Trang Sản Phẩm Công Khai</div>}
        />
        <Route
          path="/forgot-password"
          element={<div>Trang Quên Mật Khẩu</div>}
        />
        <Route path="/register" element={<div>Trang Đăng Ký</div>} />
        <Route path="/" element={<div>Trang Chủ</div>} />
        <Route path="*" element={<div>Trang Khác</div>} />

        {/* Route quản lý nhà cung cấp */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/supplier/manage"
            element={<div>Dashboard Nhà Cung Cấp</div>}
          />
          <Route
            path="/supplier/manage/identification"
            element={<div>Thông Tin Định Danh</div>}
          />
          <Route
            path="/supplier/manage/contact"
            element={<div>Thông Tin Liên Hệ</div>}
          />
          <Route
            path="/supplier/manage/legal"
            element={<div>Thông Tin Pháp Lý</div>}
          />
          <Route
            path="/supplier/manage/bank"
            element={<div>Tài Khoản Ngân Hàng</div>}
          />
          <Route
            path="/supplier/manage/operations"
            element={<div>Vận Hành</div>}
          />
          <Route
            path="/supplier/manage/store"
            element={<div>Quản Lý Gian Hàng</div>}
          />
          <Route
            path="/supplier/manage/add-product"
            element={<div>Thêm Sản Phẩm</div>}
          />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
};

export default App;
