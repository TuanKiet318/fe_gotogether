// src/api/itineraryApi.js
import instance from "./axios.admin.customize";

/* -------------------- MEDIA UPLOAD -------------------- */
// Upload file → Cloudinary or server
export const uploadItineraryMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return instance.post("/upload/itinerary", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* -------------------- MEDIA CRUD -------------------- */
export const saveMediaInfo = async (itineraryId, mediaData) => {
  return instance.post(`/itineraries/${itineraryId}/media`, mediaData);
};

export const getAllMedia = async (itineraryId) => {
  return instance.get(`/itineraries/${itineraryId}/media`);
};

export const getMediaByDay = async (itineraryId, dayNumber) => {
  return instance.get(`/itineraries/${itineraryId}/media/day/${dayNumber}`);
};

export const updateMedia = async (itineraryId, mediaId, body) => {
  return instance.put(`/itineraries/${itineraryId}/media/${mediaId}`, body);
};

export const deleteMedia = async (itineraryId, mediaId) => {
  return instance.delete(`/itineraries/${itineraryId}/media/${mediaId}`);
};

export const getMediaStats = async (itineraryId) => {
  return instance.get(`/itineraries/${itineraryId}/media/stats`);
};
