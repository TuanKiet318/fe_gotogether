import instance from "./axios.admin.customize";

const blogApi = {
  // Tạo blog
  createBlog: (data) => {
    return instance.post(`/blogs`, data);
  },

  // Xem chi tiết blog
  getBlogById: (blogId) => {
    return instance.get(`/blogs/${blogId}`);
  },

  // Lấy danh sách blog (lazy loading)
  getBlogs: (page = 0, size = 10) => {
    return instance.get(`/blogs`, {
      params: { page, size },
    });
  },

  // Bình luận blog
  commentBlog: (blogId, comment) => {
    return instance.post(`/blogs/${blogId}/comments`, { comment });
  },

  // Like / Unlike blog
  toggleLike: (blogId) => {
    return instance.post(`/blogs/${blogId}/like`);
  },

  // Xoá blog
  deleteBlog: (blogId) => {
    return instance.delete(`/blogs/${blogId}`);
  },

  uploadMedia: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return instance.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default blogApi;
