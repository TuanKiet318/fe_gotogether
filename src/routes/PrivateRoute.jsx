import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  console.log("PrivateRoute - isAuthenticated:", isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" replace />;
}
