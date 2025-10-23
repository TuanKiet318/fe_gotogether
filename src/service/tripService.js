// src/service/tripItemService.js
import instance from "./axios.admin.customize";

/**
 * Lấy danh sách item của itinerary
 * @param {string} itineraryId
 * @param {number} dayNumber - optional, lọc theo ngày
 */
export const listItems = async (itineraryId, dayNumber) => {
  try {
    const params = dayNumber !== undefined ? { dayNumber } : {};
    const res = await instance.get(`/itineraries/${itineraryId}/items`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Error in listItems:", error);
    throw error;
  }
};
/** * Lấy chi tiết một chuyến đi */
export const getItineraryById = async (id) => {
  try {
    const res = await instance.get(`/itineraries/${id}`);
    console.log("getItineraryById - full response:", res);

    // body có thể nằm ở res.data (axios) hoặc res trực tiếp
    const body = res?.data ?? res;
    // itinerary có thể nằm ở body.data (wrapper) hoặc body (direct)
    const itinerary = body?.data ?? body;

    if (!itinerary) {
      console.warn("getItineraryById - no itinerary found in response:", res);
      return null;
    }
    return itinerary;
  } catch (error) {
    console.error("Error in getItineraryById:", error);
    throw error;
  }
};

/** * Lấy danh sách tất cả chuyến đi */
export const getItineraries = async () => {
  try {
    return await instance.get("/itineraries");
  } catch (error) {
    console.error("Error in getItineraries:", error);
    throw error;
  }
};
export const cloneItinerary = async (sourceId, payload) => {
  try {
    const res = await instance.post(`/itineraries/${sourceId}/clone`, payload);
    const body = res?.data ?? res;            // hỗ trợ axios chuẩn hoặc mock
    // Hỗ trợ các shape phổ biến:
    // { id } hoặc { data: { id } } hoặc { status, message, data: { id } }
    const id =
      body?.id ??
      body?.data?.id ??
      body?.data?.data?.id ??
      null;

    return id; // ➜ Component nhận trực tiếp ID
  } catch (error) {
    console.error("Error in cloneItinerary:", error?.response?.data || error);
    throw error;
  }
};

/**
 * Tạo item mới
 * itemData: { placeId, dayNumber?, orderInDay?, startTime?, endTime?, description?, estimatedCost?, transportMode? }
 */
export const createItem = async (itineraryId, itemData) => {
  try {
    const res = await instance.post(
      `/itineraries/${itineraryId}/items`,
      itemData
    );
    return res.data;
  } catch (error) {
    console.error("Error in createItem:", error);
    throw error;
  }
};

/**
 * Cập nhật item
 * itemData: { dayNumber?, orderInDay?, startTime?, endTime?, description?, estimatedCost?, transportMode? }
 */
export const updateItem = async (itineraryId, itemId, itemData, token) => {
  try {
    const res = await instance.patch(
      `/itineraries/${itineraryId}/items/${itemId}`,
      itemData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error in updateItem:", error);
    throw error;
  }
};

/**
 * Xoá item
 */
export const deleteItem = async (itineraryId, itemId) => {
  try {
    await instance.delete(`/itineraries/${itineraryId}/items/${itemId}`);
  } catch (error) {
    console.error("Error in deleteItem:", error);
    throw error;
  }
};

/**
 * Reorder item trong 1 ngày
 * req = { dayNumber: number, itemIdsInOrder: string[] }
 */
export const reorderInDay = async (itineraryId, req) => {
  try {
    await instance.post(`/itineraries/${itineraryId}/items/reorder`, req);
  } catch (error) {
    console.error("Error in reorderInDay:", error);
    throw error;
  }
};

/**
 * Import nhiều địa điểm vào itinerary
 * req = { defaultDay?, appendMode?, preventDuplicatesInDay?, items: [{placeId, dayNumber?, startTime?, ...}] }
 */
export const importPlaces = async (itineraryId, req) => {
  try {
    const res = await instance.post(
      `/itineraries/${itineraryId}/items/import`,
      req
    );
    return res.data;
  } catch (error) {
    console.error("Error in importPlaces:", error);
    throw error;
  }
};
/** * Tạo mới một chuyến đi */
export const createItinerary = async (tripData) => {
  try {
    const payload = {
      title: tripData.title,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      destinationId: tripData.destinationId,
      items: tripData.items || [],
      invites: tripData.invites || [],
    };
    console.log("Payload gửi:", payload);
    return await instance.post("/itineraries", payload);
  } catch (error) {
    console.error("Error in createItinerary:", error.response?.data || error);
    throw error;
  }
};

export const getAllItineraries = getItineraries; // ====== CREATE: thêm 1 địa điểm (item) vào lịch trình ====== @PostMapping @ResponseStatus(HttpStatus.CREATED) public ItineraryItemDto createItem(@PathVariable String itineraryId, @Valid @RequestBody CreateItemRequest req) { String userId = currentUserId(); return itineraryService.createItem(userId, itineraryId, req); }

/**
 * Thêm ngày mới **sau** một ngày cụ thể trong itinerary
 * @param {string} itineraryId - ID của chuyến đi
 * @param {number} dayNumber - số thứ tự ngày muốn chèn sau
 * @param {number} count - số lượng ngày muốn thêm
 */
export const insertDaysAfter = async (itineraryId, dayNumber, count = 1) => {
  try {
    const res = await instance.post(
      `/itineraries/${itineraryId}/days/insert-after`,
      { dayNumber, count }
    );
    return res.data;
  } catch (error) {
    console.error("Error in insertDaysAfter:", error);
    throw error;
  }
};

/**
 * Thêm ngày mới **trước** một ngày cụ thể trong itinerary
 * @param {string} itineraryId - ID của chuyến đi
 * @param {number} dayNumber - số thứ tự ngày muốn chèn trước
 * @param {number} count - số lượng ngày muốn thêm
 */
export const insertDaysBefore = async (itineraryId, dayNumber, count = 1) => {
  try {
    const res = await instance.post(
      `/itineraries/${itineraryId}/days/insert-before`,
      { dayNumber, count }
    );
    return res.data;
  } catch (error) {
    console.error("Error in insertDaysBefore:", error);
    throw error;
  }
};

/**
 * Xoá 1 ngày trong itinerary
 * @param {string} itineraryId - ID chuyến đi
 * @param {number} dayNumber - số thứ tự của ngày muốn xoá
 */
export const deleteDay = async (itineraryId, dayNumber) => {
  try {
    const res = await instance.delete(
      `/itineraries/${itineraryId}/days/${dayNumber}`
    );
    return res.data;
  } catch (error) {
    console.error("Error in deleteDay:", error);
    throw error;
  }
};

/**
 * Đổi tên lịch trình
 * @param {string} itineraryId - ID của chuyến đi
 * @param {string} newTitle - Tên mới cho lịch trình
 */
export const renameItinerary = async (itineraryId, newTitle) => {
  try {
    const res = await instance.patch(`/itineraries/${itineraryId}/rename`, {
      newTitle,
    });
    return res.data;
  } catch (error) {
    console.error("Error in renameItinerary:", error.response?.data || error);
    throw error;
  }
};

/**
 * Cập nhật ngày bắt đầu / kết thúc của lịch trình
 * Nếu rút ngắn thì backend sẽ xóa item vượt phạm vi ngày mới
 * @param {string} itineraryId
 * @param {string} startDate - yyyy-MM-dd
 * @param {string} endDate - yyyy-MM-dd
 */
export const updateItineraryDates = async (itineraryId, startDate, endDate) => {
  try {
    const res = await instance.patch(`/itineraries/${itineraryId}/dates`, {
      startDate,
      endDate,
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error in updateItineraryDates:",
      error.response?.data || error
    );
    throw error;
  }
};

/**
 * Lấy địa điểm gần nhất của mỗi category từ một place
 * placeId: ID của place làm điểm tham chiếu
 */
export const getNearestPlacesByCategories = async (placeId) => {
  try {
    const res = await instance.get(`/places/${placeId}/nearest-by-categories`);
    return res;
  } catch (error) {
    console.error("Error in getNearestPlacesByCategories:", error);
    throw error;
  }
};
export const sendInvite = async (itineraryId, payload) => {
  try {
    const res = await instance.post(
      `/itineraries/${itineraryId}/invites`,
      { itineraryId, inviteEmail: payload.inviteEmail, role: payload.role }
    );
    // axios: dữ liệu thường nằm ở res.data
    return res?.data ?? res;
  } catch (error) {
    console.error("Error in sendInvite:", error?.response?.data || error);
    throw error;
  }
};
export const listInvites = async (itineraryId) => {
  try {
    const res = await instance.get(`/itineraries/${itineraryId}/invites`);
    return res?.data ?? res;
  } catch (error) {
    console.error("Error fetching invites:", error?.response?.data || error);
    throw error;
  }
};
/**
 * Cập nhật quyền (role) của một collaborator
 * PUT /api/itineraries/{itineraryId}/collaborators/{userId}/role
 * @param {'VIEWER'|'EDITOR'} role
 */
export const updateCollaboratorRole = async (itineraryId, userId, role) => {
  try {
    const payload = { role };
    const res = await instance.put(
      `/itineraries/${itineraryId}/collaborators/${userId}/role`,
      payload
    );
    return res?.data ?? res;
  } catch (error) {
    console.error("Error in updateCollaboratorRole:", error?.response?.data || error);
    throw error;
  }
};

/**
 * Xoá một collaborator khỏi itinerary
 * DELETE /api/itineraries/{itineraryId}/collaborators/{userId}
 */
export const removeCollaborator = async (itineraryId, userId) => {
  try {
    const res = await instance.delete(
      `/itineraries/${itineraryId}/collaborators/${userId}`
    );
    return res?.data ?? res;
  } catch (error) {
    console.error("Error in removeCollaborator:", error?.response?.data || error);
    throw error;
  }
};