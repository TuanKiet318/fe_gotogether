import axios from "axios";

const plainAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL: "https://conkin.vn/ebay-express/api/",
  withCredentials: true, // gửi cookie refreshToken
});

// 👉 Interceptor: gắn X-Device-Id nếu có
plainAxios.interceptors.request.use((config) => {
  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId || deviceId === "undefined") {
    deviceId = crypto.randomUUID(); // nếu chưa có thì tạo mới
    localStorage.setItem("deviceId", deviceId);
  }

  config.headers["X-Device-Id"] = deviceId;
  return config;
});

export default plainAxios;
