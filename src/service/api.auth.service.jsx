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
