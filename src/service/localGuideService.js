// src/service/localGuideService.js
import instance from "./axios.admin.customize";

/**
 * Lấy danh sách Local Guide (có filter, phân trang)
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const listLocalGuides = async (params = {}) => {
    try {
        const res = await instance.get("/local-guides", { params });
        return res;
    } catch (error) {
        console.error("Error in listLocalGuides:", error);
        throw error;
    }
};

/**
 * Lấy thông tin chi tiết của một Local Guide
 * @param {string} guideId
 * @returns {Promise}
 */
export const getLocalGuideDetail = async (guideId) => {
    try {
        const res = await instance.get(`/local-guides/${guideId}`);
        return res;
    } catch (error) {
        console.error("Error in getLocalGuideDetail:", error);
        throw error;
    }
};

export const createLocalGuide = async (guideData) => {
    try {
        const formData = new FormData();

        // Append all normal fields
        Object.keys(guideData).forEach((key) => {
            if (
                guideData[key] !== undefined &&
                guideData[key] !== null &&
                !(guideData[key] instanceof File)
            ) {
                formData.append(key, guideData[key]);
            }
        });

        // Append file fields nếu có
        if (guideData.frontImageFile) {
            formData.append("frontImageFile", guideData.frontImageFile);
        }
        if (guideData.backImageFile) {
            formData.append("backImageFile", guideData.backImageFile);
        }
        if (guideData.portfolioFile) {
            formData.append("portfolioFile", guideData.portfolioFile);
        }
        if (guideData.certificateFile) {
            formData.append("certificateFile", guideData.certificateFile);
        }

        const res = await instance.post("/local-guides", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res;
    } catch (error) {
        console.error("Error in createLocalGuide:", error);
        throw error;
    }
};


export const updateLocalGuide = async (guideId, guideData) => {
    try {
        const formData = new FormData();

        // Append all normal fields
        Object.keys(guideData).forEach((key) => {
            if (
                guideData[key] !== undefined &&
                guideData[key] !== null &&
                !(guideData[key] instanceof File)
            ) {
                formData.append(key, guideData[key]);
            }
        });

        // Append file fields nếu có (chỉ upload khi người dùng chọn file mới)
        if (guideData.frontImageFile) {
            formData.append("frontImageFile", guideData.frontImageFile);
        }
        if (guideData.backImageFile) {
            formData.append("backImageFile", guideData.backImageFile);
        }
        if (guideData.portfolioFile) {
            formData.append("portfolioFile", guideData.portfolioFile);
        }
        if (guideData.certificateFile) {
            formData.append("certificateFile", guideData.certificateFile);
        }

        const res = await instance.put(`/local-guides/${guideId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res;
    } catch (error) {
        console.error("Error in updateLocalGuide:", error);
        throw error;
    }
};


/**
 * Xóa Local Guide
 * @param {string} guideId
 * @returns {Promise}
 */
export const deleteLocalGuide = async (guideId) => {
    try {
        const res = await instance.delete(`/local-guides/${guideId}`);
        return res;
    } catch (error) {
        console.error("Error in deleteLocalGuide:", error);
        throw error;
    }
};


export const getMyLocalGuideProfile = async () => {
    try {
        const res = await instance.get("/local-guides/me");
        return res;   // ⭐ TRẢ VỀ OBJECT (KHÔNG MẢNG)
    } catch (error) {
        console.error("Error in getMyLocalGuideProfile:", error);
        return null;
    }
};
