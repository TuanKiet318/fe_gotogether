import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { getProvinces } from "../service/destination.api";

const DestinationFilter = ({
  onSearch,
  loading,
  provinces: initialProvinces = [],
}) => {
  const [searchText, setSearchText] = useState("");
  const [province, setProvince] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("ASC");
  const [provinces, setProvinces] = useState(initialProvinces);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (initialProvinces.length === 0) {
      fetchProvinces();
    }
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await getProvinces();
      if (response.data?.data) {
        setProvinces(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const handleSearch = () => {
    const params = {
      search: searchText,
      province: province || undefined,
      sortBy,
      sortDirection,
      page: 0,
    };
    onSearch(params);
  };

  const handleReset = () => {
    setSearchText("");
    setProvince("");
    setSortBy("name");
    setSortDirection("ASC");

    onSearch({
      page: 0,
      sortBy: "name",
      sortDirection: "ASC",
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-4">
      {/* Main Search Bar */}
      <div className="mb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tìm kiếm địa điểm..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="absolute right-2 top-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1.5 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
          >
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <div className="mt-4 md:hidden p-4 bg-gray-50 rounded-xl">
          <div className="space-y-4">
            {/* Additional filters can be added here */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng giá
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Tất cả mức giá</option>
                <option>Dưới 500k</option>
                <option>500k - 2 triệu</option>
                <option>Trên 2 triệu</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationFilter;
