import { useState, useEffect } from "react";
import { APIVerifyOtp, apiSendOtp } from "../service/api.auth.service";
import { toast } from "sonner";

export default function OtpForm({ user, onSuccess }) {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0); // đếm ngược (giây)

  // Timer đếm ngược
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    try {
      const res = await APIVerifyOtp(user.id, otp);
      if (res.data?.data === true) {
        toast.success("Xác thực thành công, bạn có thể đăng nhập.");
        onSuccess();
      } else {
        toast.error("OTP không hợp lệ hoặc đã hết hạn.");
      }
    } catch (err) {
      toast.error("Lỗi khi xác thực OTP.");
    }
  };

  const handleResend = async () => {
    try {
      setCooldown(60);
      toast.info("📩 OTP mới đã được gửi tới email của bạn.");
      await apiSendOtp(user.email);
    } catch (err) {
      toast.error("Không thể gửi lại OTP, vui lòng thử lại sau.");
    }
  };

  // chỉ cho nhập 6 số
  const handleChangeOtp = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // bỏ ký tự không phải số
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-700 text-center">
        Nhập mã OTP đã gửi tới email <b>{user.email}</b>
      </p>

      <div className="flex gap-2">
        <input
          value={otp}
          onChange={handleChangeOtp}
          className="border rounded-xl px-4 py-3 flex-1 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="••••••"
          inputMode="numeric"
          maxLength={6}
        />

        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition ${cooldown > 0
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
        >
          {cooldown > 0 ? `${cooldown}s` : "Gửi lại"}
        </button>
      </div>

      <button
        onClick={handleVerify}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition"
      >
        Xác nhận
      </button>
    </div>
  );
}
