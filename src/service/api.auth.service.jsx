import API from "./api"; // axios instance có gắn sẵn token + X-Device-Id + withCredentials

export const APILogin = async (data) => {
  return await API.post("/auth/login", data);
};

export const APILogout = async () => {
  return await API.post("/auth/logout", {});
};

export const VerifyToken = async () => {
  return await API.get("/auth/verify");
};

export const APIVerifyOtp = (userId, otp) =>
  API.post("/auth/verify-otp", { userId, otp });

export const apiRegister = (payload) => API.post("/auth/register", payload);

export const apiSendOtp = (email) => API.post("/auth/send-otp", { email });
export const apiForgotPassword = (email) =>
  API.post("/users/forgot-password", { email });

// Lấy thông tin người dùng hiện tại
export const apiGetMyProfile = () => {
  return API.get("/users/me"); // endpoint Spring Boot của bạn
};