import React, { useState } from "react";
import {
    User,
    MapPin,
    FileText,
    Phone,
    CreditCard,
    CheckCircle,
    Globe,
    Briefcase,
    Upload,
    Award,
    Camera,
} from "lucide-react";

import { createLocalGuide } from "../service/localGuideService";

const autocompleteSearch = async (query, limit = 10) => {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(
            `http://localhost:8080/api/destinations/search?q=${encodeURIComponent(
                query
            )}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error("Backend search failed");
        }

        const result = await response.json();

        // Backend đã trả về {status, message, data}, nên mình lấy data
        return result.data || [];
    } catch (error) {
        console.error("Backend autocomplete failed:", error);
        return [];
    }
};

export default function LocalGuideRegisterPage() {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [nationalId, setNationalId] = useState("");
    const [experienceYears, setExperienceYears] = useState(1);
    const [languages, setLanguages] = useState("");
    const [localAddress, setLocalAddress] = useState("");
    const [description, setDescription] = useState("");

    const [destinationId, setDestinationId] = useState("");
    const [destinationQuery, setDestinationQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [success, setSuccess] = useState(false);

    const [frontImageFile, setFrontImageFile] = useState(null);
    const [backImageFile, setBackImageFile] = useState(null);
    const [portfolioFile, setPortfolioFile] = useState(null);
    const [certificateFile, setCertificateFile] = useState(null);

    const [frontImagePreview, setFrontImagePreview] = useState(null);
    const [backImagePreview, setBackImagePreview] = useState(null);
    const [portfolioPreview, setPortfolioPreview] = useState(null);
    const [certificatePreview, setCertificatePreview] = useState(null);

    const handleDestinationInput = async (value) => {
        setDestinationQuery(value);

        if (value.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const results = await autocompleteSearch(value);
        setSuggestions(results);
        setShowSuggestions(true);
    };

    const handleSelectDestination = (item) => {
        setDestinationQuery(item.name);
        setDestinationId(item.id);
        setShowSuggestions(false);
    };

    const handleFileChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            destinationId,
            fullName,
            phone,
            nationalId,
            experienceYears,
            languages,
            localAddress,
            description,
            frontImageFile,
            backImageFile,
            portfolioFile,
            certificateFile,
        };

        try {
            await createLocalGuide(payload);
            setSuccess(true);
        } catch (error) {
            console.error("Register Local Guide failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
                        <MapPin className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        Đăng ký hướng dẫn viên địa phương
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Chia sẻ kinh nghiệm và đam mê du lịch của bạn. Trở thành hướng dẫn viên địa phương chuyên nghiệp.
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-green-500">
                        <div className="flex items-center gap-3 text-green-700">
                            <CheckCircle size={32} className="flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold">Đăng ký thành công!</h3>
                                <p className="text-green-600">Chúng tôi sẽ xem xét hồ sơ và liên hệ với bạn sớm nhất.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8" onSubmit={handleSubmit}>
                    {/* Section 1: Location & Personal Info */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <User className="text-blue-600" size={28} />
                            Thông tin cá nhân
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Destination */}
                            <div className="md:col-span-2 relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Địa điểm hướng dẫn
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={destinationQuery}
                                        onChange={(e) => handleDestinationInput(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                        placeholder="Nhập để tìm địa điểm..."
                                        required
                                    />
                                </div>

                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-lg mt-2 max-h-60 overflow-y-auto z-50">
                                        {suggestions.map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleSelectDestination(item)}
                                                className="block w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                                            >
                                                <div className="font-semibold text-gray-800">{item.name}</div>
                                                <div className="text-sm text-gray-500">{item.country}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Họ và tên đầy đủ
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                        placeholder="0912345678"
                                        required
                                    />
                                </div>
                            </div>

                            {/* National ID */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    CCCD / CMND
                                </label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={nationalId}
                                        onChange={(e) => setNationalId(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                        placeholder="001234567890"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Địa chỉ sinh sống
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={localAddress}
                                        onChange={(e) => setLocalAddress(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Professional Info */}
                    <div className="mb-8 pt-8 border-t-2 border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Briefcase className="text-blue-600" size={28} />
                            Thông tin nghề nghiệp
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Experience */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Số năm kinh nghiệm
                                </label>
                                <div className="relative">
                                    <Award className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={experienceYears}
                                        onChange={(e) => setExperienceYears(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Languages */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ngôn ngữ sử dụng
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={languages}
                                        onChange={(e) => setLanguages(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                        placeholder="VD: English, Vietnamese, Korean"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mô tả bản thân
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                                        rows="4"
                                        placeholder="Giới thiệu về bản thân, kinh nghiệm và những điểm mạnh của bạn..."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Documents */}
                    <div className="pt-8 border-t-2 border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Camera className="text-blue-600" size={28} />
                            Tài liệu đính kèm
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Front ID Image */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ảnh mặt trước CCCD
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, setFrontImageFile, setFrontImagePreview)}
                                        className="hidden"
                                        id="front-image"
                                    />
                                    <label
                                        htmlFor="front-image"
                                        className="flex flex-col items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                                    >
                                        {frontImagePreview ? (
                                            <div className="w-full">
                                                <img
                                                    src={frontImagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg mb-2"
                                                />
                                                <span className="text-sm text-gray-600 text-center block">
                                                    {frontImageFile.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={20} className="text-gray-500" />
                                                <span className="text-gray-600">Chọn ảnh</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Back ID Image */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ảnh mặt sau CCCD
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, setBackImageFile, setBackImagePreview)}
                                        className="hidden"
                                        id="back-image"
                                    />
                                    <label
                                        htmlFor="back-image"
                                        className="flex flex-col items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                                    >
                                        {backImagePreview ? (
                                            <div className="w-full">
                                                <img
                                                    src={backImagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg mb-2"
                                                />
                                                <span className="text-sm text-gray-600 text-center block">
                                                    {backImageFile.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={20} className="text-gray-500" />
                                                <span className="text-gray-600">Chọn ảnh</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Portfolio */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Minh chứng nghề nghiệp
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={(e) => setPortfolioFile(e.target.files[0])}
                                        className="hidden"
                                        id="portfolio"
                                    />
                                    <label
                                        htmlFor="portfolio"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                                    >
                                        <Upload size={20} className="text-gray-500" />
                                        <span className="text-gray-600">
                                            {portfolioFile ? portfolioFile.name : "Chọn file"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Certificate */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Chứng chỉ
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={(e) => setCertificateFile(e.target.files[0])}
                                        className="hidden"
                                        id="certificate"
                                    />
                                    <label
                                        htmlFor="certificate"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                                    >
                                        <Upload size={20} className="text-gray-500" />
                                        <span className="text-gray-600">
                                            {certificateFile ? certificateFile.name : "Chọn file"}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-10">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5"
                        >
                            Gửi đơn đăng ký
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Bằng cách gửi đơn, bạn đồng ý với điều khoản sử dụng của chúng tôi
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}