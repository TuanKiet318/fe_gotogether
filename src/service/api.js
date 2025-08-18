import axios from "axios";

// 👉 Tạo axios instance với cấu hình chung
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // hoặc import.meta.env.VITE_API_URL nếu dùng Vite
  // baseURL: "https://conkin.vn/ebay-express/api/",
  withCredentials: true, // gửi cookie refreshToken
});

// 👉 Interceptor: Gắn accessToken & X-Device-Id vào mọi request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  let deviceId = localStorage.getItem("deviceId");

  // Nếu chưa có deviceId thì tạo và lưu
  if (!deviceId || deviceId === "undefined") {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
  }

  // Gắn DeviceId
  config.headers["X-Device-Id"] = deviceId;

  // Không gắn token nếu là login hoặc refresh
  const isPublic =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/refresh");

  if (!isPublic && token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
