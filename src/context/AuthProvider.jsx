import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { APILogout } from "../service/api.auth.service";
import { AuthContext } from "./AuthContext";
import { APIGetMe } from "../service/api.user.service";

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
          setDeviceId(storedDeviceId);
          // ✅ gọi API để lấy thông tin user đầy đủ
          APIGetMe()
            .then((res) => {
              setUser(res.data.data); // UserResponse có avatar, name, email...
            })
            .catch(() => logout());
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

    setDeviceId(deviceId);

    APIGetMe()
      .then((res) => {
        console.log("Me API:", res.data);
        setUser(res.data.data);
      })
      .catch(() => logout());
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
      navigate("/"); // optional
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
