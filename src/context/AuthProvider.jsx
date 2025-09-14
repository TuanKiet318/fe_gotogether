import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { APILogout } from "../service/api.auth.service";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedDeviceId = localStorage.getItem("deviceId");

    if (token && storedDeviceId) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.id,
            username: decoded.sub,
            roles: decoded.authorities,
          });
          setDeviceId(storedDeviceId);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, []);

  const login = (token, deviceId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("deviceId", deviceId);

    const decoded = jwtDecode(token);
    setUser({
      id: decoded.id,
      username: decoded.sub,
      roles: decoded.authorities,
    });
    setDeviceId(deviceId);
    navigate("/");
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
      navigate("/login");
    }
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, deviceId }}
    >
      {children}
    </AuthContext.Provider>
  );
};
