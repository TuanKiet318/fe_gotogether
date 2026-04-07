import instance from "./axios.admin.customize";

// API lấy danh sách destination có phân trang, search, filter
export const getDestinations = async (params) => {
  try {
    return await instance.get("/destinations", { params });
  } catch (error) {
    console.error("Error in getDestinations:", error);
    throw error;
  }
};

// API lấy tất cả destination
export const getAllDestinations = async () => {
  try {
    return await instance.get("/destinations/all");
  } catch (error) {
    console.error("Error in getAllDestinations:", error);
    throw error;
  }
};

export const getProvinces = async () => {
  try {
    return await instance.get("/destinations/provinces");
  } catch (error) {
    console.error("Error in getProvinces:", error);
    throw error;
  }
};
