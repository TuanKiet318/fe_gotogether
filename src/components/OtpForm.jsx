import { useState } from "react";
import { apiVerifyOtp } from "../service/register.service";
import { toast } from "react-toastify";

export default function OtpForm({ user, onSuccess }) {
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const res = await apiVerifyOtp(user.id, otp);
      if (res.data === true) {
        toast.success("✅ Xác thực thành công, bạn có thể đăng nhập.");
        onSuccess();
      } else {
        toast.error("❌ OTP không hợp lệ hoặc đã hết hạn.");
      }
    } catch (err) {
      toast.error("Lỗi khi xác thực OTP.");
    }
  };

  return (
    <div className="space-y-4">
      <p>Nhập mã OTP đã gửi tới email {user.email}</p>
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border rounded px-3 py-2 w-full"
        placeholder="Nhập OTP"
      />
      <button
        onClick={handleVerify}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Xác nhận
      </button>
    </div>
  );
}
