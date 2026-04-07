// pages/PrivacyPolicy.js
import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-gray-600">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>
          <div className="mt-4">
            <Link
              to="/terms"
              className="text-blue-600 hover:text-blue-800 mr-4"
            >
              Điều khoản dịch vụ
            </Link>
            <Link to="/support" className="text-blue-600 hover:text-blue-800">
              Hỗ trợ
            </Link>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mb-8 p-6 bg-green-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Tóm tắt quan trọng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-2"></div>
              <p className="font-medium">Dữ liệu an toàn</p>
              <p className="text-sm text-gray-600 mt-1">Mã hóa SSL/TLS</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-2"></div>
              <p className="font-medium">Kiểm soát của bạn</p>
              <p className="text-sm text-gray-600 mt-1">
                Xóa dữ liệu bất kỳ lúc nào
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-2"></div>
              <p className="font-medium">Không bán dữ liệu</p>
              <p className="text-sm text-gray-600 mt-1">
                Không chia sẻ với bên thứ 3
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Data Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Dữ liệu chúng tôi thu thập
            </h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  1.1. Thông tin bạn cung cấp
                </h3>
                <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-2">
                  <li>Họ tên, email, số điện thoại</li>
                  <li>Ảnh đại diện, ngày sinh</li>
                  <li>Nội dung blog, đánh giá</li>
                  <li>Hành trình du lịch</li>
                  <li>Thông tin thanh toán (được xử lý an toàn)</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  1.2. Thông tin tự động
                </h3>
                <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-2">
                  <li>Địa chỉ IP, loại thiết bị</li>
                  <li>Trình duyệt, hệ điều hành</li>
                  <li>Hoạt động trên website (thời gian, lượt click)</li>
                  <li>Vị trí (nếu được phép)</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  1.3. Cookies
                </h3>
                <p className="text-gray-700 mt-2">
                  Chúng tôi sử dụng cookies để:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-2">
                  <li>Ghi nhớ đăng nhập</li>
                  <li>Lưu tùy chọn ngôn ngữ/tiền tệ</li>
                  <li>Phân tích hành vi người dùng</li>
                  <li>Cải thiện trải nghiệm</li>
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                  Bạn có thể tắt cookies trong trình duyệt, nhưng một số tính
                  năng có thể không hoạt động.
                </p>
              </div>
            </div>
          </section>

          {/* Data Usage */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. Mục đích sử dụng dữ liệu
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-50 rounded-lg">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="py-3 px-4 text-left">Mục đích</th>
                    <th className="py-3 px-4 text-left">Dữ liệu sử dụng</th>
                    <th className="py-3 px-4 text-left">Cơ sở pháp lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4">Cung cấp dịch vụ</td>
                    <td className="py-3 px-4">
                      Thông tin tài khoản, hành trình
                    </td>
                    <td className="py-3 px-4">Hợp đồng</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4">Cải thiện trải nghiệm</td>
                    <td className="py-3 px-4">Hoạt động trên web, cookies</td>
                    <td className="py-3 px-4">Lợi ích hợp pháp</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Hỗ trợ khách hàng</td>
                    <td className="py-3 px-4">Email, số điện thoại</td>
                    <td className="py-3 px-4">Hợp đồng</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4">Phân tích & nghiên cứu</td>
                    <td className="py-3 px-4">Dữ liệu ẩn danh</td>
                    <td className="py-3 px-4">Lợi ích hợp pháp</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Chia sẻ dữ liệu
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="font-semibold mb-2">
                  Chúng tôi CHIA SẺ dữ liệu với:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Nhà cung cấp dịch vụ (khi bạn đặt tour)</li>
                  <li>Đối tác thanh toán (Stripe, VNPay)</li>
                  <li>Cơ quan pháp luật (khi được yêu cầu)</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <p className="font-semibold mb-2">
                  Chúng tôi KHÔNG bán hoặc cho thuê dữ liệu cho:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Công ty quảng cáo</li>
                  <li>Bên thứ ba không liên quan</li>
                  <li>Mục đích tiếp thị không được cho phép</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Bảo mật dữ liệu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Biện pháp bảo vệ</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Mã hóa SSL/TLS 256-bit</li>
                  <li>• Tường lửa và hệ thống phát hiện xâm nhập</li>
                  <li>• Kiểm tra bảo mật định kỳ</li>
                  <li>• Đào tạo nhân viên về bảo mật</li>
                  <li>• Sao lưu dữ liệu tự động</li>
                </ul>
              </div>

              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Quyền của bạn</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Quyền truy cập dữ liệu</li>
                  <li>• Quyền chỉnh sửa, cập nhật</li>
                  <li>• Quyền xóa dữ liệu</li>
                  <li>• Quyền rút lại đồng ý</li>
                  <li>• Quyền khiếu nại</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Báo cáo vi phạm</h3>
              <p className="text-gray-700">
                Nếu phát hiện vi phạm bảo mật, vui lòng báo ngay cho chúng tôi
                qua
                <a
                  href="mailto:security@gotogether.vn"
                  className="text-blue-600 hover:underline ml-1"
                >
                  security@gotogether.vn
                </a>
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Lưu trữ dữ liệu
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left border-b">
                        Loại dữ liệu
                      </th>
                      <th className="py-3 px-4 text-left border-b">
                        Thời gian lưu
                      </th>
                      <th className="py-3 px-4 text-left border-b">Lưu ý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 px-4">Thông tin tài khoản</td>
                      <td className="py-3 px-4">Đến khi xóa tài khoản</td>
                      <td className="py-3 px-4">
                        Có thể lưu 6 tháng sau khi xóa
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Hoạt động du lịch</td>
                      <td className="py-3 px-4">5 năm</td>
                      <td className="py-3 px-4">Phục vụ hồ sơ pháp lý</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Log hệ thống</td>
                      <td className="py-3 px-4">90 ngày</td>
                      <td className="py-3 px-4">Tự động xóa</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Thanh toán</td>
                      <td className="py-3 px-4">7 năm</td>
                      <td className="py-3 px-4">Theo luật thuế</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Bảo vệ trẻ em
            </h2>
            <div className="text-gray-700 p-6 bg-pink-50 rounded-lg">
              <p>GoTogether không dành cho trẻ em dưới 16 tuổi.</p>
              <p className="mt-2">
                Nếu chúng tôi phát hiện thu thập dữ liệu trẻ em vô tình, chúng
                tôi sẽ xóa ngay lập tức.
              </p>
            </div>
          </section>

          {/* International Transfer */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              7. Chuyển dữ liệu quốc tế
            </h2>
            <div className="text-gray-700">
              <p>
                Dữ liệu được lưu trữ tại Việt Nam trên các máy chủ đạt chuẩn bảo
                mật.
              </p>
              <p className="mt-2">
                Nếu có chuyển dữ liệu ra nước ngoài, chúng tôi đảm bảo tuân thủ
                các tiêu chuẩn bảo mật quốc tế.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              8. Thay đổi chính sách
            </h2>
            <div className="text-gray-700 p-6 bg-blue-50 rounded-lg">
              <p>
                Chúng tôi sẽ thông báo thay đổi chính sách 30 ngày trước khi có
                hiệu lực qua:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Email đăng ký</li>
                <li>Thông báo trên website</li>
                <li>Popup khi đăng nhập</li>
              </ul>
            </div>
          </section>

          {/* Contact DPO */}
          <section className="mb-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              9. Liên hệ bộ phận bảo mật
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                <strong>Bộ phận Bảo mật & Quyền riêng tư</strong>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:privacy@gotogether.vn"
                  className="text-blue-600 hover:underline"
                >
                  privacy@gotogether.vn
                </a>
              </p>
              <p>
                Hotline:{" "}
                <a
                  href="tel:+842834567891"
                  className="text-blue-600 hover:underline"
                >
                  028 3456 7891
                </a>
              </p>
              <p>Địa chỉ: Tầng 5, 123 Nguyễn Văn Linh, Quận 1, TP.HCM</p>
              <p className="mt-4">Thời gian phản hồi: 3-5 ngày làm việc</p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 p-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Phiên bản 1.0 • Áp dụng từ ngày{" "}
              {new Date().toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
