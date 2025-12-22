import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import PlaceCard from "../components/PlaceCard.jsx";
import PlaceModal from "../components/PlaceModal.jsx";
import LocationMap from "../components/LocationMap.jsx";
import {
  GetAllCategories,
  GetDestinationDetail,
  GetPlacesByCategory,
  GetFoodsByDestination,
  GetItinerariesByDestination,
} from "../service/api.admin.service.jsx";
import ItineraryCard from "../components/ItineraryCard.jsx";
import ItineraryDetailPage from "./ItineraryDetailPage";
import {
  HomeIcon,
  FireIcon,
  ShoppingBagIcon,
  MapIcon,
  UsersIcon,
  MapPinIcon,
  InformationCircleIcon,
  ClockIcon,
  CloudIcon,
  TruckIcon,
  HeartIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { ArrowLeft } from "lucide-react";
import FoodCard from "../components/FoodCard.jsx";
import { AnimatePresence, motion } from "framer-motion";
import { getFeaturedItinerariesByDestination } from "../service/tripService.js";


// const MOCK_FEATURED_ITINERARIES = [
//   {
//     id: "2466a75e-f6b1-4e28-b986-ae9cd40d07eb",
//     title: "Quy Nhơn 3 ngày 2 đêm",
//     startDate: "2025-10-09",
//     endDate: "2025-10-11",
//     totalItems: 1,
//     destinationId: "dest-quynhon",
//     destinationName: "Quy Nhơn",
//     // có thể thêm coverImage / bannerImage nếu muốn
//     // coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
//     shortDescription:
//       "Lịch trình mẫu 3 ngày 2 đêm: bãi biển, ẩm thực và các điểm check-in nổi bật.",
//   },
// ];

// helper tính số ngày (nếu backend không trả)
const calcDays = (start, end) => {
  try {
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
  } catch {
    return undefined;
  }
};

const categoryIcons = {
  "cat-food": FireIcon,
  "cat-beach": HomeIcon,
  "cat-market": ShoppingBagIcon,
  "cat-temple": MapIcon,
  "cat-cultural": UsersIcon,
  "cat-nature": MapPinIcon,
  "cat-restaurant": FireIcon,
};

const infoIcons = {
  tips: InformationCircleIcon,
  "Thời gian": ClockIcon,
  transport: TruckIcon,
  culture: HeartIcon,
  "Thời tiết": CloudIcon,
  activities: PlayIcon,
};

export default function DestinationDetail() {
  const [itineraries, setItineraries] = useState([]);
  const [loadingItineraries, setLoadingItineraries] = useState(false);

  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const locationQuery = searchParams.get("q") || "Quy Nhơn";
  const { id } = useParams();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [destinationDetail, setDestinationDetail] = useState(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  const defaultTab = searchParams.get("tab") || "gioi-thieu";
  const [activeMainTab, setActiveMainTab] = useState(defaultTab);

  const [categoryPlaces, setCategoryPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);

  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState(null);
  const [isMapVisible, setIsMapVisible] = useState(true);

  const openModal = (place) => setSelectedPlace(place);
  const closeModal = () => setSelectedPlace(null);

  useEffect(() => {
    if (activeMainTab !== "lich-trinh") return;

    let isMounted = true;
    setLoadingItineraries(true);

    getFeaturedItinerariesByDestination(id)
      .then((res) => {
        if (!isMounted) return;

        const data = (res || []).map((x) => ({
          ...x,
          totalDays:
            x.totalDays ??
            (x.startDate && x.endDate
              ? calcDays(x.startDate, x.endDate)
              : null),
        }));

        setItineraries(data);
      })
      .catch((err) => {
        console.error("Load featured itineraries failed:", err);
        if (isMounted) setItineraries([]);
      })
      .finally(() => {
        if (isMounted) setLoadingItineraries(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeMainTab, id]);


  // Sync selectedCategory khi URL thay đổi
  useEffect(() => {
    setSelectedCategory(category || "");
  }, [category]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await GetAllCategories();
        console.log("Categories response:", res);
        if (res && res.data) {
          setCategories(res.data);
        } else if (res && Array.isArray(res)) {
          setCategories(res);
        }
      } catch (err) {
        console.error("Lỗi load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFoods = async () => {
      if (activeMainTab !== "am-thuc") return;
      try {
        setLoadingFoods(true);
        if (!id) return;

        const res = await GetFoodsByDestination(id);
        console.log("Foods response:", res);

        if (res?.data?.foods) {
          setFoods(res.data.foods);
        } else if (res?.foods) {
          setFoods(res.foods);
        } else {
          setFoods([]);
        }
      } catch (err) {
        console.error("Fetch foods error:", err);
        setFoods([]);
      } finally {
        setLoadingFoods(false);
      }
    };

    fetchFoods();
  }, [activeMainTab, id]);

  // Load destination detail
  useEffect(() => {
    const fetchDestination = async () => {
      try {
        if (!id) return;
        const res = await GetDestinationDetail(id);

        console.log("Destination detail response:", res);
        if (res && res.data) {
          setDestinationDetail(res.data);
        } else if (res) {
          setDestinationDetail(res);
        }
      } catch (err) {
        console.error("Lỗi load destination:", err);
      }
    };
    fetchDestination();
  }, [locationQuery]);

  // Load places by category khi selectedCategory thay đổi
  useEffect(() => {
    const fetchPlacesByCategory = async () => {
      if (!selectedCategory || activeMainTab !== "dia-diem") {
        setCategoryPlaces([]);
        setSelectedCategoryInfo(null);
        return;
      }

      setLoadingPlaces(true);
      try {
        if (!id || !selectedCategory) return;
        const res = await GetPlacesByCategory(id, selectedCategory);

        console.log("Places by category response:", res);

        if (res && res.data) {
          setCategoryPlaces(res.data.places || []);
          setSelectedCategoryInfo(res.data.category);
        } else if (res && res.places) {
          setCategoryPlaces(res.places || []);
          setSelectedCategoryInfo(res.category);
        }
      } catch (err) {
        console.error("Lỗi load places by category:", err);
        setCategoryPlaces([]);
        setSelectedCategoryInfo(null);
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchPlacesByCategory();
  }, [selectedCategory, activeMainTab]);

  useEffect(() => {
    const currentTab = searchParams.get("tab") || "gioi-thieu";
    setActiveMainTab(currentTab);
  }, [searchParams]);
  // Hàm xử lý chọn main tab
  const handleMainTabSelect = (tabId) => {
    setActiveMainTab(tabId);
    setSearchParams({ tab: tabId });
    if (tabId === "dia-diem") {
      setSelectedCategory("");
    }
  };

  // Hàm xử lý chọn category (chỉ hoạt động khi đang ở tab địa điểm)
  const handleCategorySelect = (categoryId) => {
    if (activeMainTab !== "dia-diem") return;

    setSelectedCategory(categoryId);
    const params = new URLSearchParams(window.location.search);
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

  // Hàm để lấy locations cho map
  const getMapLocations = () => {
    if (selectedCategory && categoryPlaces.length > 0) {
      return categoryPlaces;
    }
    return [
      ...(destinationDetail?.bestPlaces || []),
      ...(destinationDetail?.bestRestaurants || []),
    ];
  };
  const infoOrder = [
    "Thời tiết",
    "Văn hóa",
    "Hoạt động",
    "Thời gian lý tưởng",
    "Di chuyển",
    "Mẹo du lịch",
  ];

  const tabBackgrounds = {
    "gioi-thieu": "/imgs/bg-intro.jpg",
    "am-thuc": "/imgs/bg-food.jpg",
    "dia-diem": "/imgs/bg-place.jpg",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative h-96 bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage: destinationDetail?.images?.[0]?.imageUrl
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("${destinationDetail.images[0].imageUrl}")`
            : "linear-gradient(to right, #0ea5e9, #6366f1, #a855f7)",
          backgroundColor: "#6366f1",
        }}
      >
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black drop-shadow-2xl mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {destinationDetail?.name || locationQuery}
            </span>
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg md:text-xl leading-relaxed drop-shadow-lg px-4">
              {destinationDetail?.description ||
                `Gợi ý hành trình, địa điểm ăn uống và trải nghiệm đáng nhớ tại ${locationQuery}.`}
            </p>
          </div>
        </div>

        {/* Main Navigation - overlay bottom hero */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
          <div
            className="flex items-center gap-6 px-8 py-4 
               bg-white/80 backdrop-blur-xl shadow-2xl 
               rounded-full border border-gray-200 
               relative overflow-hidden"
          >
            {[
              { id: "gioi-thieu", label: "Giới thiệu" },
              { id: "am-thuc", label: "Ẩm thực" },
              { id: "dia-diem", label: "Địa điểm" },
              { id: "lich-trinh", label: "Lịch trình" },
            ].map((tab) => {
              const isActive = activeMainTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleMainTabSelect(tab.id)}
                  className={`relative px-4 py-2 text-lg font-semibold transition-all duration-500
            ${isActive
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                      : "text-gray-700 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500"
                    }`}
                >
                  {tab.label}
                  {/* underline glow */}
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 -bottom-1 h-[3px] rounded-full 
                        bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md 
                        transition-all duration-500
              ${isActive ? "w-3/4 opacity-100" : "w-0 opacity-0"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content based on active main tab */}
      <section className="container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Giới thiệu Tab */}
          {activeMainTab === "gioi-thieu" && (
            <motion.div
              key="gioi-thieu"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-4xl mx-auto space-y-12">
                {destinationDetail?.infos
                  ?.slice()
                  .sort(
                    (a, b) =>
                      infoOrder.indexOf(a.infoKey) -
                      infoOrder.indexOf(b.infoKey)
                  )
                  .map((info) => (
                    <div key={info.id} className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-10 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {info.infoKey}
                        </h2>
                      </div>

                      {info.imageUrl && info.imageUrl.trim() !== "" && (
                        <img
                          src={info.imageUrl}
                          alt={info.infoKey}
                          className="w-full h-auto object-cover"
                        />
                      )}

                      <p className="text-gray-700 leading-relaxed">
                        {info.infoValue}
                      </p>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Ẩm thực Tab */}
          {activeMainTab === "am-thuc" && (
            <motion.div
              key="am-thuc"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="py-10">
                {/* Tiêu đề */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-10 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Ẩm thực {destinationDetail?.name || locationQuery}
                  </h2>
                </div>

                {/* Nội dung */}
                {loadingFoods ? (
                  <p className="text-center text-gray-500">Đang tải...</p>
                ) : foods.length === 0 ? (
                  <p className="text-center text-gray-500">
                    Hiện chưa có dữ liệu ẩm thực cho địa điểm này.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foods.map((food) => (
                      <FoodCard key={food.id} food={food} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Địa điểm Tab */}
          {activeMainTab === "dia-diem" && (
            <motion.div
              key="dia-diem"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <>
                {/* Category Filter - chỉ hiển thị khi đang ở tab địa điểm */}
                <div className="mb-8">
                  <div
                    className="flex justify-center items-center gap-8 overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    <button
                      onClick={() => handleCategorySelect("")}
                      className={`relative whitespace-nowrap pb-3 text-lg font-medium transition-all duration-300 hover:scale-105 cursor-pointer
                    ${!selectedCategory
                          ? "text-blue-600 font-semibold"
                          : "text-gray-600 hover:text-blue-500"
                        }
                  `}
                    >
                      Nổi bật
                      <span
                        className={`absolute left-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500
                      ${!selectedCategory
                            ? "w-full opacity-100"
                            : "w-0 opacity-0"
                          }
                    `}
                      />
                    </button>

                    {categories.map((cat) => {
                      const isActive =
                        String(selectedCategory) === String(cat.id);

                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`relative whitespace-nowrap pb-3 text-lg font-medium transition-all duration-300 hover:scale-105 cursor-pointer
                        ${isActive
                              ? "text-blue-600 font-semibold"
                              : "text-gray-600 hover:text-blue-500"
                            }
                      `}
                        >
                          {cat.name}
                          <span
                            className={`absolute left-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500
                          ${isActive ? "w-full opacity-100" : "w-0 opacity-0"}
                        `}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Places Content */}
                <div
                  className={`grid gap-8 transition-all duration-500 ease-in-out ${isMapVisible ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1"
                    }`}
                >
                  {/* Left: Places List */}
                  <div
                    className={`space-y-10 ${isMapVisible ? "lg:col-span-3" : "max-w-5xl mx-auto"
                      }`}
                  >
                    <AnimatePresence mode="wait">
                      {/* Khi có category được chọn */}
                      {selectedCategory && (
                        <motion.div
                          key={selectedCategory}
                          initial={{ x: 100, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -100, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div>
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                              <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                  {selectedCategoryInfo?.name || "Danh mục"}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                  Khám phá tại {locationQuery}
                                </p>
                              </div>
                            </div>

                            {loadingPlaces ? (
                              <div className="flex items-center justify-center py-20">
                                <div className="relative">
                                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                  <div className="absolute top-0 left-0 animate-ping rounded-full h-12 w-12 border-2 border-blue-400 opacity-20"></div>
                                </div>
                                <span className="ml-4 text-gray-600 font-medium">
                                  Đang tải địa điểm...
                                </span>
                              </div>
                            ) : categoryPlaces.length > 0 ? (
                              <>
                                <div className="flex items-center justify-between mb-6">
                                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-4 py-2 rounded-full">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    {categoryPlaces.length} địa điểm
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {categoryPlaces.map((place, index) => (
                                    <div
                                      key={place.id}
                                      className="group transform hover:scale-[1.02] transition-all duration-300"
                                    >
                                      <PlaceCard
                                        place={place}
                                        index={index + 1}
                                        onHover={(hoveredPlace) =>
                                          setHoveredId(hoveredPlace?.id || null)
                                        }
                                      />
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
                                <div className="text-gray-300 mb-4">
                                  <MapIcon className="w-16 h-16 mx-auto" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">
                                  Chưa có địa điểm nào trong danh mục này
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                  Hãy thử chọn danh mục khác
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Khi chưa chọn category */}
                    {!selectedCategory && (
                      <div className="space-y-12">
                        {/* Best Places */}
                        <div>
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-1 h-10 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                Điểm đến nổi bật
                              </h2>
                              <p className="text-gray-500 text-sm">
                                Những địa điểm không thể bỏ qua
                              </p>
                            </div>
                          </div>

                          {destinationDetail?.bestPlaces?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {destinationDetail.bestPlaces.map(
                                (place, index) => (
                                  <div
                                    key={place.id}
                                    className="group transform hover:scale-[1.02] transition-all duration-300"
                                  >
                                    <PlaceCard
                                      place={place}
                                      index={index + 1}
                                      onHover={(hoveredPlace) =>
                                        setHoveredId(hoveredPlace?.id || null)
                                      }
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
                              Không có địa điểm nổi bật nào.
                            </p>
                          )}
                        </div>

                        {/* Best Restaurants */}
                        <div>
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-1 h-10 bg-gradient-to-b from-red-400 to-pink-500 rounded-full"></div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                Nhà hàng nổi bật
                              </h2>
                              <p className="text-gray-500 text-sm">
                                Trải nghiệm ẩm thực địa phương
                              </p>
                            </div>
                          </div>

                          {destinationDetail?.bestRestaurants?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {destinationDetail.bestRestaurants.map(
                                (restaurant, index) => (
                                  <div
                                    key={restaurant.id}
                                    className="group transform hover:scale-[1.02] transition-all duration-300"
                                  >
                                    <PlaceCard
                                      place={restaurant}
                                      index={index + 1}
                                      onHover={(hoveredPlace) =>
                                        setHoveredId(hoveredPlace?.id || null)
                                      }
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
                              Không có nhà hàng nổi bật nào.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Map with Toggle */}
                  {isMapVisible && (
                    <div className="lg:col-span-2 relative">
                      <div
                        className="sticky top-20"
                        style={{ marginTop: "80px" }}
                      >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative group">
                          <button
                            onClick={() => setIsMapVisible(false)}
                            className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                            title="Ẩn bản đồ"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                          <div className="h-[620px] w-full">
                            <LocationMap
                              locations={getMapLocations()}
                              hoveredId={hoveredId}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            </motion.div>
          )}
          {activeMainTab === "lich-trinh" && (
            <motion.div
              key="lich-trinh"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Lịch trình mẫu nổi bật
                      </h2>
                      <p className="text-sm text-gray-500">
                        Chọn một lịch trình có sẵn để tham khảo chi tiết
                      </p>
                    </div>
                  </div>
                </div>

                {loadingItineraries ? (
                  <p className="text-center text-gray-500">
                    Đang tải lịch trình...
                  </p>
                ) : itineraries.length === 0 ? (
                  <p className="text-center text-gray-500">
                    Chưa có lịch trình nào cho điểm đến này.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {itineraries.map((itinerary) => (
                      <button
                        key={itinerary.id}
                        onClick={() =>
                          navigate(`/itineraries/${itinerary.id}/landing`)
                        }
                        className="group text-left rounded-2xl overflow-hidden border bg-white hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <div className="h-44 overflow-hidden">
                          <img
                            src={
                              itinerary.coverImage ||
                              itinerary.bannerImage ||
                              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
                            }
                            alt={itinerary.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {itinerary.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {itinerary.shortDescription ||
                              itinerary.description ||
                              "Lịch trình tham khảo chi tiết các điểm đến, ăn uống và di chuyển."}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                            {itinerary.totalDays ? (
                              <span className="px-2 py-1 rounded-full bg-gray-50 border">
                                {itinerary.totalDays} ngày
                              </span>
                            ) : null}
                            {itinerary.startDate && itinerary.endDate ? (
                              <span className="px-2 py-1 rounded-full bg-gray-50 border">
                                {itinerary.startDate} → {itinerary.endDate}
                              </span>
                            ) : null}
                            {itinerary.destinationName ||
                              itinerary.destination?.name ? (
                              <span className="px-2 py-1 rounded-full bg-gray-50 border">
                                {itinerary.destinationName ||
                                  itinerary.destination?.name}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-3 text-blue-600 font-medium text-sm">
                            Xem chi tiết →
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Show Map Toggle Button when hidden */}
          {!isMapVisible && activeMainTab === "dia-diem" && (
            <div className="fixed bottom-8 right-8 z-50">
              <button
                onClick={() => setIsMapVisible(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <MapIcon className="w-5 h-5" />
                Hiển thị bản đồ
              </button>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Place Modal */}
      {selectedPlace && (
        <PlaceModal place={selectedPlace} onClose={closeModal} />
      )}
    </div>
  );
}
