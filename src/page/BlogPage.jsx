import { useRef, useEffect, useState, useCallback, useContext } from "react";
import blogApi from "../service/blogApi";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

function BlogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // composers
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // detail modal
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const loadMoreRef = useRef(null);

  const PAGE_SIZE = 5;
  const pageRef = useRef(0);

  // load list
  const loadBlogs = useCallback(
    async (pageIndex) => {
      if (loading) return;
      setLoading(true);

      try {
        const res = await blogApi.getBlogs(pageIndex, PAGE_SIZE);
        const data = res.content || res;

        setBlogs((prev) => (pageIndex === 0 ? data : [...prev, ...data]));

        setHasMore(data.length === PAGE_SIZE);

        pageRef.current = pageIndex;
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  useEffect(() => {
    loadBlogs(0);
  }, []);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadBlogs(pageRef.current + 1);
      }
    });

    const el = loadMoreRef.current;
    if (el) observer.observe(el);

    return () => el && observer.unobserve(el);
  }, [hasMore, loading, loadBlogs]);

  // handle file select
  const handleFilesChange = (e) => {
    const f = Array.from(e.target.files || []);
    setFiles(f);
  };

  // create blog
  const handleCreateBlog = async () => {
    if (!content.trim() && files.length === 0) return;
    try {
      setCreating(true);

      // upload tất cả media trước
      const media = [];
      for (const file of files) {
        const uploadRes = await blogApi.uploadMedia(file);
        const url = uploadRes.url;
        const type = file.type.includes("video") ? "VIDEO" : "IMAGE";
        media.push({ url, type, description: "" });
      }

      const res = await blogApi.createBlog({
        placeId: "",
        content,
        media,
      });

      const newBlog = res.data || res;
      console.log("Create blog response:", newBlog);

      // Đảm bảo newBlog có đầy đủ các field cần thiết
      const blogToAdd = {
        ...newBlog,
        userName: user?.name || newBlog.userName || "User",
        userAvatar: user?.avatar || newBlog.userAvatar || null,
        likes: newBlog.likes || 0,
        comments: newBlog.comments || 0,
        isLiked: false,
        createdAt: newBlog.createdAt || new Date().toISOString(),
      };

      // prepend bài mới lên đầu
      setBlogs((prev) => [blogToAdd, ...prev]);

      // reset form
      setContent("");
      setFiles([]);
      setShowCreateModal(false);
    } catch (e) {
      console.error("Create blog failed", e);
      alert("Đăng bài thất bại: " + (e.message || "Lỗi không xác định"));
    } finally {
      setCreating(false);
    }
  };

  const handleRefreshBlog = async (blogId) => {
    try {
      setLoadingDetail(true);
      const res = await blogApi.getBlogById(blogId);

      // Cập nhật selectedBlog (cho modal)
      setSelectedBlog(res);

      // Cập nhật blog trong danh sách blogs
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blogId
            ? {
                ...b,
                commentCount: res.commentCount,
                comments: res.comments,
                // Giữ nguyên các field khác
              }
            : b
        )
      );
    } catch (e) {
      console.error("Refresh blog failed", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // open detail modal
  const openBlogDetail = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  const closeBlogDetail = () => {
    setSelectedBlogId(null);
    setSelectedBlog(null);
  };

  const handleToggleLike = async (blogId) => {
    try {
      const res = await blogApi.toggleLike(blogId);
      const liked = res.data?.liked ?? res.liked;

      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blogId
            ? {
                ...b,
                likeCount: Math.max((b.likeCount ?? 0) + (liked ? 1 : -1), 0),
                isLiked: liked,
              }
            : b
        )
      );

      if (selectedBlog && selectedBlog.id === blogId) {
        setSelectedBlog((prev) =>
          prev
            ? {
                ...prev,
                likeCount: Math.max(
                  (prev.likeCount ?? 0) + (liked ? 1 : -1),
                  0
                ),
                isLiked: liked,
              }
            : prev
        );
      }
    } catch (e) {
      console.error("Toggle like failed", e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-4">
      {/* Ô tạo bài viết compact ở đầu trang - giữ nguyên */}
      <div className="bg-white shadow rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatar || "/imgs/image.png"}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500"
          >
            Bạn đang nghĩ gì thế?
          </button>
          {/* ... các button khác ... */}
        </div>
      </div>

      {blogs.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-10">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-lg font-medium">Chưa có bài viết nào</p>
          <p className="text-sm text-gray-400">
            Hãy chia sẻ một điều gì đó thú vị!
          </p>
        </div>
      )}

      {/* Danh sách blog */}
      <div className="space-y-4">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white shadow rounded-xl p-4">
            {/* Click vào phần này để mở trang chi tiết */}
            <div
              onClick={() => openBlogDetail(blog.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={blog.authorAvatar || "/imgs/image.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <div className="font-semibold">{blog.authorName}</div>
                    <div className="text-xs text-gray-400">
                      {blog.createdAt?.slice(0, 16).replace("T", " ")}
                    </div>
                  </div>
                </div>

                {blog.title && (
                  <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                    Hành trình
                  </span>
                )}
              </div>

              <BlogContentDisplay
                blog={blog}
                onSeeMore={() => openBlogDetail(blog.id)}
              />

              {blog.media && blog.media.length > 0 && (
                <MediaGrid media={blog.media} />
              )}
            </div>

            <div className="pt-2 mt-3">
              {/* Reaction summary */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <div className="flex items-center space-x-1">
                  {blog.likeCount > 0 && (
                    <>
                      <div className="flex -space-x-1 items-center">
                        <span className="w-5 h-5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="red"
                            className="w-5 h-5"
                          >
                            <path
                              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                                    4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 
                                    14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 
                                    11.54L12 21.35z"
                            />
                          </svg>
                        </span>
                        <span className="ml-2 text-sm text-slate-700">
                          {blog.likeCount}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span>{blog.commentCount} bình luận</span>
                  <span>{blog.shares}0 lượt chia sẻ</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-around border-t pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLike(blog.id);
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100 transition ${
                    blog.isLiked
                      ? "text-red-600 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {/* ... icon like ... */}
                  <span className="text-sm">Thích</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openBlogDetail(blog.id);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                >
                  {/* ... icon comment ... */}
                  <span className="text-sm">Bình luận</span>
                </button>

                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                >
                  {/* ... icon share ... */}
                  <span className="text-sm">Chia sẻ</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        <div ref={loadMoreRef} className="h-10"></div>

        {loading && (
          <div className="text-center py-4 text-gray-400">Đang tải thêm...</div>
        )}
      </div>

      {/* Modal tạo bài viết - giữ nguyên */}
      {showCreateModal && (
        <CreateBlogModal
          content={content}
          setContent={setContent}
          files={files}
          setFiles={setFiles}
          handleFilesChange={handleFilesChange}
          creating={creating}
          onClose={() => {
            setShowCreateModal(false);
            setContent("");
            setFiles([]);
          }}
          onSubmit={handleCreateBlog}
        />
      )}
    </div>
  );
}

// Component hiển thị content với tính năng rút gọn
function BlogContentDisplay({ blog, onSeeMore }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (blog.title) {
    // Blog từ itinerary - hiển thị preview ngắn
    const previewLines = blog.content.split("\n").slice(0, 8).join("\n");
    const hasMore = blog.content.split("\n").length > 8;

    return (
      <div className="mt-2">
        <div className="prose prose-sm max-w-none">
          <div
            className={`text-sm leading-relaxed ${
              !isExpanded && hasMore ? "line-clamp-4" : ""
            }`}
            dangerouslySetInnerHTML={{
              __html: (isExpanded ? blog.content : previewLines)
                .replace(
                  /^# (.*$)/gim,
                  '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>'
                )
                .replace(
                  /^## (.*$)/gim,
                  '<h2 class="text-xl font-semibold mt-3 mb-2">$1</h2>'
                )
                .replace(
                  /^### (.*$)/gim,
                  '<h3 class="text-lg font-medium mt-2 mb-1">$1</h3>'
                )
                .replace(/^\*\*(.*)\*\*/gim, "<strong>$1</strong>")
                .replace(/^\*(.*)\*$/gim, "<em>$1</em>")
                .replace(/^---$/gim, '<hr class="my-3 border-gray-300"/>')
                .replace(/\n/g, "<br/>"),
            }}
          />
        </div>
        {hasMore && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isExpanded) {
                setIsExpanded(false);
              } else {
                onSeeMore();
              }
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
          >
            Xem chi tiết hành trình →
          </button>
        )}
      </div>
    );
  }

  // Blog thường - rút gọn nếu > 200 ký tự
  const MAX_LENGTH = 200;
  const needTruncate = blog.content.length > MAX_LENGTH;
  const displayContent =
    isExpanded || !needTruncate
      ? blog.content
      : blog.content.slice(0, MAX_LENGTH) + "...";

  return (
    <div className="mt-2">
      <p className="text-sm whitespace-pre-line">{displayContent}</p>
      {needTruncate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium mt-1"
        >
          {isExpanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
}

// Component hiển thị media grid với layout thông minh
function MediaGrid({ media }) {
  const count = media.length;

  if (count === 1) {
    const m = media[0];
    return (
      <div className="mt-2">
        {m.type === "IMAGE" ? (
          <img
            src={m.url}
            alt=""
            className="w-full max-h-96 object-cover rounded-lg"
          />
        ) : (
          <video src={m.url} className="w-full max-h-96 rounded-lg" controls />
        )}
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {media.map((m, idx) =>
          m.type === "IMAGE" ? (
            <img
              key={idx}
              src={m.url}
              alt=""
              className="w-full h-64 object-cover rounded-lg"
            />
          ) : (
            <video
              key={idx}
              src={m.url}
              className="w-full h-64 rounded-lg"
              controls
            />
          )
        )}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {media[0].type === "IMAGE" ? (
          <img
            src={media[0].url}
            alt=""
            className="col-span-2 w-full h-64 object-cover rounded-lg"
          />
        ) : (
          <video
            src={media[0].url}
            className="col-span-2 w-full h-64 rounded-lg"
            controls
          />
        )}
        {media
          .slice(1)
          .map((m, idx) =>
            m.type === "IMAGE" ? (
              <img
                key={idx + 1}
                src={m.url}
                alt=""
                className="w-full h-40 object-cover rounded-lg"
              />
            ) : (
              <video
                key={idx + 1}
                src={m.url}
                className="w-full h-40 rounded-lg"
                controls
              />
            )
          )}
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {media.map((m, idx) =>
          m.type === "IMAGE" ? (
            <img
              key={idx}
              src={m.url}
              alt=""
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <video
              key={idx}
              src={m.url}
              className="w-full h-48 rounded-lg"
              controls
            />
          )
        )}
      </div>
    );
  }

  // 5+ ảnh: hiển thị 4 ảnh đầu, ảnh thứ 4 có overlay +N
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {media
        .slice(0, 3)
        .map((m, idx) =>
          m.type === "IMAGE" ? (
            <img
              key={idx}
              src={m.url}
              alt=""
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <video
              key={idx}
              src={m.url}
              className="w-full h-48 rounded-lg"
              controls
            />
          )
        )}
      <div className="relative">
        {media[3].type === "IMAGE" ? (
          <img
            src={media[3].url}
            alt=""
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <video
            src={media[3].url}
            className="w-full h-48 rounded-lg"
            controls
          />
        )}
        {count > 4 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
            <span className="text-white text-2xl font-bold">+{count - 4}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateBlogModal({
  content,
  setContent,
  files,
  setFiles,
  handleFilesChange,
  creating,
  onClose,
  onSubmit,
}) {
  const { user } = useAuth();
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Tạo bài viết</h2>
          <button
            className="text-gray-500 hover:bg-gray-100 rounded-full p-1"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-start space-x-3 mb-3">
            <img
              src={user?.avatar || "/imgs/image.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="font-semibold">{user?.name || "User"}</div>
          </div>

          <textarea
            className="w-full border-none focus:outline-none focus:ring-0 text-lg resize-none"
            rows={5}
            placeholder="Bạn đang nghĩ gì thế?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {files.length > 0 && (
            <div className="mt-3 p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Đã chọn {files.length} file
                </span>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-red-500 hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {files.map((file, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-24 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Thêm vào bài viết của bạn
              </span>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFilesChange}
                  />
                </label>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="15.5" cy="9.5" r="1.5" />
                    <circle cx="8.5" cy="9.5" r="1.5" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.12.23-2.18.65-3.15.42.57.93 1.07 1.52 1.47C7.37 11.36 8.66 12 10 12c.34 0 .67-.03 1-.09.33.06.66.09 1 .09 1.34 0 2.63-.64 3.83-1.68.59-.4 1.1-.9 1.52-1.47.42.97.65 2.03.65 3.15 0 4.41-3.59 8-8 8z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-purple-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onSubmit}
            disabled={creating || (!content.trim() && files.length === 0)}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {creating ? "Đang đăng..." : "Đăng"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default BlogPage;
