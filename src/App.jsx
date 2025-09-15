import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";
import HomePage from "./page/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import DestinationDetail from "./page/DestinationDetailPage";
import PlaceDetail from "./page/PlaceDetailPage";
import SearchCategoryPage from "./page/SearchCategoryPage";
// import SupplierDashboard from "./page/SupplierDashboard";
import { AuthProvider } from "./context/AuthProvider";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Route công khai */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={<div>Trang Bảng Điều Khiển Người Dùng</div>}
        />
        <Route
          path="/forgot-password"
          element={<div>Trang Quên Mật Khẩu</div>}
        />
        {/* <Route path="/register" element={<div>Trang Đăng Ký</div>} /> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/destination/:id" element={<DestinationDetail />} />
        <Route path="/destination/place/:id" element={<PlaceDetail />} />
        <Route path="/category/:category" element={<SearchCategoryPage />} />
        {/* <Route path="*" element={<div>Trang Khác</div>} /> */}

        {/* Route quản lý nhà cung cấp
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
        </Route> */}
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
};

export default App;
