import React, { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  X,
} from "lucide-react";

const TravelBlog = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Khám phá vẻ đẹp Đà Lạt mùa hoa",
      author: "Minh Anh",
      date: "5 Nov 2024",
      location: "Đà Lạt, Lâm Đồng",
      images: [
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
        "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
        "https://images.pexels.com/photos/2680937/pexels-photo-2680937.jpeg?w=800&q=80",
      ],
      excerpt:
        "Đà Lạt mùa này đẹp không thể tả! Hoa dã quỳ nở rộ khắp nơi, không khí mát mẻ và những quán cafe view đẹp làm lòng người say đắm...",
      likes: 124,
      comments: 32,
    },
    {
      id: 2,
      title: "Hành trình xuyên Việt bằng xe máy",
      author: "Tuấn Kiệt",
      date: "3 Nov 2024",
      location: "Xuyên Việt",
      images: [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        "https://images.unsplash.com/photo-1474496517593-015d8b59450d?w=800&q=80",
        "https://images.unsplash.com/photo-1591084728795-1149f32d9866?w=800&q=80",
        "https://images.pexels.com/photos/3452151/pexels-photo-3452151.jpeg?w=800&q=80",
      ],
      excerpt:
        "15 ngày, 3000km từ Hà Nội đến Sài Gòn. Mỗi cây số là một kỷ niệm, mỗi bữa ăn là một câu chuyện...",
      likes: 256,
      comments: 78,
    },
    {
      id: 3,
      title: "Phú Quốc - Thiên đường biển đảo",
      author: "Hương Giang",
      date: "1 Nov 2024",
      location: "Phú Quốc, Kiên Giang",
      images: [
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
        "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800&q=80",
      ],
      excerpt:
        "Nước biển trong xanh, bãi cát trắng mịn và những bữa tiệc hải sản tươi ngon. Phú Quốc không bao giờ khiến bạn thất vọng!",
      likes: 189,
      comments: 45,
    },
  ]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [search, setSearch] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    location: "",
    excerpt: "",
    images: [""],
  });

  const handleSubmitPost = () => {
    if (
      !newPost.title ||
      !newPost.location ||
      !newPost.excerpt ||
      newPost.images.filter((img) => img).length === 0
    )
      return;

    const post = {
      id: posts.length + 1,
      ...newPost,
      images: newPost.images.filter((img) => img),
      author: "Bạn",
      date: new Date().toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      likes: 0,
      comments: 0,
    };
    setPosts([post, ...posts]);
    setNewPost({ title: "", location: "", excerpt: "", images: [""] });
    setShowNewPostForm(false);
  };

  const handleLike = (id) => {
    setPosts(
      posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const addImageField = () => {
    setNewPost({ ...newPost, images: [...newPost.images, ""] });
  };

  const removeImageField = (index) => {
    setNewPost({
      ...newPost,
      images: newPost.images.filter((_, i) => i !== index),
    });
  };

  const updateImageField = (index, value) => {
    const newImages = [...newPost.images];
    newImages[index] = value;
    setNewPost({ ...newPost, images: newImages });
  };

  const renderImages = (images) => {
    const count = images.length;
    const commonClass =
      "w-full h-full object-cover rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105";

    if (count === 1) {
      return (
        <div className="w-full overflow-hidden rounded-2xl">
          <img
            src={images[0]}
            alt=""
            onClick={() => setSelectedImage(images[0])}
            className={commonClass}
          />
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 overflow-hidden">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt=""
              onClick={() => setSelectedImage(img)}
              className={commonClass}
            />
          ))}
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
          <img
            src={images[0]}
            alt=""
            onClick={() => setSelectedImage(images[0])}
            className={commonClass}
          />
          <div className="grid grid-rows-2 gap-2">
            {images.slice(1).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                onClick={() => setSelectedImage(img)}
                className={commonClass}
              />
            ))}
          </div>
        </div>
      );
    }

    if (count === 4) {
      return (
        <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt=""
              onClick={() => setSelectedImage(img)}
              className={commonClass}
            />
          ))}
        </div>
      );
    }

    // >4 ảnh
    return (
      <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
        <img
          src={images[0]}
          alt=""
          onClick={() => setSelectedImage(images[0])}
          className={commonClass}
        />
        <div className="grid grid-rows-2 gap-2 relative">
          <img
            src={images[1]}
            alt=""
            onClick={() => setSelectedImage(images[1])}
            className={commonClass}
          />
          <div className="grid grid-cols-2 gap-2 relative">
            {images.slice(2, 4).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                onClick={() => setSelectedImage(img)}
                className={commonClass}
              />
            ))}
            {count > 4 && (
              <div
                onClick={() => setSelectedImage(images[4])}
                className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg cursor-pointer"
              >
                <span className="text-white text-2xl font-semibold">
                  +{count - 4}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* 🔹 Modal Đăng bài */}
      {showNewPostForm && (
        <div className="fixed inset-0 bg-black/7    0 z-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Chia sẻ hành trình của bạn
              </h2>
              <button
                onClick={() => setShowNewPostForm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Form fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Khám phá Hội An cổ kính"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={newPost.location}
                  onChange={(e) =>
                    setNewPost({ ...newPost, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Hội An, Quảng Nam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh
                </label>
                <div className="space-y-2">
                  {newPost.images.map((img, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={img}
                        onChange={(e) =>
                          updateImageField(index, e.target.value)
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`URL hình ảnh ${index + 1}`}
                      />
                      {newPost.images.length > 1 && (
                        <button
                          onClick={() => removeImageField(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addImageField}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition"
                  >
                    + Thêm ảnh
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung
                </label>
                <textarea
                  value={newPost.excerpt}
                  onChange={(e) =>
                    setNewPost({ ...newPost, excerpt: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSubmitPost}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Đăng bài
                </button>
                <button
                  onClick={() => setShowNewPostForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Nội dung chính */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Khám phá <span className="text-blue-600">Việt Nam</span>
          </h2>
          <p className="text-lg text-gray-600">
            Chia sẻ hành trình tuyệt vời của bạn cùng cộng đồng du lịch
          </p>
        </div>

        {/* 🔸 Thanh công cụ đăng bài + tìm kiếm */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
          <button
            onClick={() => setShowNewPostForm(true)}
            className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Đăng bài mới
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 🔸 Danh sách bài viết */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6 pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{post.author}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{post.date}</span>
                      <span className="mx-1">•</span>
                      <MapPin className="w-3 h-3 text-red-500 mr-1" />
                      <span>{post.location}</span>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {post.title}
                </h2>

                <p className="text-gray-600 mb-4">{post.excerpt}</p>
              </div>

              {renderImages(post.images)}

              <div className="p-6 pt-4">
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition group"
                    >
                      <Heart className="w-6 h-6 group-hover:fill-red-500" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition">
                      <MessageCircle className="w-6 h-6" />
                      <span>{post.comments}</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition">
                    <Share2 className="w-6 h-6" />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      {/* 🔹 Modal xem ảnh lớn */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-70 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TravelBlog;
