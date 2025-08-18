// src/hooks/useAuthRole.js
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const useAuthRole = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        const authorities = decoded?.authorities || [];
        setRole(authorities[0]);
      }
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
      setRole(null);
    }
  }, []);

  return role;
};

export default useAuthRole;
