import React from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../service/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const onSubmit = handleSubmit(async (payload) => {
    const toastId = toast.loading("Đang đăng ký...");
    try {
      const res = await API.post("/auth/register", payload, {
        withCredentials: true,
      });

      if (!res?.data?.success)
        throw new Error(res?.data?.message || "Đăng ký thất bại!");

      toast.update(toastId, {
        render: "🎉 Đăng ký thành công! Vui lòng đăng nhập.",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      // ✅ Reset form
      reset();

      // ✅ Chuyển hướng sau 2 giây
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Đăng ký thất bại.";
      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 2200,
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-100 shadow-sm rounded-xl p-6">
        <h1 className="text-xl font-semibold text-gray-900 text-center">
          Đăng ký
        </h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {/* Tên */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Họ và tên
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                className={`w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition ${
                  errors.name
                    ? "border-rose-300"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                {...register("name", { required: "Tên là bắt buộc" })}
              />
            </div>
            {errors.name && (
              <p className="text-rose-600 text-sm mt-1.5">
                {errors.name?.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                className={`w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition ${
                  errors.email
                    ? "border-rose-300"
                    : "border-gray-200 hover:border-gray-300"
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
              <p className="text-rose-600 text-sm mt-1.5">
                {errors.email?.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition ${
                  errors.password
                    ? "border-rose-300"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                {...register("password", {
                  required: "Mật khẩu là bắt buộc",
                  minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
                })}
              />
            </div>
            {errors.password && (
              <p className="text-rose-600 text-sm mt-1.5">
                {errors.password?.message}
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition ${
                  errors.confirmPassword
                    ? "border-rose-300"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                {...register("confirmPassword", {
                  required: "Xác nhận mật khẩu là bắt buộc",
                  validate: (value, formValues) =>
                    value === formValues.password || "Mật khẩu không khớp",
                })}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-rose-600 text-sm mt-1.5">
                {errors.confirmPassword?.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full disabled:opacity-70 bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition focus:ring-4 focus:ring-indigo-200"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-4">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
