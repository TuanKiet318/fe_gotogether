//src/service/userService.js
import instance from "./axios.admin.customize";

export const getUserProfile = async () => {
  return instance.get("/users/profile");
};

export const updateUserProfile = async (data) => {
  return instance.put("/users/profile", data);
};

export const changePassword = async (data) => {
  return instance.put("/users/change-password", data);
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return instance.post("/upload/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
