import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"; // 🔄 dùng sonner
import { apiRegister, apiSendOtp } from "../service/api.auth.service";

export default function RegisterForm({ switchToLogin, onRegisterSuccess }) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const passwordValue = watch("password");

  const onRegister = handleSubmit(async ({ name, email, password }) => {
    const toastId = toast.loading("Đang đăng ký...");
    try {
      const payload = { name, email, password };
      const res = await apiRegister(payload);

      if (res?.status === 200 || res?.status === 201) {
        // gọi API gửi OTP
        await apiSendOtp(email);

        toast.success("🎉 Đăng ký thành công! Vui lòng nhập OTP từ email.", {
          id: toastId,
          duration: 2500,
        });

        // ✅ gọi callback để modal cha mở OtpForm
        const user = res.data?.data;
        onRegisterSuccess({ id: user.id, email: user.email || email });
      } else {
        throw new Error(res?.data?.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Đăng ký thất bại.",
        { id: toastId, duration: 2500 }
      );
    }
  });

  return (
    <form onSubmit={onRegister} className="space-y-4">
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
          <p className="text-rose-500 text-sm mt-1">{errors.name.message}</p>
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
          <p className="text-rose-500 text-sm mt-1">{errors.email.message}</p>
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

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium"
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
      </button>

      {/* Link quay lại login */}
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
    </form>
  );
}
