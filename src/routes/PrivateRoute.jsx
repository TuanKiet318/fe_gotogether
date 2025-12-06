import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, authLoaded } = useAuth();

  // 1. CHỜ authLoaded, KHÔNG redirect sớm
  if (!authLoaded) {
    return null; // hoặc loading spinner
  }

  // 2. Khi authLoad xong mà chưa login -> redirect
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
