// src/services/tripItemService.js
import instance from "./axios.admin.customize";

/**
 * Lấy danh sách item của itinerary
 * @param {string} itineraryId
 * @param {number} dayNumber - optional, lọc theo ngày
 */
export const listItems = async (itineraryId, dayNumber) => {
  try {
    const params = dayNumber !== undefined ? { dayNumber } : {};
    const res = await instance.get(`/itineraries/${itineraryId}/items`, { params });
    return res.data;
  } catch (error) {
    console.error("Error in listItems:", error);
    throw error;
  }
};
/** * Lấy chi tiết một chuyến đi */ export const getItineraryById = async (id) => { try { return await instance.get(`/itineraries/${id}`); } catch (error) { console.error("Error in getItineraryById:", error); throw error; } };
/** * Lấy danh sách tất cả chuyến đi */ export const getItineraries = async () => { try { return await instance.get("/itineraries"); } catch (error) { console.error("Error in getItineraries:", error); throw error; } };

/**
 * Tạo item mới
 * itemData: { placeId, dayNumber?, orderInDay?, startTime?, endTime?, description?, estimatedCost?, transportMode? }
 */
export const createItem = async (itineraryId, itemData) => {
  try {
    const res = await instance.post(`/itineraries/${itineraryId}/items`, itemData);
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
    const res = await instance.post(`/itineraries/${itineraryId}/items/import`, req);
    return res.data;
  } catch (error) {
    console.error("Error in importPlaces:", error);
    throw error;
  }
};
/** * Tạo mới một chuyến đi */ export const createItinerary = async (tripData) => { try { return await instance.post("/itineraries", { title: tripData.title, startDate: tripData.startDate, endDate: tripData.endDate, items: tripData.items || [], invites: tripData.invites || [], }); } catch (error) { console.error("Error in createItinerary:", error); throw error; } };
export const getAllItineraries = getItineraries; // ====== CREATE: thêm 1 địa điểm (item) vào lịch trình ====== @PostMapping @ResponseStatus(HttpStatus.CREATED) public ItineraryItemDto createItem(@PathVariable String itineraryId, @Valid @RequestBody CreateItemRequest req) { String userId = currentUserId(); return itineraryService.createItem(userId, itineraryId, req); }