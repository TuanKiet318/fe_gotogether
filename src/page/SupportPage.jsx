// pages/SupportPage.js
import React, { useState } from "react";
import { Link } from "react-router-dom";

const SupportPage = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });

  const faqs = [
    {
      id: 1,
      question: "Làm thế nào để tạo hành trình du lịch?",
      answer:
        '1. Đăng nhập > 2. Nhấn "Tạo hành trình" > 3. Thêm điểm đến > 4. Chia sẻ với bạn bè.',
    },
    {
      id: 2,
      question: "Tôi có thể chỉnh sửa blog đã đăng không?",
      answer: 'Có! Vào "Blog của tôi" > Chọn blog > Nhấn biểu tượng chỉnh sửa.',
    },
    {
      id: 3,
      question: "Làm sao để hủy đặt tour?",
      answer:
        'Vào "Đơn hàng của tôi" > Chọn tour > Nhấn "Hủy" > Xác nhận theo chính sách hủy.',
    },
    {
      id: 4,
      question: "Tại sao tôi không nhận được email xác nhận?",
      answer:
        "Kiểm tra thư mục spam hoặc liên hệ support@gotogether.vn để được hỗ trợ.",
    },
    {
      id: 5,
      question: "Làm thế nào để xóa tài khoản?",
      answer:
        "Vào Cài đặt > Tài khoản > Xóa tài khoản. Lưu ý: Mọi dữ liệu sẽ bị xóa vĩnh viễn.",
    },
  ];

  const supportCategories = [
    { id: "account", label: "Tài khoản", icon: "👤" },
    { id: "booking", label: "Đặt tour", icon: "🎫" },
    { id: "payment", label: "Thanh toán", icon: "💳" },
    { id: "itinerary", label: "Hành trình", icon: "🗺️" },
    { id: "blog", label: "Blog", icon: "📝" },
    { id: "technical", label: "Kỹ thuật", icon: "🔧" },
    { id: "general", label: "Chung", icon: "❓" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý gửi form ở đây
    alert("Yêu cầu hỗ trợ đã được gửi! Chúng tôi sẽ liên hệ trong 24h.");
    setFormData({
      name: "",
      email: "",
      category: "general",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Trung tâm hỗ trợ
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Chúng tôi luôn sẵn sàng giúp đỡ bạn
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/terms"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Điều khoản
            </Link>
            <Link
              to="/privacy"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Chính sách
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-600 text-white p-6 rounded-xl text-center">
            <div className="text-4xl mb-4">Hotline</div>
            <h3 className="text-xl font-semibold mb-2">Hotline 24/7</h3>
            <p className="text-2xl font-bold mb-2">028 3456 7890</p>
            <p className="text-blue-100">Hỗ trợ khẩn cấp</p>
          </div>

          <div className="bg-green-600 text-white p-6 rounded-xl text-center">
            <div className="text-4xl mb-4">Chat</div>
            <h3 className="text-xl font-semibold mb-2">Chat trực tuyến</h3>
            <p className="text-2xl font-bold mb-2">Live Chat</p>
            <p className="text-green-100">Phản hồi trong 5 phút</p>
          </div>

          <div className="bg-purple-600 text-white p-6 rounded-xl text-center">
            <div className="text-4xl mb-4">Email</div>
            <h3 className="text-xl font-semibold mb-2">Email</h3>
            <p className="text-lg mb-2">support@gotogether.vn</p>
            <p className="text-purple-100">Phản hồi trong 24h</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - FAQ & Categories */}
          <div>
            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Câu hỏi thường gặp
              </h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setActiveFAQ(activeFAQ === faq.id ? null : faq.id)
                      }
                      className="w-full px-4 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-800">
                        {faq.question}
                      </span>
                      <span className="text-gray-500">
                        {activeFAQ === faq.id ? "▲" : "▼"}
                      </span>
                    </button>
                    {activeFAQ === faq.id && (
                      <div className="px-4 pb-4 pt-2 bg-gray-50">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Support Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Danh mục hỗ trợ
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {supportCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setFormData({ ...formData, category: cat.id })
                    }
                    className={`p-4 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      formData.category === cat.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {cat.id === "account" && (
                      <span className="text-lg mb-2">Tài khoản</span>
                    )}
                    {cat.id === "booking" && (
                      <span className="text-lg mb-2">Vé</span>
                    )}
                    {cat.id === "payment" && (
                      <span className="text-lg mb-2">Tiền</span>
                    )}
                    {cat.id === "itinerary" && (
                      <span className="text-lg mb-2">Bản đồ</span>
                    )}
                    {cat.id === "blog" && (
                      <span className="text-lg mb-2">Bài viết</span>
                    )}
                    {cat.id === "technical" && (
                      <span className="text-lg mb-2">Công cụ</span>
                    )}
                    {cat.id === "general" && (
                      <span className="text-lg mb-2">Hỏi đáp</span>
                    )}
                    <span className="font-medium text-gray-800">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Gửi yêu cầu hỗ trợ
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {supportCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Vấn đề bạn gặp phải"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Vui lòng mô tả chi tiết vấn đề..."
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đính kèm (tùy chọn)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <div className="text-3xl mb-2">📎</div>
                  <p className="text-gray-600 mb-2">
                    Kéo thả file hoặc click để chọn
                  </p>
                  <p className="text-sm text-gray-500">
                    Hỗ trợ: JPG, PNG, PDF (tối đa 10MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    multiple
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gửi yêu cầu hỗ trợ
                </button>
                <p className="text-center text-gray-500 mt-4">
                  Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc
                </p>
              </div>
            </form>

            {/* Quick Tips */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Mẹo nhanh
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Kiểm tra FAQ trước khi gửi yêu cầu</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Cung cấp ảnh chụp màn hình nếu có</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Ghi rõ mã đơn hàng (nếu liên quan)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Thời gian làm việc
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-4">
              <div className="text-3xl mb-4"></div>
              <h4 className="font-semibold text-gray-800 mb-2">Ngày thường</h4>
              <p className="text-gray-600">Thứ 2 - Thứ 6</p>
              <p className="text-lg font-medium text-gray-800">8:00 - 17:00</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-4"></div>
              <h4 className="font-semibold text-gray-800 mb-2">Cuối tuần</h4>
              <p className="text-gray-600">Thứ 7 - Chủ nhật</p>
              <p className="text-lg font-medium text-gray-800">9:00 - 16:00</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-4"></div>
              <h4 className="font-semibold text-gray-800 mb-2">Hỗ trợ khẩn</h4>
              <p className="text-gray-600">24/7 qua hotline</p>
              <p className="text-lg font-medium text-gray-800">028 3456 7890</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
