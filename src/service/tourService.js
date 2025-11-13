// src/service/tourService.js
import instance from "./axios.admin.customize";

/**
 * Lấy danh sách tours với phân trang và filter
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const listTours = async (params = {}) => {
  try {
    const res = await instance.get("/tours", { params });
    return res.data;
  } catch (error) {
    console.error("Error in listTours:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết tour
 * @param {string} tourId
 * @returns {Promise}
 */
export const getTourDetail = async (tourId) => {
  try {
    const res = await instance.get(`/tours/${tourId}`);
    return res.data;
  } catch (error) {
    console.error("Error in getTourDetail:", error);
    throw error;
  }
};

/**
 * Tạo tour mới
 * @param {Object} tourData
 * @returns {Promise}
 */
export const createTour = async (tourData) => {
  try {
    const res = await instance.post("/tours", tourData);
    return res.data;
  } catch (error) {
    console.error("Error in createTour:", error);
    throw error;
  }
};

/**
 * Cập nhật tour
 * @param {string} tourId
 * @param {Object} tourData
 * @returns {Promise}
 */
export const updateTour = async (tourId, tourData) => {
  try {
    const res = await instance.put(`/tours/${tourId}`, tourData);
    return res.data;
  } catch (error) {
    console.error("Error in updateTour:", error);
    throw error;
  }
};

/**
 * Xóa tour
 * @param {string} tourId
 * @returns {Promise}
 */
export const deleteTour = async (tourId) => {
  try {
    const res = await instance.delete(`/tours/${tourId}`);
    return res.data;
  } catch (error) {
    console.error("Error in deleteTour:", error);
    throw error;
  }
};

/**
 * Tham gia tour
 * @param {string} tourId
 * @returns {Promise}
 */
export const joinTour = async (tourId) => {
  try {
    const res = await instance.post(`/tours/${tourId}/join`);
    return res.data;
  } catch (error) {
    console.error("Error in joinTour:", error);
    throw error;
  }
};

/**
 * Hủy tham gia tour
 * @param {string} tourId
 * @returns {Promise}
 */
export const cancelJoinTour = async (tourId) => {
  try {
    const res = await instance.delete(`/tours/${tourId}/cancel`);
    return res.data;
  } catch (error) {
    console.error("Error in cancelJoinTour:", error);
    throw error;
  }
};
