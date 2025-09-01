import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, Eye, EyeOff, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../service/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const passwordValue = watch("password");

  const onSubmit = handleSubmit(async (payload) => {
    const toastId = toast.loading("Đang đăng ký...");
    try {
      const res = await API.post("/auth/register", payload, { withCredentials: true });

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Đăng ký thất bại!");
      }

      // ✅ dùng toast.update để cập nhật toast đang loading
      toast.update(toastId, {
        render: "🎉 Đăng ký thành công! Vui lòng đăng nhập.",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      reset();
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Đăng ký thất bại.";
      toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 2200 });
    }
  });

  // Ước lượng độ “mạnh” password đơn giản
  const passScore =
    (/[a-z]/.test(passwordValue || "") ? 1 : 0) +
    (/[A-Z]/.test(passwordValue || "") ? 1 : 0) +
    (/\d/.test(passwordValue || "") ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(passwordValue || "") ? 1 : 0) +
    ((passwordValue || "").length >= 8 ? 1 : 0);

  const passBarClass = [
    "bg-rose-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-lime-500",
    "bg-green-600",
  ][Math.min(passScore - 1, 4)] || "bg-rose-500";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-indigo-100 to-white" />
      {/* Soft blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-20 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />

      {/* Brand */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-800">GoTogether</span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_40px_-15px_rgba(30,41,59,0.25)] backdrop-blur-md">
            <div className="px-6 pt-8 pb-4 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tạo tài khoản</h1>
              <p className="mt-2 text-sm text-slate-600">
                Bắt đầu hành trình khám phá và lên kế hoạch dễ dàng ✨
              </p>
            </div>

            <div className="px-6 pb-6">
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                {/* Họ và tên */}
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className={`w-full rounded-xl border bg-white/80 pl-10 pr-3 py-3 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300 ${errors.name ? "border-rose-300" : "border-slate-200 hover:border-slate-300"
                        }`}
                      {...register("name", { required: "Tên là bắt buộc" })}
                    />
                  </div>
                  {errors.name && <p className="mt-1.5 text-sm text-rose-600">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      className={`w-full rounded-xl border bg-white/80 pl-10 pr-3 py-3 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300 ${errors.email ? "border-rose-300" : "border-slate-200 hover:border-slate-300"
                        }`}
                      {...register("email", {
                        required: "Email là bắt buộc",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Email không hợp lệ",
                        },
                      })}
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-sm text-rose-600">{errors.email.message}</p>}
                </div>

                {/* Mật khẩu */}
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="password"
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`w-full rounded-xl border bg-white/80 pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300 ${errors.password ? "border-rose-300" : "border-slate-200 hover:border-slate-300"
                        }`}
                      {...register("password", {
                        required: "Mật khẩu là bắt buộc",
                        minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                      aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-sm text-rose-600">{errors.password.message}</p>
                  )}

                  {/* Strength bar */}
                  {passwordValue && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full ${passBarClass} transition-all`}
                          style={{ width: `${(passScore / 5) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Độ mạnh: {["Rất yếu", "Yếu", "Trung bình", "Khá", "Mạnh"][Math.max(0, passScore - 1)]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`w-full rounded-xl border bg-white/80 pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300 ${errors.confirmPassword ? "border-rose-300" : "border-slate-200 hover:border-slate-300"
                        }`}
                      {...register("confirmPassword", {
                        required: "Xác nhận mật khẩu là bắt buộc",
                        validate: (value) => value === passwordValue || "Mật khẩu không khớp",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                      aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-sm text-rose-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 py-3 text-white font-semibold shadow-md transition hover:shadow-lg active:scale-[0.99] disabled:opacity-70 focus:ring-4 focus:ring-indigo-200"
                >
                  {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs uppercase tracking-wider text-slate-500">hoặc</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="text-center text-sm text-slate-600">
                Đã có tài khoản?{" "}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} GoTogether. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
