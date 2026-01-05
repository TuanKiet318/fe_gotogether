// src/api/itineraryApi.js
import instance from "./axios.admin.customize";

/* =======================================================
   MEDIA UPLOAD
======================================================= */

// Upload file → Cloudinary or server
export const uploadItineraryMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return instance.post("/upload/itinerary", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* =======================================================
   MEDIA CRUD
======================================================= */

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

/* =======================================================
   FEATURE ITINERARY (OVERVIEW + TAGS + HERO IMAGES)
======================================================= */

/**
 * Feature itinerary
 *
 * @param {string} itineraryId
 * @param {{
 *   overview: string,
 *   tagIds?: string[],
 *   heroImageFiles?: File[]
 * }} payload
 */
export const featureItinerary = async (itineraryId, payload) => {
  const formData = new FormData();

  // required
  formData.append("overview", payload.overview);

  // optional tags
  if (payload.tagIds && payload.tagIds.length > 0) {
    payload.tagIds.forEach((tagId) => {
      formData.append("tagIds", tagId);
    });
  }

  // multiple hero images
  if (payload.heroImageFiles && payload.heroImageFiles.length > 0) {
    payload.heroImageFiles.forEach((file) => {
      formData.append("heroImageFiles", file);
    });
  }

  return instance.put(
    `/itineraries/${itineraryId}/feature`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};
