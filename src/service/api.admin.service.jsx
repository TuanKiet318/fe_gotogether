import axios from "./axios.admin.customize";

// Lấy danh sách destination
const GetAllDestinations = async () => {
  const API = "/destinations";
  return await axios.get(API);
};

const searchDestinations = async (keyword, limit = 10) => {
  const API = `/destinations/search?q=${keyword}&limit=${limit}`;
  return await axios.get(API);
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

// Lấy danh sách place theo destinationId
const GetPlacesByDestination = async (
  destinationId,
  page = 0,
  size = 10,
  sortBy = "name",
  sortDirection = "asc",
  categoryId = null
) => {
  const params = { page, size, sortBy, sortDirection };
  if (categoryId) params.categoryId = categoryId;

  const API = `/places/by-destination/${destinationId}`;
  return await axios.get(API, { params });
};

// Lấy danh sách place theo destinationName
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

  // loại bỏ param null hoặc ""
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

export {
  GetAllDestinations,
  GetDestinationDetail,
  GetCategoriesByDestination,
  GetPlacesByCategory,
  GetFoodsByDestination,
  GetPlaceDetail,
  GetPlacesByDestination,
  GetPlacesByDestinationName,
  SearchPlaces,
  GetAllCategories,
};
const SearchDestinations = async (keyword) => {
  const API = "/destinations/search";
  const params = {};
  if (keyword) params.q = keyword;

  return await axios.get(API, { params });
};

export { SearchDestinations };
