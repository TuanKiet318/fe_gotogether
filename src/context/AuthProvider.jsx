// src/context/AuthProvider.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { APILogout } from "../service/api.auth.service";
import { AuthContext } from "./AuthContext";
import { APIGetMe } from "../service/api.user.service";

// THÊM useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Đổi thành state boolean
  const [authLoaded, setAuthLoaded] = useState(false); // Sử dụng để track loading
  const navigate = useNavigate();

  // Check token validity
  const checkTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedDeviceId = localStorage.getItem("deviceId");

      if (token && storedDeviceId && checkTokenValid(token)) {
        setDeviceId(storedDeviceId);

        try {
          const res = await APIGetMe();
          setUser(res.data.data);
          setIsAuthenticated(true); // Set true khi có user
        } catch (error) {
          console.error("Failed to fetch user:", error);
          logout();
        }
      } else if (token) {
        // Token expired
        logout();
      }

      setAuthLoaded(true); // Đánh dấu đã load xong
    };

    initAuth();
  }, []); // Empty dependency array

  const login = async (token, deviceId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("deviceId", deviceId);
    setDeviceId(deviceId);

    try {
      const res = await APIGetMe();
      setUser(res.data.data);
      setIsAuthenticated(true); // Set true
    } catch (error) {
      console.error("Failed to fetch user after login:", error);
      logout();
    }
  };

  const logout = async () => {
    try {
      await APILogout();
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    } finally {
      localStorage.clear();
      setUser(null);
      setDeviceId(null);
      setIsAuthenticated(false); // Set false
      navigate("/");
    }
  };

  const value = {
    user,
    isAuthenticated, // Boolean state, không phải function
    authLoaded, // Export để components biết khi nào auth đã load xong
    deviceId,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
