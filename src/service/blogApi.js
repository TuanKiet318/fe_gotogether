// src/api/blogApi.js
import instance from "./axios.admin.customize";

const blogApi = {
  /* -------------------- CREATE BLOG -------------------- */
  // Trường hợp bạn tạo blog không thông qua itinerary
  createBlog: (data) => {
    return instance.post(`/blogs`, data);
  },

  // Tạo blog từ itinerary
  createBlogFromItinerary: (itineraryId, data) => {
    return instance.post(`/itineraries/${itineraryId}/blog`, data);
  },

  /* -------------------- GET BLOG -------------------- */
  getBlogById: (blogId) => {
    return instance.get(`/blogs/${blogId}`);
  },

  getBlogBySlug: (slug) => {
    return instance.get(`/blogs/slug/${slug}`);
  },

  getBlogs: (page = 0, size = 10) => {
    return instance.get(`/blogs`, { params: { page, size } });
  },

  getMyBlogs: (page = 0, size = 10) => {
    return instance.get(`/blogs/my-blogs`, { params: { page, size } });
  },

  getBlogsFromItinerary: (itineraryId) => {
    return instance.get(`/itineraries/${itineraryId}/blogs`);
  },

  /* -------------------- UPDATE / PUBLISH / DELETE -------------------- */
  updateBlog: (blogId, data) => {
    return instance.put(`/blogs/${blogId}`, data);
  },

  publishBlog: (blogId) => {
    return instance.post(`/blogs/${blogId}/publish`);
  },

  deleteBlog: (blogId) => {
    return instance.delete(`/blogs/${blogId}`);
  },

  /* -------------------- COMMENTS & LIKES -------------------- */
  commentBlog: (blogId, comment) => {
    return instance.post(`/blogs/${blogId}/comments`, { comment });
  },

  toggleLike: (blogId) => {
    return instance.post(`/blogs/${blogId}/like`);
  },

  /* -------------------- UPLOAD MEDIA FOR BLOG -------------------- */
  uploadMedia: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return instance.post("/upload/blog", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default blogApi;
