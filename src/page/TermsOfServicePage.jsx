// pages/TermsOfService.js
import React from "react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Điều Khoản Dịch Vụ
          </h1>
          <p className="text-gray-600">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>
          <div className="mt-4">
            <Link
              to="/privacy"
              className="text-blue-600 hover:text-blue-800 mr-4"
            >
              Chính sách bảo mật
            </Link>
            <Link to="/support" className="text-blue-600 hover:text-blue-800">
              Hỗ trợ
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Giới thiệu
            </h2>
            <p className="text-gray-700 mb-4">
              Chào mừng bạn đến với <strong>GoTogether</strong> - nền tảng kết
              nối du lịch tại Việt Nam. Bằng cách truy cập hoặc sử dụng dịch vụ
              của chúng tôi, bạn đồng ý tuân thủ các điều khoản này.
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. Định nghĩa
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>GoTogether</strong>: Nền tảng du lịch trực tuyến tại địa
                chỉ gotogether.vn
              </li>
              <li>
                <strong>Người dùng</strong>: Cá nhân/tổ chức sử dụng dịch vụ của
                chúng tôi
              </li>
              <li>
                <strong>Hành trình</strong>: Kế hoạch du lịch được tạo trên nền
                tảng
              </li>
              <li>
                <strong>Blog du lịch</strong>: Nội dung chia sẻ trải nghiệm của
                người dùng
              </li>
              <li>
                <strong>Đặt chỗ</strong>: Giao dịch đặt dịch vụ du lịch thông
                qua nền tảng
              </li>
            </ul>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Đăng ký tài khoản
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>Khi tạo tài khoản, bạn cam kết:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Đủ 16 tuổi trở lên</li>
                <li>Cung cấp thông tin chính xác, đầy đủ</li>
                <li>Bảo mật thông tin đăng nhập</li>
                <li>Chịu trách nhiệm về mọi hoạt động từ tài khoản của bạn</li>
              </ul>
              <p className="mt-4">
                Chúng tôi có quyền đình chỉ hoặc xóa tài khoản vi phạm điều
                khoản mà không cần báo trước.
              </p>
            </div>
          </section>

          {/* User Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Nội dung người dùng
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Bạn giữ bản quyền với nội dung đăng tải, nhưng cấp cho
                GoTogether quyền sử dụng:
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="font-semibold text-gray-800">Quy tắc nội dung:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Không đăng nội dung vi phạm pháp luật</li>
                  <li>Không chia sẻ thông tin sai lệch</li>
                  <li>Không đăng nội dung phân biệt đối xử, khiêu dâm</li>
                  <li>Tôn trọng quyền riêng tư của người khác</li>
                  <li>Không quảng cáo, spam</li>
                </ul>
              </div>

              <p>
                Chúng tôi có quyền kiểm duyệt, chỉnh sửa hoặc xóa nội dung vi
                phạm.
              </p>
            </div>
          </section>

          {/* Booking and Payments */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Đặt chỗ & Thanh toán
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>5.1. Quy trình đặt chỗ:</strong>
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Chọn dịch vụ du lịch</li>
                <li>Xác nhận thông tin đặt chỗ</li>
                <li>Thanh toán qua cổng an toàn</li>
                <li>Nhận xác nhận qua email</li>
              </ol>

              <p>
                <strong>5.2. Chính sách hủy:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hủy trong 24h: Hoàn 100% (nếu chưa xác nhận)</li>
                <li>Hủy sau 24h: Áp dụng phí hủy theo nhà cung cấp</li>
                <li>Hủy trước 7 ngày: Hoàn 70%</li>
                <li>Hủy trong 48h: Không hoàn tiền</li>
              </ul>

              <p>
                <strong>5.3. Phương thức thanh toán:</strong>
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  VNPay
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  Momo
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                  ZaloPay
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                  Thẻ ngân hàng
                </span>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Sở hữu trí tuệ
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Tất cả nội dung trên GoTogether (logo, giao diện, code) thuộc sở
                hữu của chúng tôi.
              </p>
              <p>Bạn không được phép:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sao chép, phân phối trái phép</li>
                <li>Reverse engineer hệ thống</li>
                <li>Sử dụng cho mục đích thương mại không được cho phép</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              7. Giới hạn trách nhiệm
            </h2>
            <div className="text-gray-700 space-y-3">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="font-semibold">
                  Chúng tôi không chịu trách nhiệm cho:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Sự cố kỹ thuật ngoài tầm kiểm soát</li>
                  <li>Thông tin sai lệch từ nhà cung cấp thứ ba</li>
                  <li>Hành vi của người dùng khác</li>
                  <li>Thiệt hại do lỗi người dùng</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              8. Chấm dứt dịch vụ
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>Chúng tôi có quyền chấm dứt tài khoản nếu:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vi phạm điều khoản dịch vụ</li>
                <li>Hoạt động gian lận</li>
                <li>Không hoạt động trong 12 tháng</li>
                <li>Yêu cầu của cơ quan pháp luật</li>
              </ul>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              9. Thay đổi điều khoản
            </h2>
            <div className="text-gray-700">
              <p>
                Chúng tôi có quyền cập nhật điều khoản này. Thay đổi sẽ có hiệu
                lực sau 30 ngày kể từ khi đăng tải. Bạn có trách nhiệm kiểm tra
                thường xuyên.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              10. Liên hệ
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                <strong>Công ty TNHH GoTogether</strong>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@gotogether.vn"
                  className="text-blue-600 hover:underline"
                >
                  support@gotogether.vn
                </a>
              </p>
              <p>
                Hotline:{" "}
                <a
                  href="tel:+842834567890"
                  className="text-blue-600 hover:underline"
                >
                  028 3456 7890
                </a>
              </p>
              <p>Địa chỉ: Tầng 5, 123 Nguyễn Văn Linh, Quận 1, TP.HCM</p>
              <p>Giờ làm việc: 8:00 - 17:00 (Thứ 2 - Thứ 6)</p>
            </div>
          </section>

          {/* Acceptance */}
          <div className="mt-12 p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-gray-700">
                Bằng cách sử dụng GoTogether, bạn xác nhận đã đọc, hiểu và đồng
                ý với các điều khoản trên.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Lên đầu trang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
