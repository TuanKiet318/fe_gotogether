import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import {
  apiRegister,
  apiSendOtp,
  APIVerifyOtp,
} from "../service/api.auth.service";

export default function RegisterForm({ switchToLogin }) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState("register"); // "register" | "otp"
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const passwordValue = watch("password");

  // 👉 Step 1: Đăng ký
  const onRegister = handleSubmit(async (payload) => {
    const toastId = toast.loading("Đang đăng ký...");
    try {
      const res = await apiRegister(payload);
      console.log("Register response:", res.data);

      if (res?.status === 200 || res?.status === 201) {
        const { id, email } = res.data; // giả sử backend trả về userId + email
        setUserId(id);
        setEmail(email);

        // gửi OTP sau khi đăng ký
        await apiSendOtp(id, email);

        toast.update(toastId, {
          render: "🎉 Đăng ký thành công! Vui lòng nhập OTP từ email.",
          type: "success",
          isLoading: false,
          autoClose: 2500,
        });
        setStep("otp");
      } else {
        throw new Error(res?.data?.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.update(toastId, {
        render:
          err?.response?.data?.message || err?.message || "Đăng ký thất bại.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  });

  // 👉 Step 2: Xác thực OTP
  const onVerifyOtp = handleSubmit(async ({ otp }) => {
    const toastId = toast.loading("Đang xác thực OTP...");
    try {
      const res = await APIVerifyOtp(userId, otp);
      console.log("Verify OTP response:", res.data);

      if (res?.status === 200 && res?.data === true) {
        toast.update(toastId, {
          render: "✅ OTP hợp lệ! Bạn có thể đăng nhập.",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        reset();
        switchToLogin();
      } else {
        throw new Error(res?.data?.message || "OTP không hợp lệ!");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      toast.update(toastId, {
        render:
          err?.response?.data?.message ||
          err?.message ||
          "Xác thực OTP thất bại.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  });

  return (
    <form
      onSubmit={step === "register" ? onRegister : onVerifyOtp}
      className="space-y-4"
    >
      {step === "register" && (
        <>
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ tên
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className={`w-full rounded-xl border pl-10 pr-3 py-3 ${
                  errors.name ? "border-rose-400" : "border-gray-200"
                }`}
                {...register("name", { required: "Tên là bắt buộc" })}
              />
            </div>
            {errors.name && (
              <p className="text-rose-500 text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="name@example.com"
                className={`w-full rounded-xl border pl-10 pr-3 py-3 ${
                  errors.email ? "border-rose-400" : "border-gray-200"
                }`}
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email không hợp lệ",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-rose-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full rounded-xl border pl-10 pr-10 py-3 ${
                  errors.password ? "border-rose-400" : "border-gray-200"
                }`}
                {...register("password", {
                  required: "Mật khẩu là bắt buộc",
                  minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-rose-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full rounded-xl border pl-10 pr-10 py-3 ${
                  errors.confirmPassword ? "border-rose-400" : "border-gray-200"
                }`}
                {...register("confirmPassword", {
                  required: "Xác nhận mật khẩu là bắt buộc",
                  validate: (v) => v === passwordValue || "Mật khẩu không khớp",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-rose-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </>
      )}

      {step === "otp" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã OTP đã gửi tới email:{" "}
            <span className="font-semibold">{email}</span>
          </label>
          <input
            type="text"
            placeholder="Nhập OTP"
            className={`w-full rounded-xl border px-3 py-3 ${
              errors.otp ? "border-rose-400" : "border-gray-200"
            }`}
            {...register("otp", { required: "OTP là bắt buộc" })}
          />
          {errors.otp && (
            <p className="text-rose-500 text-sm mt-1">{errors.otp.message}</p>
          )}
        </div>
      )}

      {/* Nút submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium"
      >
        {isSubmitting
          ? "Đang xử lý..."
          : step === "register"
          ? "Đăng ký"
          : "Xác nhận OTP"}
      </button>

      {/* Link quay lại login */}
      {step === "register" && (
        <p className="text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <button
            type="button"
            className="text-indigo-600 hover:underline font-medium"
            onClick={switchToLogin}
          >
            Đăng nhập
          </button>
        </p>
      )}
    </form>
  );
}
