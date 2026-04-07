import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HomeIcon,
  MapIcon,
  FireIcon,
  CakeIcon,
  BuildingOfficeIcon,
  SunIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import { ChevronRight, Compass, MapPin } from "lucide-react";
import DestinationFilter from "../components/DestinationFilter";
import DestinationGrid from "../components/DestinationGrid";
import { getDestinations, getProvinces } from "../service/destination.api";

const DestinationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 12,
    sortBy: "name",
    sortDirection: "ASC",
  });
  const [provinces, setProvinces] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch provinces
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch destinations when searchParams change
  useEffect(() => {
    fetchDestinations();
  }, [searchParams]);

  const fetchProvinces = async () => {
    try {
      const response = await getProvinces();
      console.log("Provinces response:", response);
      if (response) {
        setProvinces(response);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const response = await getDestinations(searchParams);
      console.log("Search response:", response);
      if (response) {
        const data = response;
        setDestinations(data.content || []);
        setPagination({
          page: data.page || 0,
          size: data.size || 12,
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          last: data.last || true,
        });
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params) => {
    setSearchParams((prev) => ({
      ...prev,
      ...params,
      page: 0,
    }));
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    let params = {
      page: 0,
      size: 12,
    };

    switch (tab) {
      case "popular":
        params.sortBy = "totalPlaces";
        params.sortDirection = "DESC";
        break;
      case "food":
        params.sortBy = "totalFoods";
        params.sortDirection = "DESC";
        break;
      case "north":
        params.province = "Hà Nội"; // Example for Northern region
        break;
      case "central":
        params.province = "Đà Nẵng"; // Example for Central region
        break;
      case "south":
        params.province = "TP. Hồ Chí Minh"; // Example for Southern region
        break;
      default:
        params.sortBy = "name";
        params.sortDirection = "ASC";
    }

    handleSearch(params);
  };

  const tabs = [
    { id: "all", label: "Tất cả", icon: MapIcon, color: "blue" },
    { id: "popular", label: "Phổ biến", icon: FireIcon, color: "red" },
    { id: "food", label: "Ẩm thực", icon: CakeIcon, color: "orange" },
    { id: "north", label: "Miền Bắc", icon: CloudIcon, color: "cyan" },
    { id: "central", label: "Miền Trung", icon: SunIcon, color: "yellow" },
    {
      id: "south",
      label: "Miền Nam",
      icon: BuildingOfficeIcon,
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section
        className="relative overflow-hidden 
                        border border-gray-200 bg-white
                        px-6 py-8 md:px-10 md:py-12
                        shadow-sm"
      >
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center text-sm text-gray-500">
          <Link
            to="/explores"
            className="flex items-center gap-1 font-medium text-gray-600
                     hover:text-gray-900 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Khám phá
          </Link>

          <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />

          <span className="font-semibold text-gray-900">Địa điểm</span>
        </nav>

        {/* Title */}
        <h1 className="flex items-center gap-2 text-3xl md:text-4xl font-bold text-gray-900">
          <MapPin className="w-7 h-7 text-blue-600" />
          Địa điểm du lịch
        </h1>
      </section>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-8">
        {/* Filter Section */}
        <div className="mb-12">
          <DestinationFilter
            onSearch={handleSearch}
            loading={loading}
            provinces={provinces}
          />
        </div>

        {/* Destinations Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <DestinationGrid
            destinations={destinations}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default DestinationsPage;
