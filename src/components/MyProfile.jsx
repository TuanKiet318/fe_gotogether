import React, { useEffect, useState } from "react";
import { apiGetMyProfile } from "../service/api.auth.service";
import { toast } from "sonner";
import { User, CheckCircle, XCircle, Calendar, Clock } from "lucide-react";

export default function MyProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await apiGetMyProfile();
                setUser(res.data.data);
            } catch (err) {
                toast.error(
                    err?.response?.data?.message || "Không thể tải thông tin người dùng"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) return <div className="text-center py-20">Đang tải...</div>;
    if (!user) return <div className="text-center py-20">Không có dữ liệu</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl mt-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-300 shadow-lg bg-gray-100 flex items-center justify-center">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-16 h-16 text-gray-400" />
                    )}
                </div>

                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                    <p className="text-gray-500 mt-1">{user.email}</p>
                    <span
                        className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full ${user.role === "ROLE_ADMIN"
                            ? "bg-red-100 text-red-700"
                            : user.role === "ROLE_SUPPLIER"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                    >
                        {user.role ? user.role.replace("ROLE_", "") : "User"}
                    </span>
                </div>
            </div>

            {/* Info Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
                    {user.online ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                        <p className="text-gray-500 text-sm">Online</p>
                        <p className="text-gray-800 font-medium">
                            {user.online ? "Đang hoạt động" : "Ngoại tuyến"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
                    {user.active ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                        <p className="text-gray-500 text-sm">Active</p>
                        <p className="text-gray-800 font-medium">
                            {user.active ? "Kích hoạt" : "Chưa kích hoạt"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
                    <Clock className="w-6 h-6 text-gray-500" />
                    <div>
                        <p className="text-gray-500 text-sm">Last Login</p>
                        <p className="text-gray-800 font-medium">
                            {user.lastLogin
                                ? new Date(user.lastLogin).toLocaleString()
                                : "-"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
                    <Calendar className="w-6 h-6 text-gray-500" />
                    <div>
                        <p className="text-gray-500 text-sm">Created At</p>
                        <p className="text-gray-800 font-medium">
                            {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "-"}
                        </p>
                    </div>
                </div>

                {/* <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow hover:shadow-lg transition col-span-1 sm:col-span-2">
                    <Clock className="w-6 h-6 text-gray-500" />
                    <div>
                        <p className="text-gray-500 text-sm">Previous Login</p>
                        <p className="text-gray-800 font-medium">
                            {user.previousLogin
                                ? new Date(user.previousLogin).toLocaleString()
                                : "-"}
                        </p>
                    </div>
                </div> */}
            </div>

            {/* Footer Action */}
            <div className="mt-8 text-center">
                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition">
                    Chỉnh sửa thông tin
                </button>
            </div>
        </div>
    );
}
