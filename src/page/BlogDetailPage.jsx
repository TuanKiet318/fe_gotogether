import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import blogApi from "../service/blogApi";
import { useAuth } from "../context/AuthProvider";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  Users,
  Share2,
  Bookmark,
  MoreVertical,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/blog.css";
function BlogDetailPage() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const queryParams = new URLSearchParams(location.search);
  const from = queryParams.get("from");
  const menu = queryParams.get("menu");

  const [expandedDays, setExpandedDays] = useState({});
  const [showFullContent, setShowFullContent] = useState(false);
  const parseMarkdownContent = (content) => {
    if (!content) return [];

    const sections = [];
    const lines = content.split("\n");
    let currentSection = { type: "text", content: [] };

    lines.forEach((line, index) => {
      // Tiêu đề chính (#)
      if (line.startsWith("# ") && !line.startsWith("## ")) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          type: "main-title",
          content: line.replace("# ", "").trim(),
          level: 1,
        };
        sections.push(currentSection);
        currentSection = { type: "text", content: [] };
      }
      // Tiêu đề ngày (##)
      else if (line.startsWith("## ")) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        const dayMatch = line.match(/## Ngày (\d+): (.+)/);
        if (dayMatch) {
          currentSection = {
            type: "day-title",
            dayNumber: parseInt(dayMatch[1]),
            title: dayMatch[2],
            content: [],
            level: 2,
          };
        } else {
          currentSection = {
            type: "sub-title",
            content: line.replace("## ", "").trim(),
            level: 2,
          };
          sections.push(currentSection);
          currentSection = { type: "text", content: [] };
        }
      }
      // Tiêu đề phụ (###)
      else if (line.startsWith("### ")) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          type: "section-title",
          content: line.replace("### ", "").trim(),
          level: 3,
        };
        sections.push(currentSection);
        currentSection = { type: "text", content: [] };
      }
      // Dấu phân cách (---)
      else if (line.trim() === "---") {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { type: "divider", content: [] };
        sections.push(currentSection);
        currentSection = { type: "text", content: [] };
      }
      // Bold text (**text**)
      else if (line.includes("**") && line.split("**").length === 3) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        const boldMatch = line.match(/\*\*(.+)\*\*/);
        if (boldMatch) {
          currentSection = {
            type: "bold-text",
            content: boldMatch[1],
            originalLine: line,
          };
          sections.push(currentSection);
          currentSection = { type: "text", content: [] };
        }
      }
      // Danh sách (1. hoặc *)
      else if (/^\d+\.\s/.test(line) || /^\*\s/.test(line)) {
        if (currentSection.type !== "list") {
          if (currentSection.content.length > 0) {
            sections.push(currentSection);
          }
          currentSection = { type: "list", items: [] };
        }
        currentSection.items.push(line);
      }
      // Đoạn văn bình thường
      else if (line.trim()) {
        currentSection.content.push(line);
      }
      // Dòng trống
      else if (
        currentSection.content.length > 0 ||
        currentSection.items?.length > 0
      ) {
        sections.push(currentSection);
        currentSection = { type: "text", content: [] };
      }
    });

    if (currentSection.content.length > 0 || currentSection.items?.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  };

  // Hàm toggle expand ngày
  const toggleDayExpand = (dayNumber) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
  };

  const handleBack = () => {
    if (from === "me" && menu) {
      navigate(`/me?menu=${menu}`);
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    loadBlogDetail();
  }, [blogId]);

  const loadBlogDetail = async () => {
    try {
      setLoading(true);
      const res = await blogApi.getBlogById(blogId);
      setBlog(res);
    } catch (error) {
      console.error("Failed to load blog detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!blog) return;

    try {
      const res = await blogApi.toggleLike(blog.id);
      const liked = res.data?.liked ?? res.liked;

      setBlog((prev) => ({
        ...prev,
        likeCount: Math.max((prev.likeCount ?? 0) + (liked ? 1 : -1), 0),
        isLiked: liked,
      }));
    } catch (e) {
      console.error("Toggle like failed", e);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !blog) return;

    setIsSubmitting(true);
    try {
      await blogApi.commentBlog(blog.id, commentText.trim());
      setCommentText("");

      // Refresh comments
      const updatedBlog = await blogApi.getBlogById(blog.id);
      setBlog(updatedBlog);
    } catch (error) {
      console.error("Lỗi khi gửi comment:", error);
      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  const hasMedia = blog?.media && blog.media.length > 0;
  const hasMultipleMedia = blog?.media && blog.media.length > 1;
  const hasContent = blog?.content?.trim().length > 0;
  const hasTitle = blog?.title?.trim().length > 0;
  const isItinerary =
    blog?.type === "itinerary" ||
    blog?.title?.toLowerCase().includes("hành trình");

  const handlePrevImage = () => {
    if (!blog?.media) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? blog.media.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!blog?.media) return;
    setCurrentImageIndex((prev) =>
      prev === blog.media.length - 1 ? 0 : prev + 1
    );
  };

  const itineraryStats = useMemo(() => {
    if (!blog?.content || !isItinerary) return null;

    const sections = parseMarkdownContent(blog.content);
    const dayTitles = sections.filter((s) => s.type === "day-title");
    const listSections = sections.filter((s) => s.type === "list");
    let totalPlaces = 0;

    listSections.forEach((section) => {
      totalPlaces += section.items.length;
    });

    return {
      totalDays: dayTitles.length,
      totalPlaces: totalPlaces,
      hasMedia: blog.media?.length > 0,
    };
  }, [blog, isItinerary]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Đang tải bài viết...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-2">Không tìm thấy bài viết</h1>
        <p className="text-gray-600 mb-4">
          Bài viết này không tồn tại hoặc đã bị xóa.
        </p>
        <button
          onClick={() => navigate("/blogs")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Bài viết</h1>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bookmark className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`w-full ${hasMedia ? "" : "max-w-4xl mx-auto"}`}>
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="px-4 py-6">
            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={blog.authorAvatar || "/imgs/image.png"}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div className="flex-1">
                <h2 className="font-bold text-gray-900">{blog.authorName}</h2>
                <div className="text-sm text-gray-500">
                  {new Date(blog.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Title */}
            {hasTitle && (
              <h1 className="text-2xl font-bold mb-4 text-gray-900 leading-tight">
                {blog.title}
              </h1>
            )}

            {/* Itinerary Badge */}
            {isItinerary && (
              <div className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-2 text-blue-700 font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>Hành trình du lịch</span>
                </div>
              </div>
            )}

            {/* Media Section - Responsive height */}
            {hasMedia && (
              <div className="mb-6">
                <div className="relative bg-black rounded-xl overflow-hidden">
                  {/* Main media display with max height */}
                  <div className="relative max-h-[70vh] min-h-[300px] flex items-center justify-center">
                    {blog.media[currentImageIndex].type === "IMAGE" ? (
                      <img
                        src={blog.media[currentImageIndex].url}
                        alt=""
                        className="w-full h-full object-contain max-h-[70vh]"
                      />
                    ) : (
                      <video
                        src={blog.media[currentImageIndex].url}
                        className="w-full max-h-[70vh] object-contain"
                        controls
                        autoPlay
                      />
                    )}

                    {/* Navigation arrows */}
                    {hasMultipleMedia && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/60 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/60 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Image counter */}
                    {hasMultipleMedia && (
                      <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                        {currentImageIndex + 1} / {blog.media.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="mb-8">
              {hasContent && (
                <div className="mb-8">
                  {isItinerary ? (
                    <div className="space-y-6">
                      {/* Render markdown content for itineraries */}
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        {parseMarkdownContent(blog.content).map(
                          (section, index) => {
                            if (section.type === "main-title") {
                              return (
                                <div
                                  key={index}
                                  className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b"
                                >
                                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {section.content}
                                  </h1>
                                </div>
                              );
                            }

                            if (section.type === "day-title") {
                              const isExpanded =
                                expandedDays[section.dayNumber] || false;
                              const dayMedia =
                                blog.media?.filter(
                                  (m) => m.dayNumber === section.dayNumber
                                ) || [];

                              return (
                                <div key={index} className="border-b">
                                  <button
                                    onClick={() =>
                                      toggleDayExpand(section.dayNumber)
                                    }
                                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center space-x-4">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                        {section.dayNumber}
                                      </div>
                                      <div className="text-left">
                                        <h3 className="font-bold text-lg text-gray-900">
                                          Ngày {section.dayNumber}:{" "}
                                          {section.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                          {dayMedia.length} hình ảnh •{" "}
                                          {section.content.length} địa điểm
                                        </p>
                                      </div>
                                    </div>
                                    <svg
                                      className={`w-5 h-5 text-gray-400 transition-transform ${
                                        isExpanded ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </button>

                                  {isExpanded && (
                                    <div className="px-6 pb-6">
                                      {/* Day media preview */}
                                      {dayMedia.length > 0 && (
                                        <div className="mb-4">
                                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                            <svg
                                              className="w-5 h-5 mr-2 text-blue-500"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            Hình ảnh ngày {section.dayNumber}
                                          </h4>
                                          <div className="flex space-x-3 overflow-x-auto pb-2">
                                            {dayMedia.map(
                                              (media, mediaIndex) => (
                                                <div
                                                  key={mediaIndex}
                                                  className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border border-gray-200"
                                                >
                                                  {media.type === "IMAGE" ? (
                                                    <img
                                                      src={media.url}
                                                      alt={
                                                        media.caption ||
                                                        `Hình ${mediaIndex + 1}`
                                                      }
                                                      className="w-full h-full object-cover"
                                                    />
                                                  ) : (
                                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                                      <svg
                                                        className="w-8 h-8 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path d="M8 5v14l11-7z" />
                                                      </svg>
                                                    </div>
                                                  )}
                                                  {media.caption && (
                                                    <div className="p-2 bg-white text-xs text-gray-600 truncate">
                                                      {media.caption}
                                                    </div>
                                                  )}
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Day content */}
                                      <div className="prose prose-blue max-w-none">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                        >
                                          {section.content.join("\n")}
                                        </ReactMarkdown>
                                      </div>

                                      {/* Day places if available */}
                                      {section.content.some((line) =>
                                        line.includes("**")
                                      ) && (
                                        <div className="mt-4 bg-gray-50 rounded-xl p-4">
                                          <h4 className="font-semibold text-gray-700 mb-3">
                                            Các địa điểm đã ghé thăm:
                                          </h4>
                                          <div className="space-y-3">
                                            {section.content
                                              .filter(
                                                (line) =>
                                                  line.includes("**") &&
                                                  /^\d+\./.test(line)
                                              )
                                              .map((line, idx) => {
                                                const match =
                                                  line.match(/\*\*(.+?)\*\*/);
                                                if (match) {
                                                  const placeName = match[1];
                                                  const description = line
                                                    .replace(
                                                      `**${placeName}**`,
                                                      ""
                                                    )
                                                    .replace(/^\d+\.\s*/, "")
                                                    .trim();
                                                  return (
                                                    <div
                                                      key={idx}
                                                      className="flex items-start space-x-3 p-3 bg-white rounded-lg"
                                                    >
                                                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                        {idx + 1}
                                                      </div>
                                                      <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">
                                                          {placeName}
                                                        </div>
                                                        {description && (
                                                          <div className="text-sm text-gray-600 mt-1">
                                                            {description}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                }
                                                return null;
                                              })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (section.type === "section-title") {
                              return (
                                <div key={index} className="p-6 border-b">
                                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    {section.content.includes("Hình ảnh") && (
                                      <svg
                                        className="w-5 h-5 mr-2 text-blue-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                    {section.content}
                                  </h3>
                                </div>
                              );
                            }

                            if (section.type === "bold-text") {
                              return (
                                <div key={index} className="px-6 py-3">
                                  <div className="font-semibold text-gray-700 bg-blue-50 p-3 rounded-lg">
                                    {section.content}
                                  </div>
                                </div>
                              );
                            }

                            if (section.type === "list") {
                              return (
                                <div key={index} className="px-6 py-3">
                                  <div className="space-y-2">
                                    {section.items.map((item, itemIndex) => (
                                      <div
                                        key={itemIndex}
                                        className="flex items-start space-x-3"
                                      >
                                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                                          {itemIndex + 1}
                                        </div>
                                        <div className="text-gray-700">
                                          <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                          >
                                            {item.replace(/^\d+\.\s*/, "")}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            if (section.type === "divider") {
                              return (
                                <div key={index} className="px-6 py-4">
                                  <div className="border-t border-gray-300"></div>
                                </div>
                              );
                            }

                            if (
                              section.type === "text" &&
                              section.content.length > 0
                            ) {
                              // Check if it's summary section
                              const isSummary = section.content.some(
                                (line) =>
                                  line.includes("Tổng kết") ||
                                  line.includes("tổng cộng")
                              );

                              if (isSummary) {
                                return (
                                  <div
                                    key={index}
                                    className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-t"
                                  >
                                    <div className="prose prose-green max-w-none">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                      >
                                        {section.content.join("\n")}
                                      </ReactMarkdown>
                                    </div>
                                    {blog.itineraryInfo?.budget && (
                                      <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-200">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="text-sm text-gray-500">
                                              Tổng chi phí ước tính
                                            </div>
                                            <div className="text-2xl font-bold text-emerald-700">
                                              {blog.itineraryInfo.budget.toLocaleString(
                                                "vi-VN"
                                              )}{" "}
                                              VNĐ
                                            </div>
                                          </div>
                                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <span className="text-emerald-600 font-bold text-xl">
                                              ₫
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <div key={index} className="px-6 py-3">
                                  <div className="prose max-w-none text-gray-700">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {section.content.join("\n")}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          }
                        )}
                      </div>

                      {/* Quick stats summary */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">
                          📊 Thống kê hành trình
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-xl">
                            <div className="text-2xl font-bold text-blue-600">
                              {blog.itineraryDays?.length ||
                                itineraryStats?.totalDays ||
                                0}
                            </div>
                            <div className="text-sm text-gray-600">
                              Tổng số ngày
                            </div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-xl">
                            <div className="text-2xl font-bold text-green-600">
                              {blog.itineraryDays?.reduce(
                                (sum, day) => sum + (day.places?.length || 0),
                                0
                              ) ||
                                itineraryStats?.totalPlaces ||
                                0}
                            </div>
                            <div className="text-sm text-gray-600">
                              Địa điểm đã đến
                            </div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-xl">
                            <div className="text-2xl font-bold text-purple-600">
                              {blog.media?.length || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                              Hình ảnh/video
                            </div>
                          </div>
                          <div className="text-center p-4 bg-amber-50 rounded-xl">
                            <div className="text-2xl font-bold text-amber-600">
                              {blog.likeCount || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                              Lượt thích
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Normal blog content (non-itinerary)
                    <div
                      className={`text-gray-800 leading-relaxed whitespace-pre-line ${
                        hasMedia ? "text-lg" : "text-xl"
                      }`}
                    >
                      <div className="prose prose-lg max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {blog.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comments and other sections */}
            {/* ... rest of mobile layout ... */}
          </div>
        </div>

        {/* Desktop Layout */}
        <div
          className={`hidden lg:flex min-h-[calc(100vh-64px)] ${
            hasMedia ? "" : "justify-center"
          }`}
        >
          {/* Left Column - Media (only show if has media) */}
          {hasMedia && (
            <div
              className={`flex-1 flex flex-col min-w-0 ${
                !hasMedia ? "hidden" : ""
              }`}
            >
              <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                {blog.media[currentImageIndex].type === "IMAGE" ? (
                  <img
                    src={blog.media[currentImageIndex].url}
                    alt=""
                    className="max-w-full max-h-[calc(100vh-64px)] object-contain"
                  />
                ) : (
                  <video
                    src={blog.media[currentImageIndex].url}
                    className="max-w-full max-h-[calc(100vh-64px)]"
                    controls
                    autoPlay
                  />
                )}

                {/* Navigation arrows */}
                {hasMultipleMedia && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full w-14 h-14 flex items-center justify-center transition-all hover:scale-105"
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full w-14 h-14 flex items-center justify-center transition-all hover:scale-105"
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image counter */}
                {hasMultipleMedia && (
                  <div className="absolute top-6 right-6 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm">
                    {currentImageIndex + 1} / {blog.media.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {hasMultipleMedia && (
                <div className="border-t border-gray-800 bg-black">
                  <div className="p-4">
                    <div className="flex space-x-3 overflow-x-auto">
                      {blog.media.map((media, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-3 transition-all ${
                            currentImageIndex === index
                              ? "border-blue-500 scale-105"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          {media.type === "IMAGE" ? (
                            <img
                              src={media.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Column - Content */}
          <div
            className={`overflow-y-auto h-[calc(100vh-64px)] ${
              hasMedia ? "w-[600px] border-l" : "w-full max-w-4xl"
            }`}
          >
            <div className={`${hasMedia ? "p-8" : "p-12"}`}>
              {/* Author Info */}
              <div className="flex items-center space-x-4 mb-8 pb-6 border-b">
                <img
                  src={blog.authorAvatar || "/imgs/image.png"}
                  alt="avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                />
                <div className="flex-1">
                  <h2 className="font-bold text-lg text-gray-900">
                    {blog.authorName}
                  </h2>
                  <div className="text-sm text-gray-500">
                    {new Date(blog.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Itinerary Badge */}
                {isItinerary && (
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                    <span className="text-white font-medium flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Hành trình</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Title */}
              {hasTitle && (
                <h1
                  className={`font-bold mb-6 text-gray-900 leading-snug ${
                    hasMedia ? "text-3xl" : "text-4xl"
                  }`}
                >
                  {blog.title}
                </h1>
              )}

              {/* Itinerary Info */}
              {isItinerary && blog.itineraryInfo && (
                <div className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Điểm đến</div>
                          <div className="font-semibold text-gray-900">
                            {blog.itineraryInfo.destination}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Thời gian</div>
                          <div className="font-semibold text-gray-900">
                            {blog.itineraryInfo.days} ngày
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Số người</div>
                          <div className="font-semibold text-gray-900">
                            {blog.itineraryInfo.travelers} người
                          </div>
                        </div>
                      </div>

                      {blog.itineraryInfo.budget && (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <span className="text-amber-600 font-bold">₫</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Chi phí</div>
                            <div className="font-semibold text-gray-900">
                              {blog.itineraryInfo.budget.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="mb-8">
                {hasContent && (
                  <div
                    className={`text-gray-800 leading-relaxed whitespace-pre-line ${
                      hasMedia ? "text-lg" : "text-xl"
                    }`}
                  >
                    {blog.content}
                  </div>
                )}
              </div>

              {/* Itinerary Days */}
              {isItinerary &&
                blog.itineraryDays &&
                blog.itineraryDays.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 border-l-4 border-blue-500 pl-4">
                      Chi tiết hành trình
                    </h3>
                    <div className="space-y-6">
                      {blog.itineraryDays.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                        >
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                              {day.dayNumber}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">
                                {day.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {day.date}
                              </p>
                            </div>
                          </div>

                          {day.description && (
                            <p className="text-gray-600 mb-4">
                              {day.description}
                            </p>
                          )}

                          {day.places && day.places.length > 0 && (
                            <div className="space-y-3">
                              {day.places.map((place, placeIndex) => (
                                <div
                                  key={placeIndex}
                                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                                    {placeIndex + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">
                                      {place.name}
                                    </div>
                                    {place.description && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        {place.description}
                                      </div>
                                    )}
                                    {place.time && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        ⏰ {place.time}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Stats and Actions */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={handleToggleLike}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors group"
                    >
                      <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                        <Heart
                          className={`w-6 h-6 transition-all ${
                            blog.isLiked
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400 group-hover:text-red-500"
                          }`}
                        />
                      </div>
                      <span className="font-semibold text-gray-900">
                        {blog.likeCount || 0}
                      </span>
                    </button>

                    <div className="flex items-center space-x-2 text-gray-700">
                      <div className="p-2 rounded-full">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-gray-900">
                        {blog.commentCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-bold mb-6 text-gray-900">
                  Bình luận ({blog.commentCount || 0})
                </h3>

                {/* Comment input */}
                <div className="flex items-start space-x-4 mb-8">
                  <img
                    src={user?.avatar || "/imgs/image.png"}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 border"
                  />
                  <div className="flex-1">
                    <textarea
                      placeholder="Viết bình luận của bạn..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 bg-gray-50"
                      rows="3"
                    />
                    {commentText.trim() && (
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleCommentSubmit}
                          disabled={isSubmitting}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all font-medium shadow-sm hover:shadow"
                        >
                          {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments list */}
                <div className="space-y-6">
                  {blog.comments?.length > 0 ? (
                    blog.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-4">
                        <img
                          src={comment.userAvatar || "/imgs/image.png"}
                          alt={comment.userName || "User"}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-gray-900">
                                {comment.userName}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "numeric",
                                    month: "short",
                                  }
                                )}
                              </span>
                            </div>
                            <p className="text-gray-700">{comment.comment}</p>
                          </div>
                          <div className="flex items-center space-x-4 mt-3 ml-4 text-sm text-gray-500">
                            <button className="hover:text-blue-600 hover:font-medium transition-colors">
                              Thích
                            </button>
                            <button className="hover:text-blue-600 transition-colors">
                              Trả lời
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
                      <div className="text-4xl mb-3">💬</div>
                      <p className="text-lg font-medium text-gray-500 mb-1">
                        Chưa có bình luận nào
                      </p>
                      <p className="text-sm">
                        Hãy là người đầu tiên bình luận!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile - Comments and stats section */}
        <div className="lg:hidden px-4 pb-20">
          {/* Stats and Actions */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleToggleLike}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors group"
                >
                  <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                    <Heart
                      className={`w-6 h-6 transition-all ${
                        blog.isLiked
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400 group-hover:text-red-500"
                      }`}
                    />
                  </div>
                  <span className="font-semibold text-gray-900">
                    {blog.likeCount || 0}
                  </span>
                </button>

                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="p-2 rounded-full">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-gray-900">
                    {blog.commentCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900">
              Bình luận ({blog.commentCount || 0})
            </h3>

            {/* Comment input */}
            <div className="flex items-start space-x-4 mb-8">
              <img
                src={user?.avatar || "/imgs/image.png"}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border"
              />
              <div className="flex-1">
                <textarea
                  placeholder="Viết bình luận của bạn..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 bg-gray-50"
                  rows="3"
                />
                {commentText.trim() && (
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all font-medium shadow-sm hover:shadow"
                    >
                      {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-6">
              {blog.comments?.length > 0 ? (
                blog.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-4">
                    <img
                      src={comment.userAvatar || "/imgs/image.png"}
                      alt={comment.userName || "User"}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 border"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900">
                            {comment.userName}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.comment}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-3 ml-4 text-sm text-gray-500">
                        <button className="hover:text-blue-600 hover:font-medium transition-colors">
                          Thích
                        </button>
                        <button className="hover:text-blue-600 transition-colors">
                          Trả lời
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-lg font-medium text-gray-500 mb-1">
                    Chưa có bình luận nào
                  </p>
                  <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogDetailPage;
