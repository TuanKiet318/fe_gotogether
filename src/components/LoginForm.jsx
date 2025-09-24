import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"; // ✅ dùng sonner
import { useNavigate } from "react-router-dom";
import API from "../service/api";
import { AuthContext } from "../context/AuthContext";

export default function LoginForm({ switchToRegister, onClose }) {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const onSubmit = handleSubmit(async (payload) => {
    try {
      let deviceId = localStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("deviceId", deviceId);
      }

      // ✅ toast.promise sẽ tự động hiển thị loading / success / error
      await toast.promise(
        API.post("/auth/login", payload, {
          headers: { "X-Device-Id": deviceId },
          withCredentials: true,
        }),
        {
          loading: "Đang đăng nhập...",
          success: (res) => {
            const accessToken = res?.data?.data?.accessToken;
            if (!accessToken) throw new Error("Không nhận được access token.");
            login(accessToken, deviceId);
            onClose(); // đóng modal sau khi login thành công
            return "Đăng nhập thành công!";
          },
          error: (err) =>
            err?.response?.data?.message ||
            (err?.message === "Network Error"
              ? "Không thể kết nối đến server."
              : err?.message || "Đăng nhập thất bại."),
        }
      );
    } catch (err) {
      // ❌ lỗi ngoài (không nằm trong API call)
      toast.error("Đã xảy ra lỗi không mong muốn.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            placeholder="name@example.com"
            className={`w-full rounded-xl border pl-10 pr-3 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`w-full rounded-xl border pl-10 pr-10 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.password ? "border-rose-400" : "border-gray-200"
            }`}
            {...register("password", {
              required: "Mật khẩu là bắt buộc",
              minLength: {
                value: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự",
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-rose-500 text-sm mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium transition-colors"
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
      </button>

      <div className="text-center">
        <button
          type="button"
          className="text-sm text-indigo-600 hover:underline"
        >
          Quên mật khẩu?
        </button>
      </div>

      <p className="text-center text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          className="text-indigo-600 hover:underline font-medium"
          onClick={switchToRegister}
        >
          Đăng ký ngay
        </button>
      </p>
    </form>
  );
}
