import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../service/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: "onTouched" });

  const onSubmit = handleSubmit(async (payload) => {
    const toastId = toast.loading("Đang đăng nhập...");
    try {
      let deviceId = localStorage.getItem("deviceId");
      if (!deviceId) { deviceId = crypto.randomUUID(); localStorage.setItem("deviceId", deviceId); }
      const res = await API.post("/auth/login", payload, { headers: { "X-Device-Id": deviceId }, withCredentials: true });
      const accessToken = res?.data?.data?.accessToken;
      if (!accessToken) throw new Error("Không nhận được access token từ máy chủ.");
      localStorage.setItem("token", accessToken);
      toast.update(toastId, { render: "Đăng nhập thành công!", type: "success", isLoading: false, autoClose: 1500 });
      navigate("/dashboard");
    } catch (err) {
      const message = err?.response?.data?.message || (err?.message === "Network Error" ? "Không thể kết nối đến máy chủ." : err?.message || "Đăng nhập thất bại.");
      toast.update(toastId, { render: message, type: "error", isLoading: false, autoClose: 2200 });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-100 shadow-sm rounded-xl p-6">
        <h1 className="text-xl font-semibold text-gray-900 text-center">Đăng nhập</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition ${errors.email ? "border-rose-300" : "border-gray-200 hover:border-gray-300"}`}
                {...register("email", { required: "Email là bắt buộc", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" } })}
              />
            </div>
            {errors.email && <p id="email-error" className="text-rose-600 text-sm mt-1.5">{errors.email?.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition ${errors.password ? "border-rose-300" : "border-gray-200 hover:border-gray-300"}`}
                {...register("password", { required: "Mật khẩu là bắt buộc", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-50" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.password && <p id="password-error" className="text-rose-600 text-sm mt-1.5">{errors.password?.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full disabled:opacity-70 bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition focus:ring-4 focus:ring-indigo-200">{isSubmitting ? "Đang xử lý..." : "Đăng nhập"}</button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-4">
          Chưa có tài khoản? <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
}
