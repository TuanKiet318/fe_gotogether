import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GetInviteByToken, HandleInvite } from "../service/api.admin.service";
import Header from "../components/Header";
import Footer from "../components/Footer";
export default function AcceptInvitePage() {
    const [invite, setInvite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionStatus, setActionStatus] = useState(null);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setError("Không có token hợp lệ.");
            setLoading(false);
            return;
        }

        // Kiểm tra token trong localStorage
        const userToken = localStorage.getItem("token");
        if (!userToken) {
            navigate(`/login?redirect=/invite?token=${token}`);
            return;
        }

        // Lấy thông tin invite từ backend
        const fetchInvite = async () => {
            try {
                const res = await GetInviteByToken(token);
                setInvite(res);
            } catch (err) {
                setError(err.response?.data?.message || "Lời mời không tồn tại hoặc đã hết hạn.");
            } finally {
                setLoading(false);
            }
        };

        fetchInvite();
    }, [token, navigate]);

    const handleAction = async (status) => {
        const userToken = localStorage.getItem("token");
        if (!userToken) {
            navigate(`/login?redirect=/invite?token=${token}`);
            return;
        }

        try {
            await HandleInvite(token, status);
            setActionStatus(
                status === "ACCEPTED"
                    ? "Bạn đã tham gia lịch trình thành công!"
                    : "Bạn đã từ chối lời mời."
            );

            if (status === "ACCEPTED" && invite?.itineraryId) {
                setTimeout(() => navigate(`/trips/${invite.itineraryId}`), 2000);
            }
        } catch (err) {
            const code = err.response?.status;
            if (code === 401) {
                // Chưa login
                navigate(`/login?redirect=/invite?token=${token}`);
            } else if (code === 403) {
                navigate(`/login?redirect=/invite?token=${token}`);
                setError("Email hiện tại không khớp với lời mời. Vui lòng đăng nhập bằng đúng tài khoản được mời.");
                // ép login lại
                setTimeout(() => {
                    navigate(`/login?redirect=/invite?token=${token}`);
                }, 2000);
            } else {
                navigate(`/login?redirect=/invite?token=${token}`);
                setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
            }
        }
    };

    if (loading)
        return <div className="flex items-center justify-center min-h-screen text-gray-500">Đang tải...</div>;
    if (error)
        return <div className="flex items-center justify-center min-h-screen text-red-500 text-center px-4">{error}</div>;

    const { itineraryTitle = "", inviterName = "", inviterEmail = "", role = "" } = invite || {};

    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-100 to-indigo-100 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center"
                >
                    <h1 className="text-2xl font-bold mb-4 text-slate-900">
                        Bạn được mời tham gia lịch trình
                    </h1>

                    <p className="text-slate-700 mb-2">
                        Lịch trình: <span className="font-semibold">{itineraryTitle}</span>
                    </p>
                    <p className="text-slate-700 mb-2">
                        Người mời: <span className="font-semibold">{inviterName} ({inviterEmail})</span>
                    </p>
                    <p className="text-slate-600 mb-6">Vai trò: {role}</p>

                    {!actionStatus ? (
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAction("ACCEPTED")}
                                className="btn-primary px-6 py-2 rounded-xl font-medium"
                            >
                                Chấp nhận
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAction("DECLINED")}
                                className="btn-secondary px-6 py-2 rounded-xl font-medium"
                            >
                                Từ chối
                            </motion.button>
                        </div>
                    ) : (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`mt-6 font-semibold ${actionStatus.includes("từ chối") ? "text-red-500" : "text-green-600"}`}
                        >
                            {actionStatus}
                        </motion.p>
                    )}
                </motion.div>
            </div>
        </>
    );
}
