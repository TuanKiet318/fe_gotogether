import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../service/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const onSubmit = handleSubmit(async (payload) => {
    const toastId = toast.loading("Đang đăng nhập...");
    try {
      let deviceId = localStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("deviceId", deviceId);
      }
      const res = await API.post("/auth/login", payload, {
        headers: { "X-Device-Id": deviceId },
        withCredentials: true,
      });
      const accessToken = res?.data?.data?.accessToken;
      if (!accessToken) throw new Error("Không nhận được access token từ máy chủ.");
      localStorage.setItem("token", accessToken);
      toast.update(toastId, {
        render: "Đăng nhập thành công!",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (err?.message === "Network Error"
          ? "Không thể kết nối đến máy chủ."
          : err?.message || "Đăng nhập thất bại.");
      toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 2200 });
    }
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-indigo-100 to-white" />
      {/* Soft blobs */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />

      {/* Header mini brand */}
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
            {/* Card header */}
            <div className="px-6 pt-8 pb-4 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Chào mừng trở lại 👋
              </h1>
            </div>

            <div className="px-6 pb-6">
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
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
                  {errors.email && (
                    <p id="email-error" className="mt-1.5 text-sm text-rose-600">
                      {errors.email?.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Mật khẩu
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      className={`w-full rounded-xl border bg-white/80 pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300 ${errors.password ? "border-rose-300" : "border-slate-200 hover:border-slate-300"
                        }`}
                      {...register("password", {
                        required: "Mật khẩu là bắt buộc",
                        minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-1.5 text-sm text-rose-600">
                      {errors.password?.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 py-3 text-white font-semibold shadow-md transition hover:shadow-lg active:scale-[0.99] disabled:opacity-70 focus:ring-4 focus:ring-indigo-200"
                >
                  {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs uppercase tracking-wider text-slate-500">hoặc</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Sign up link */}
              <p className="text-center text-sm text-slate-600">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>

          {/* Tiny footer */}
          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} GoTogether. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
