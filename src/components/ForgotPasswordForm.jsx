import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { apiForgotPassword } from "../service/api.auth.service";

export default function ForgotPasswordForm({ onClose }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onTouched" });

    const onSubmit = handleSubmit(async (data) => {
        setIsSubmitting(true);
        try {
            await toast.promise(apiForgotPassword(data.email), {
                loading: "Đang gửi mật khẩu mới...",
                success: () => {
                    onClose?.();
                    return "Mật khẩu mới đã được gửi vào email của bạn!";
                },
                error: (err) =>
                    err?.response?.data?.message ||
                    (err?.message === "Network Error"
                        ? "Không thể kết nối đến server."
                        : err?.message || "Có lỗi xảy ra."),
            });
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="email"
                        placeholder="name@example.com"
                        className={`w-full rounded-xl border pl-10 pr-3 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.email ? "border-rose-400" : "border-gray-200"
                            }`}
                        {...register("email", {
                            required: "Email là bắt buộc",
                            pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" },
                        })}
                    />
                </div>
                {errors.email && <p className="text-rose-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium transition-colors"
            >
                {isSubmitting ? "Đang xử lý..." : "Gửi mật khẩu mới"}
            </button>
        </form>
    );
}
