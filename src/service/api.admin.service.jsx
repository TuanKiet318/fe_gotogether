import axios from "./axios.admin.customize";

/* =========================
 * DESTINATION / PLACE / CATEGORY
 * ========================= */

// Lấy danh sách destination
const GetAllDestinations = async () => {
  const API = "/destinations";
  return await axios.get(API);
};

const searchDestinations = async (keyword, limit = 10) => {
  if (!keyword || keyword.length < 2) return [];
  try {
    const res = await API.get(
      `/destinations/search?q=${encodeURIComponent(keyword)}&limit=${limit}`
    );
    return res.data?.data || [];
  } catch (err) {
    console.error("searchDestinations failed:", err);
    return [];
  }
};

// Lấy chi tiết destination theo id
const GetDestinationDetail = async (destinationId) => {
  const API = `/destinations/${destinationId}`;
  return await axios.get(API);
};

// Lấy categories theo destination
const GetCategoriesByDestination = async (destinationId) => {
  const API = `/destinations/${destinationId}/categories`;
  return await axios.get(API);
};

// Lấy places theo destination + category
const GetPlacesByCategory = async (destinationId, categoryId) => {
  const API = `/destinations/${destinationId}/categories/${categoryId}/places`;
  return await axios.get(API);
};

// Lấy foods theo destination
const GetFoodsByDestination = async (destinationId) => {
  const API = `/destinations/${destinationId}/foods`;
  return await axios.get(API);
};

// Lấy chi tiết place
const GetPlaceDetail = async (placeId) => {
  const API = `/places/${placeId}`;
  return await axios.get(API);
};

// Lấy danh sách place theo destinationId (có phân trang + sort + filter category)
const GetPlacesByDestination = async (
  destinationId,
  page = 0,
  size = 10,
  sortBy = "name",
  sortDirection = "asc"
) => {
  const params = { page, size, sortBy, sortDirection };
  const API = `/by-destination/${destinationId}/places`;
  return await axios.get(API, { params });
};

// Lấy danh sách place theo destinationName (có phân trang + sort + filter category)
const GetPlacesByDestinationName = async (
  destinationName,
  page = 0,
  size = 10,
  sortBy = "name",
  sortDirection = "asc",
  categoryId = null
) => {
  const params = { destinationName, page, size, sortBy, sortDirection };
  if (categoryId) params.categoryId = categoryId;

  const API = `/places/by-destination-name`;
  return await axios.get(API, { params });
};

// Search places nâng cao
const SearchPlaces = async ({
  destinationName = "",
  categoryId = "",
  keyword = "",
  minRating = "",
  page = 0,
  size = 10,
  sortBy = "name",
  sortDirection = "asc",
} = {}) => {
  const params = {
    destinationName,
    categoryId,
    keyword,
    minRating,
    page,
    size,
    sortBy,
    sortDirection,
  };

  // loại bỏ param null/"" để URL sạch
  Object.keys(params).forEach(
    (key) => (params[key] === "" || params[key] == null) && delete params[key]
  );

  const API = "/places/search";
  return await axios.get(API, { params });
};

// Lấy tất cả categories
const GetAllCategories = async () => {
  const API = "/categories";
  return await axios.get(API);
};

const SearchPlacesInDestination = async (destinationId, keyword) => {
  const API = `/destinations/${destinationId}/places/search`;
  return await axios.get(API, { params: { q: keyword } });
};
/* =========================
 * ITINERARY (CREATE/LIST/DETAIL + CRUD ITEM)
 * ========================= */

// Tạo lịch trình (service backend tự lấy user từ SecurityContext)
const CreateItinerary = async (payload /* CreateItineraryRequest */) => {
  const API = "/itineraries";
  return await axios.post(API, payload);
};

// Lấy danh sách lịch trình của tôi (ItinerarySummaryResponse[])
const GetMyItineraries = async () => {
  const API = "/itineraries";
  return await axios.get(API);
};

// Lấy chi tiết 1 lịch trình (ItineraryDetailResponse)
const GetItineraryDetail = async (itineraryId) => {
  const API = `/itineraries/${itineraryId}`;
  return await axios.get(API);
};


// Cập nhật thông tin lịch trình (title/startDate/endDate)
const UpdateItinerary = async (
  itineraryId,
  data /* { title?, startDate?, endDate? } */
) => {
  const API = `/itineraries/${itineraryId}`;
  return await axios.put(API, data);
};

// Xóa lịch trình
const DeleteItinerary = async (itineraryId) => {
  const API = `/itineraries/${itineraryId}`;
  return await axios.delete(API);
};

// Thêm nhiều item vào lịch trình
const AddItineraryItems = async (
  itineraryId,
  items /* CreateItineraryItemRequest[] */
) => {
  const API = `/itineraries/${itineraryId}/items`;
  return await axios.post(API, items);
};

// Cập nhật 1 item trong lịch trình
const UpdateItineraryItem = async (
  itineraryId,
  itemId,
  data /* UpdateItineraryItemRequest */
) => {
  const API = `/itineraries/${itineraryId}/items/${itemId}`;
  return await axios.put(API, data);
};

// Di chuyển (reorder) 1 item sang vị trí khác (dayNumber/orderInDay)
const MoveItineraryItem = async (
  itineraryId,
  itemId,
  dayNumber,
  orderInDay
) => {
  const API = `/itineraries/${itineraryId}/items/${itemId}/move`;
  return await axios.patch(API, { dayNumber, orderInDay });
};

// Xóa 1 item trong lịch trình
const DeleteItineraryItem = async (itineraryId, itemId) => {
  const API = `/itineraries/${itineraryId}/items/${itemId}`;
  return await axios.delete(API);
};
/* =========================
 * FAVORITES (PLACE)
 * ========================= */

// Thêm yêu thích (idempotent)
const AddFavoritePlace = async (placeId) => {
  const API = `/favorites/places/${placeId}`;
  return await axios.post(API);
};

// Bỏ yêu thích (idempotent)
const RemoveFavoritePlace = async (placeId) => {
  const API = `/favorites/places/${placeId}`;
  return await axios.delete(API);
};

// Danh sách địa điểm tôi đã yêu thích (tóm tắt)
const GetMyFavoritePlaces = async () => {
  const API = `/favorites/places/mine`;
  return await axios.get(API);
};

// Chỉ danh sách ID các place tôi đã yêu thích
const GetMyFavoritePlaceIds = async () => {
  const API = `/favorites/places/mine/ids`;
  return await axios.get(API);
};

// Kiểm tra 1 place đã được tôi yêu thích chưa
const CheckFavoritePlace = async (placeId) => {
  const API = `/favorites/places/check`;
  return await axios.get(API, { params: { placeId } });
};

// Đếm tổng lượt yêu thích của 1 place
const CountFavoritePlace = async (placeId) => {
  const API = `/favorites/places/count/${placeId}`;
  return await axios.get(API);
};

const GetFoodDetail = async (foodId) => {
  const API = `/foods/${foodId}`;
  return await axios.get(API);
};

const GetRestaurantsByFood = async (foodId) => {
  const API = `/foods/${foodId}/restaurants`;
  return await axios.get(API);
};

const GetFeaturedItinerariesByDestination = (destinationId) => {
  const API = `/itineraries/by-destination/${destinationId}/featured`;
  return axios.get(API);
};

const GetItinerariesByDestination = (destinationId, page = 0, size = 10) => {
  const API = `/itineraries/by-destination/${destinationId}`;
  return axios.get(API, { params: { page, size } });
};
const GetItineraryWarnings = async (itineraryId, timezone = "Asia/Ho_Chi_Minh") => {
  if (!itineraryId) return { itineraryId: null, warningsByDay: {} };
  try {
    const API = `/itineraries/${encodeURIComponent(itineraryId)}/warnings`;
    const res = await axios.get(API, { params: { timezone } });
    return res.data || { itineraryId, warningsByDay: {} };
  } catch (err) {
    console.error("GetItineraryWarnings failed:", err);
    // trả về cấu trúc rỗng để frontend dễ xử lý
    return { itineraryId, warningsByDay: {} };
  }
};

// Lấy warnings cho 1 ngày cụ thể (trả về { itineraryId, dayNumber, warnings: [...] })
const GetItineraryWarningsForDay = async (itineraryId, day /* number */, timezone = "Asia/Ho_Chi_Minh") => {
  if (!itineraryId || !day) return { itineraryId: null, dayNumber: day, warnings: [] };
  try {
    const API = `/itineraries/${encodeURIComponent(itineraryId)}/warnings`;
    const res = await axios.get(API, { params: { day, timezone } });
    // server trả về { itineraryId, dayNumber, warnings }
    return res.data || { itineraryId, dayNumber: day, warnings: [] };
  } catch (err) {
    console.error("GetItineraryWarningsForDay failed:", err);
    return { itineraryId, dayNumber: day, warnings: [] };
  }
};

/* =========================
 * EXPORT
 * ========================= */

export {
  // Destination/Place/Category
  GetAllDestinations,
  GetDestinationDetail,
  searchDestinations,
  GetCategoriesByDestination,
  GetPlacesByCategory,
  GetFoodsByDestination,
  GetPlaceDetail,
  GetPlacesByDestination,
  GetPlacesByDestinationName,
  SearchPlaces,
  GetAllCategories,

  // Itinerary
  CreateItinerary,
  GetMyItineraries,
  GetItineraryDetail,
  UpdateItinerary,
  DeleteItinerary,
  AddItineraryItems,
  UpdateItineraryItem,
  MoveItineraryItem,
  DeleteItineraryItem,
  // Favorites (Place)
  AddFavoritePlace,
  RemoveFavoritePlace,
  GetMyFavoritePlaces,
  GetMyFavoritePlaceIds,
  CheckFavoritePlace,
  CountFavoritePlace,
  GetFoodDetail,
  GetRestaurantsByFood,
  GetFeaturedItinerariesByDestination,
  GetItinerariesByDestination,
  SearchPlacesInDestination,

  // NEW: warnings API
  GetItineraryWarnings,
  GetItineraryWarningsForDay,
};
// Lấy thông tin invite theo token
const GetInviteByToken = async (token) => {
  return await axios.get(`/itineraries/invites/${token}`);
};

// Accept/Decline invite
const HandleInvite = async (token, status) => {
  return await axios.post(`/itineraries/invites/accept?token=${token}`, {
    status,
  });
};

export { GetInviteByToken, HandleInvite };
