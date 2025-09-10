import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import PlaceCard from "../components/PlaceCard.jsx";
import PlaceModal from "../components/PlaceModal.jsx";
import LocationMap from "../components/LocationMap.jsx";
import { GetAllCategories, GetDestinationDetail } from "../service/api.admin.service.jsx";
import { HomeIcon, FireIcon, ShoppingBagIcon, MapIcon, UsersIcon, MapPinIcon } from '@heroicons/react/24/outline';

const categoryIcons = {
    "cat-food": FireIcon,
    "cat-beach": HomeIcon,
    "cat-market": ShoppingBagIcon,
    "cat-temple": MapIcon,
    "cat-cultural": UsersIcon,
    "cat-nature": MapPinIcon,
    "cat-restaurant": FireIcon, // icon cho nhà hàng
};


export default function ResultPage() {
    const { category } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const locationQuery = searchParams.get("q") || "Quy Nhơn";

    const [selectedPlace, setSelectedPlace] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(category || "");
    const [destinationDetail, setDestinationDetail] = useState(null);

    const openModal = (place) => setSelectedPlace(place);
    const closeModal = () => setSelectedPlace(null);

    // Sync selectedCategory khi URL thay đổi
    useEffect(() => {
        setSelectedCategory(category || "");
    }, [category]);

    // Load categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await GetAllCategories();
                if (res) setCategories(res);
            } catch (err) {
                console.error("Lỗi load categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Load destination detail
    useEffect(() => {
        const fetchDestination = async () => {
            try {
                const res = await GetDestinationDetail("dest-quynhon");
                if (res) setDestinationDetail(res);
            } catch (err) {
                console.error("Lỗi load destination:", err);
            }
        };
        fetchDestination();
    }, [locationQuery]);

    // Filter function nếu muốn lọc theo category
    const filterPlaces = (placesList) => {
        if (!selectedCategory) return placesList;
        return placesList.filter((p) => p.category && String(p.category.id) === String(selectedCategory));
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white">
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-xl">
                        Khám phá {locationQuery}
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mt-4 opacity-90">
                        Gợi ý hành trình, địa điểm ăn uống và trải nghiệm đáng nhớ tại {locationQuery}.
                    </p>
                </div>
            </section>

            {/* Category Filter */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Khám phá theo danh mục</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {categories.map((cat) => {
                        const Icon = categoryIcons[cat.id];
                        const isActive = String(selectedCategory) === String(cat.id);

                        return (
                            <button
                                key={cat.id}
                                onClick={() =>
                                    navigate(`/category/${cat.id}?q=${encodeURIComponent(locationQuery)}`)
                                }
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 shadow-sm
                        ${isActive
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                                        : "bg-white hover:bg-gray-50 border-gray-200"
                                    }`}
                            >
                                {Icon && (
                                    <Icon
                                        className={`w-7 h-7 mb-2 ${isActive ? "text-white" : "text-blue-600"}`}
                                    />
                                )}
                                <span
                                    className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-700"}`}
                                >
                                    {cat.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>


            {/* Main Content */}
            <section className="container mx-auto py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: list */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Best Places */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Điểm đến nổi bật</h2>
                        {destinationDetail?.bestPlaces?.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {filterPlaces(destinationDetail.bestPlaces).map((p, index) => (
                                    <PlaceCard
                                        key={p.id}
                                        place={p}
                                        index={index + 1}
                                        onHover={(hoveredPlace) => setHoveredId(hoveredPlace?.id || null)}
                                        onClick={() => openModal(p)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Không có địa điểm nổi bật nào.</p>
                        )}
                    </div>

                    {/* Best Restaurants */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Nhà hàng nổi bật</h2>
                        {destinationDetail?.bestRestaurants?.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {filterPlaces(destinationDetail.bestRestaurants).map((r, index) => (
                                    <PlaceCard
                                        key={r.id}
                                        place={r}
                                        index={index + 1}
                                        onHover={(hoveredPlace) => setHoveredId(hoveredPlace?.id || null)}
                                        onClick={() => openModal(r)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Không có nhà hàng nổi bật nào.</p>
                        )}
                    </div>
                </div>

                {/* Right: Map */}
                <div className="lg:col-span-1 h-[600px] w-full">
                    <LocationMap
                        locations={[
                            ...(destinationDetail?.bestPlaces || []),
                            ...(destinationDetail?.bestRestaurants || [])
                        ]}
                        hoveredId={hoveredId}
                    />
                </div>
            </section>

            {/* Place Modal */}
            {selectedPlace && <PlaceModal place={selectedPlace} onClose={closeModal} />}
        </div>
    );
}
