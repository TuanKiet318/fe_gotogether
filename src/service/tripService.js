// src/services/tripService.js
import instance from "./axios.admin.customize";

/**
 * Tạo mới một chuyến đi
 */
export const createItinerary = async (tripData) => {
  try {
    return await instance.post("/itineraries", {
      title: tripData.title,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      items: tripData.items || [],
    });
  } catch (error) {
    console.error("Error in createItinerary:", error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả chuyến đi
 */
export const getItineraries = async () => {
  try {
    return await instance.get("/itineraries");
  } catch (error) {
    console.error("Error in getItineraries:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một chuyến đi
 */
export const getItineraryById = async (id) => {
  try {
    return await instance.get(`/itineraries/${id}`);
  } catch (error) {
    console.error("Error in getItineraryById:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin chuyến đi
 */
export const updateItinerary = async (id, updateData) => {
  try {
    return await instance.put(`/itineraries/${id}`, updateData);
  } catch (error) {
    console.error("Error in updateItinerary:", error);
    throw error;
  }
};

/**
 * Xóa một chuyến đi
 */
export const deleteItinerary = async (id) => {
  try {
    return await instance.delete(`/itineraries/${id}`);
  } catch (error) {
    console.error("Error in deleteItinerary:", error);
    throw error;
  }
};

export const getAllItineraries = getItineraries;
