import axios from "axios";
import plainAxios from "./plainAxios"; // axios không có interceptor

const API_BASE_URL = import.meta.env.VITE_API_URL; // Lấy từ biến môi trường hoặc mặc định
// const API_BASE_URL = "https://conkin.vn/ebay-express/api/";
const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ✅ Biến dùng làm lock
let isRefreshing = false;
let refreshSubscribers = [];

// ✅ Tất cả request đang chờ refresh, đợi gọi hàm này để retry
function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

// ✅ Thêm request vào hàng đợi nếu token đang được refresh
function addSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// ✅ Interceptor request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor response
instance.interceptors.response.use(
  (response) => {
    // Nếu API trả về chuẩn thì dùng data, còn không thì giữ nguyên
    return response.data?.data ?? response.data ?? response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(instance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await plainAxios.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );
        const newToken = res.data?.data?.token || res.token;

        localStorage.setItem("token", newToken);
        isRefreshing = false;
        onRefreshed(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    // 👉 Trả nguyên error để xử lý message bên ngoài
    return Promise.reject(error);
  }
);

// ✅ Redirect nếu refresh token hết hạn
function redirectToLogin() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export default instance;
