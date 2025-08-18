import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import useAuthRole from "../hooks/useAuthRole";

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AuthContext);
  const role = useAuthRole();
  const { pathname } = useLocation();

  // Chờ role nếu đã xác thực nhưng role chưa xác định
  if (isAuthenticated() && role === null) return null;

  // Chuyển hướng từ "/" sang "/dashboard" nếu đã đăng nhập
  if (isAuthenticated() && pathname === "/")
    return <Navigate to="/dashboard" replace />;

  // Bảo vệ các route quản lý của nhà cung cấp
  if (
    pathname.startsWith("/supplier/manage") &&
    (!isAuthenticated() || role !== "ROLE_SUPPLIER")
  ) {
    toast.error("Bạn cần quyền nhà cung cấp để truy cập trang này!", {
      position: "top-right",
      autoClose: 2500,
    });
    return (
      <Navigate
        to={isAuthenticated() ? "/dashboard" : "/login"}
        state={{ from: pathname }}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
