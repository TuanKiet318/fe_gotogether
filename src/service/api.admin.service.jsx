import axios from "./axios.admin.customize";

// Lấy danh sách place theo destinationId
const GetPlacesByDestination = async (
  destinationId,
  page = 0,
  size = 10,
  sortBy = "name",
  sortDirection = "asc",
  categoryId = null
) => {
  const params = {
    page,
    size,
    sortBy,
    sortDirection,
  };
  if (categoryId) {
    params.categoryId = categoryId;
  }
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
  const params = {
    destinationName,
    page,
    size,
    sortBy,
    sortDirection,
  };
  if (categoryId) {
    params.categoryId = categoryId;
  }
  const API = `/places/by-destination-name`;
  return await axios.get(API, { params });
};


const SearchPlaces = async (
  {
    destinationName = "",
    categoryId = "",
    keyword = "",
    minRating = "",
    page = 0,
    size = 10,
    sortBy = "name",
    sortDirection = "asc"
  } = {}
) => {
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
  Object.keys(params).forEach(
    key => (params[key] === "" || params[key] == null) && delete params[key]
  );
  const API = "/places/search";
  return await axios.get(API, { params });
};
export {
  GetPlacesByDestination,
  GetPlacesByDestinationName,
  SearchPlaces
};

