// hooks/useAuthInfo.js
import { useMemo } from "react";
import {jwtDecode} from "jwt-decode";

const useAuthInfo = () => {
  const token = localStorage.getItem("token");

  const info = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return {
        username: decoded.sub,
        role: decoded.authorities?.[0] || null,
      };
    } catch (err) {
      console.error("Token không hợp lệ:", err);
      return null;
    }
  }, [token]);

  return info;
};

export default useAuthInfo;
