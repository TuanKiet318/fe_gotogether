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
  API.post("/auth/verify-otp", null, {
    params: { userId, otp },
  });

export const apiRegister = (payload) => API.post("/auth/register", payload);

export const apiSendOtp = (userId, email) =>
  API.post("/auth/send-otp", null, {
    params: { userId, email },
  });
