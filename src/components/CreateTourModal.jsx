import React, { useState } from "react";
import { X, Calendar, Users, DollarSign, FileText, MapPin } from "lucide-react";
import { createTour } from "../service/tourService";
import { nav } from "framer-motion/client";
import { useNavigate } from "react-router-dom";

const CreateTourModal = ({ isOpen, onClose, itineraryId, itineraryData }) => {
  const [formData, setFormData] = useState({
    title: itineraryData?.title || "",
    description: itineraryData?.description || "",
    startDate: itineraryData?.startDate || "",
    endDate: itineraryData?.endDate || "",
    registrationDeadline: "",
    maxParticipants: "",
    pricePerPerson: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tên tour";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả tour";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = "Vui lòng chọn hạn đăng ký";
    }

    if (
      formData.registrationDeadline &&
      formData.startDate &&
      formData.registrationDeadline >= formData.startDate
    ) {
      newErrors.registrationDeadline = "Hạn đăng ký phải trước ngày khởi hành";
    }

    if (!formData.maxParticipants || formData.maxParticipants < 1) {
      newErrors.maxParticipants = "Số người tối đa phải lớn hơn 0";
    }

    if (!formData.pricePerPerson || formData.pricePerPerson < 0) {
      newErrors.pricePerPerson = "Giá tour phải lớn hơn hoặc bằng 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tourData = {
        itineraryId: itineraryId,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        registrationDeadline: formData.registrationDeadline,
        maxParticipants: parseInt(formData.maxParticipants),
        pricePerPerson: parseInt(formData.pricePerPerson),
      };

      const result = await createTour(tourData);
      console.log("Tour created:", result);
      alert("Tạo tour thành công!");
      navigate("/tours");
      onClose();
    } catch (error) {
      console.error("Error creating tour:", error);
      alert(error?.response?.data?.message || "Có lỗi xảy ra khi tạo tour!");
      navigate("/local-guide");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setErrors({});
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000] pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden pointer-events-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="text-white" size={24} />
              <h2 className="text-2xl font-bold text-white">
                Tạo Tour Du Lịch
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText size={18} className="text-indigo-600" />
                  Tên Tour <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Tour Đà Lạt 3 ngày 2 đêm"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText size={18} className="text-indigo-600" />
                  Mô Tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Khám phá Đà Lạt mùa hoa dã quỳ..."
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none ${errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={18} className="text-green-600" />
                    Ngày Bắt Đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${errors.startDate ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={18} className="text-green-600" />
                    Ngày Kết Thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${errors.endDate ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={18} className="text-orange-600" />
                    Hạn Đăng Ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${errors.registrationDeadline
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                  />
                  {errors.registrationDeadline && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.registrationDeadline}
                    </p>
                  )}
                </div>
              </div>

              {/* Participants and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Users size={18} className="text-blue-600" />
                    Số Người Tối Đa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    placeholder="15"
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${errors.maxParticipants
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                  />
                  {errors.maxParticipants && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maxParticipants}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign size={18} className="text-emerald-600" />
                    Giá/Người (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="pricePerPerson"
                    value={formData.pricePerPerson}
                    onChange={handleInputChange}
                    placeholder="1500000"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${errors.pricePerPerson
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                  />
                  {errors.pricePerPerson && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.pricePerPerson}
                    </p>
                  )}
                  {formData.pricePerPerson && !errors.pricePerPerson && (
                    <p className="text-emerald-600 text-sm mt-1 font-medium">
                      {formatCurrency(formData.pricePerPerson)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang Tạo Tour..." : "Tạo Tour"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTourModal;
