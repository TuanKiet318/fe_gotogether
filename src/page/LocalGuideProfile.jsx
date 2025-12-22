import React, { useState, useEffect } from "react";
import {
    User, MapPin, Phone, CreditCard, Globe, Award,
    FileText, Camera, CheckCircle, Pencil, X, Upload,
    Briefcase, Languages
} from "lucide-react";

import { getMyLocalGuideProfile, updateLocalGuide } from "../service/localGuideService";

export default function LocalGuideProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [previews, setPreviews] = useState({});

    // ⭐ Fetch profile đúng cách
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getMyLocalGuideProfile();
                setProfile(res);
                setForm(res); // fill form
            } catch (e) {
                console.error("Lỗi fetch profile:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ⭐ Handle change (text + file)
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files?.length > 0) {
            const file = files[0];
            setForm((prev) => ({ ...prev, [name]: file }));

            const reader = new FileReader();
            reader.onloadend = () => setPreviews((p) => ({ ...p, [name]: reader.result }));
            reader.readAsDataURL(file);
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    // ⭐ Update profile
    const handleUpdate = async () => {
        try {
            await updateLocalGuide(profile.id, form);

            // reload data
            const updated = await getMyLocalGuideProfile();
            setProfile(updated);

            setEditing(false);
            alert("Cập nhật thành công!");
        } catch (error) {
            console.error(error);
            alert("Cập nhật thất bại");
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (!profile) return <p>Không có dữ liệu hồ sơ.</p>;

    const statusConfig = {
        APPROVED: { color: "bg-green-100 text-green-700 border-green-300", label: "Đã duyệt", icon: CheckCircle },
        PENDING: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", label: "Chờ duyệt", icon: Camera },
        REJECTED: { color: "bg-red-100 text-red-700 border-red-300", label: "Từ chối", icon: X }
    };

    const status = statusConfig[profile.status] || statusConfig.PENDING;
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Hero Header with Avatar */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
                    <div className="h-48 bg-white">
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                    </div>

                    <div className="px-8 pb-8 -mt-20 relative">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 p-1 shadow-xl">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                        <User size={64} className="text-blue-600" />
                                    </div>
                                </div>
                                <div className={`absolute bottom-2 right-2 w-12 h-12 ${status.color} rounded-full border-4 border-white flex items-center justify-center shadow-lg`}>
                                    <StatusIcon size={20} />
                                </div>
                            </div>

                            {/* Name & Info */}
                            <div className="flex-1 text-center md:text-left mb-4">
                                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                    {profile.fullName}
                                </h1>
                                <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
                                    <span className={`px-4 py-1.5 ${status.color} rounded-full text-sm font-semibold border-2 flex items-center gap-1.5`}>
                                        <StatusIcon size={16} />
                                        {status.label}
                                    </span>
                                    <span className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-1.5 rounded-full">
                                        <MapPin size={16} />
                                        {profile.destinationName}
                                    </span>
                                    <span className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-1.5 rounded-full">
                                        <Award size={16} />
                                        {profile.experienceYears} năm kinh nghiệm
                                    </span>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <button
                                onClick={() => setEditing(true)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all font-semibold"
                            >
                                <Pencil size={18} /> Chỉnh sửa hồ sơ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-3 gap-6">

                    {/* Left Column - Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Phone className="text-blue-600" size={24} />
                                Thông tin liên hệ
                            </h2>

                            <div className="space-y-4">
                                <InfoCard icon={Phone} label="Số điện thoại" value={profile.phone} />
                                <InfoCard icon={CreditCard} label="CCCD/CMND" value={profile.nationalId} />
                                <InfoCard icon={MapPin} label="Địa chỉ" value={profile.localAddress} />
                                <InfoCard icon={Languages} label="Ngôn ngữ" value={profile.languages} />
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
                            <h3 className="text-lg font-bold mb-4">Thống kê</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="opacity-90">Chuyến đi</span>
                                    <span className="text-2xl font-bold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="opacity-90">Đánh giá</span>
                                    <span className="text-2xl font-bold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="opacity-90">Xếp hạng</span>
                                    <span className="text-2xl font-bold">⭐ N/A</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="md:col-span-2 space-y-6">

                        {/* About Section */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="text-blue-600" size={24} />
                                Giới thiệu bản thân
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                {profile.description}
                            </p>
                        </div>

                        {/* Documents Section */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Camera className="text-blue-600" size={24} />
                                Tài liệu xác thực
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <DocumentCard
                                    title="CCCD mặt trước"
                                    url={profile.frontImageUrl}
                                    icon={CreditCard}
                                />
                                <DocumentCard
                                    title="CCCD mặt sau"
                                    url={profile.backImageUrl}
                                    icon={CreditCard}
                                />
                                <DocumentCard
                                    title="Minh chứng nghề nghiệp"
                                    url={profile.portfolioUrl}
                                    icon={Briefcase}
                                />
                                <DocumentCard
                                    title="Chứng chỉ"
                                    url={profile.certificateUrl}
                                    icon={Award}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                {editing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Pencil size={24} />
                                        Chỉnh sửa hồ sơ
                                    </h2>
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-6">

                                    {/* Personal Info */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <User size={20} className="text-blue-600" />
                                            Thông tin cá nhân
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormInput
                                                label="Họ và tên"
                                                name="fullName"
                                                value={form.fullName}
                                                onChange={handleChange}
                                                icon={User}
                                            />
                                            <FormInput
                                                label="Số điện thoại"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                icon={Phone}
                                            />
                                            <FormInput
                                                label="CCCD/CMND"
                                                name="nationalId"
                                                value={form.nationalId}
                                                onChange={handleChange}
                                                icon={CreditCard}
                                            />
                                            <FormInput
                                                label="Địa chỉ"
                                                name="localAddress"
                                                value={form.localAddress}
                                                onChange={handleChange}
                                                icon={MapPin}
                                            />
                                        </div>
                                    </div>

                                    {/* Professional Info */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <Briefcase size={20} className="text-blue-600" />
                                            Thông tin nghề nghiệp
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormInput
                                                label="Ngôn ngữ"
                                                name="languages"
                                                value={form.languages}
                                                onChange={handleChange}
                                                icon={Globe}
                                                placeholder="VD: English, Vietnamese"
                                            />
                                            <FormInput
                                                label="Số năm kinh nghiệm"
                                                name="experienceYears"
                                                type="number"
                                                value={form.experienceYears}
                                                onChange={handleChange}
                                                icon={Award}
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Mô tả bản thân
                                            </label>
                                            <textarea
                                                name="description"
                                                value={form.description}
                                                onChange={handleChange}
                                                rows="4"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                                                placeholder="Giới thiệu về bản thân..."
                                            />
                                        </div>
                                    </div>

                                    {/* Documents Upload */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <Camera size={20} className="text-blue-600" />
                                            Cập nhật tài liệu (tùy chọn)
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FileUploadInput
                                                label="CCCD mặt trước"
                                                name="frontImageFile"
                                                onChange={handleChange}
                                                preview={previews.frontImageFile || profile.frontImageUrl}
                                            />
                                            <FileUploadInput
                                                label="CCCD mặt sau"
                                                name="backImageFile"
                                                onChange={handleChange}
                                                preview={previews.backImageFile || profile.backImageUrl}
                                            />
                                            <FileUploadInput
                                                label="Portfolio"
                                                name="portfolioFile"
                                                onChange={handleChange}
                                                preview={previews.portfolioFile || profile.portfolioUrl}
                                            />
                                            <FileUploadInput
                                                label="Chứng chỉ"
                                                name="certificateFile"
                                                onChange={handleChange}
                                                preview={previews.certificateFile || profile.certificateUrl}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                                <button
                                    onClick={() => setEditing(false)}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* HELPER COMPONENTS */
function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-sm text-gray-800 font-semibold break-words">{value}</p>
            </div>
        </div>
    );
}

function DocumentCard({ title, url, icon: Icon }) {
    return (
        <div className="group relative">
            <div className="absolute top-3 left-3 bg-white bg-opacity-90 px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2 z-10">
                <Icon size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">{title}</span>
            </div>
            {url ? (
                <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all">
                    <img
                        src={url}
                        alt={title}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-30 transition-opacity"></div>
                </div>
            ) : (
                <div className="w-full h-56 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                    <Camera size={32} className="text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm italic">Chưa có dữ liệu</p>
                </div>
            )}
        </div>
    );
}

function FormInput({ label, name, value, onChange, icon: Icon, type = "text", placeholder }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
            </div>
        </div>
    );
}

function FileUploadInput({ label, name, onChange, preview }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    type="file"
                    name={name}
                    accept="image/*"
                    onChange={onChange}
                    className="hidden"
                    id={name}
                />
                <label
                    htmlFor={name}
                    className="flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer overflow-hidden"
                >
                    {preview ? (
                        <div className="w-full h-40 relative group">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                <Upload size={24} className="text-white opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        </div>
                    ) : (
                        <div className="py-8">
                            <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-600">Chọn ảnh mới</span>
                        </div>
                    )}
                </label>
            </div>
        </div>
    );
}