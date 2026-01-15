import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Heart,
  PlusCircle,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Layers,
  Wind,
  Cloud,
  Sun,
  Moon,
  Coffee,
  Bike,
  Camera,
  Gift,
  Compass,
  Navigation,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import SearchBox from "../components/SearchBox";
import { GetAllDestinations, GetFeatured } from "../service/api.admin.service";
import { toast } from "sonner";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

export default function VietnamTravelExplore() {
  const [favorites, setFavorites] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState("destinations");

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const exploreRef = useRef(null);
  const seasonsRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);

  // Regions data
  const regions = [
    {
      id: "north",
      name: "Miền Bắc",
      description: "Sapa mù sương, Hạ Long hùng vĩ",
      color: "from-blue-600 to-cyan-600",
      icon: <Cloud className="w-6 h-6" />,
      image:
        "https://cdn-media.sforum.vn/storage/app/media/thanhhuyen/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20mi%E1%BB%81n%20b%E1%BA%AFc/1/anh-dep-mien-bac-9.jpg",
      highlight: "Núi non hùng vĩ, văn hóa lâu đời",
    },
    {
      id: "central",
      name: "Miền Trung",
      description: "Phố cổ Hội An, biển Đà Nẵng",
      color: "from-emerald-600 to-teal-600",
      icon: <Sun className="w-6 h-6" />,
      image:
        "https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_1000/v1763455931/vhzea04xapzjapnian5j.webp",
      highlight: "Di sản thế giới, biển đảo tuyệt đẹp",
    },
    {
      id: "south",
      name: "Miền Nam",
      description: "Phú Quốc đảo ngọc, Mekong xanh",
      color: "from-amber-600 to-orange-600",
      icon: <Wind className="w-6 h-6" />,
      image:
        "https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_1000/v1695727776/ecs7dv5wwtmazwuwfz03.webp",
      highlight: "Sông nước miệt vườn, ẩm thực phong phú",
    },
  ];

  // Activity types
  const activities = [
    {
      id: "culture",
      name: "Văn hóa & Lịch sử",
      icon: <Award className="w-6 h-6" />,
      color: "from-purple-500 to-violet-500",
      count: 24,
    },
    {
      id: "nature",
      name: "Thiên nhiên",
      icon: <Target className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      count: 36,
    },
    {
      id: "food",
      name: "Ẩm thực",
      icon: <Coffee className="w-6 h-6" />,
      color: "from-rose-500 to-pink-500",
      count: 18,
    },
    {
      id: "adventure",
      name: "Mạo hiểm",
      icon: <Bike className="w-6 h-6" />,
      color: "from-orange-500 to-red-500",
      count: 12,
    },
    {
      id: "relax",
      name: "Nghỉ dưỡng",
      icon: <Moon className="w-6 h-6" />,
      color: "from-blue-400 to-cyan-400",
      count: 28,
    },
    {
      id: "photo",
      name: "Chụp ảnh",
      icon: <Camera className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-500",
      count: 32,
    },
  ];

  // Seasons data
  const seasons = [
    {
      id: "spring",
      name: "Xuân",
      months: "Tháng 1 - 3",
      description: "Lễ hội, hoa nở rộ",
      color: "from-pink-500 to-rose-500",
      bestFor: ["Lễ hội", "Hoa đào", "Du xuân"],
      temperature: "18-25°C",
    },
    {
      id: "summer",
      name: "Hè",
      months: "Tháng 4 - 6",
      description: "Biển đẹp, du lịch gia đình",
      color: "from-yellow-500 to-orange-500",
      bestFor: ["Biển", "Du lịch gia đình", "Trượt nước"],
      temperature: "28-35°C",
    },
    {
      id: "autumn",
      name: "Thu",
      months: "Tháng 7 - 9",
      description: "Mát mẻ, cảnh đẹp",
      color: "from-amber-500 to-yellow-500",
      bestFor: ["Khám phá", "Ảnh đẹp", "Dã ngoại"],
      temperature: "22-28°C",
    },
    {
      id: "winter",
      name: "Đông",
      months: "Tháng 10 - 12",
      description: "Lạnh, đặc biệt miền Bắc",
      color: "from-blue-500 to-cyan-500",
      bestFor: ["Sapa", "Đà Lạt", "Núi tuyết"],
      temperature: "10-20°C",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allDestinationsRes, featuredRes] = await Promise.all([
          GetAllDestinations(),
          GetFeatured(),
        ]);

        setDestinations(allDestinationsRes || []);
        setFeaturedDestinations(
          featuredRes || allDestinationsRes?.slice(0, 6) || []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleScrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div ref={containerRef} className="relative">
      {/* Hero Section với Parallax */}
      <motion.section
        ref={heroRef}
        id="hero"
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Video/Image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="absolute inset-0 bg-[url('imgs/bg11.jpg')] bg-cover bg-center"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 py-32">
          <div className="text-center">
            {/* Animated Title */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 leading-tight">
                <span className="block">VIỆT NAM</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
                  HỒN NHIÊN
                </span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Nơi hội tụ của núi non hùng vĩ, biển cả mênh mông và những nụ
                cười chân thành
              </p>
            </motion.div>

            {/* Interactive Search */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mx-auto mb-12"
            >
              <div className="relative group">
                <SearchBox
                  placeholder="Khám phá điểm đến tuyệt vời của Việt Nam..."
                  className="shadow-2xl rounded-3xl border-2 border-white/20 backdrop-blur-sm bg-white/10"
                  inputClassName="text-white placeholder-white/60 text-lg py-6 pl-6 pr-20"
                  onSelect={(place) => navigate(`/destination/${place.id}`)}
                />
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { label: "Di sản UNESCO", value: "8", suffix: "" },
                {
                  label: "Điểm đến",
                  value: "60",
                  suffix: "+",
                },
                { label: "Món ăn đặc sản", value: "3000", suffix: "+" },
                { label: "Lễ hội truyền thống", value: "8000", suffix: "+" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.value}
                    <span className="text-amber-400">{stat.suffix}</span>
                  </div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <button
                onClick={() => handleScrollToSection("regions")}
                className="flex flex-col items-center text-white/60 hover:text-white transition-colors"
              >
                <span className="text-sm mb-2">Khám phá thêm</span>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.div>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Regions Section */}
      <section
        id="regions"
        className="py-20 bg-gradient-to-b from-white to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Ba Miền{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Một Đất Nước
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Mỗi miền đất Việt Nam mang một nét đẹp riêng, tạo nên bức tranh đa
              sắc màu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {regions.map((region, index) => (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl shadow-2xl"
              >
                <div className="relative h-96 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${region.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-r ${region.color} w-fit mb-4`}
                    >
                      {region.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {region.name}
                    </h3>
                    <p className="text-white/90 mb-4">{region.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                        {region.highlight}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Side - Tabs */}
            <div className="lg:w-2/5">
              <div className="sticky top-24">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">
                  Trải nghiệm{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                    Đa Dạng
                  </span>
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      id: "destinations",
                      label: "Điểm đến nổi bật",
                      icon: <MapPin className="w-5 h-5" />,
                    },
                    {
                      id: "activities",
                      label: "Hoạt động phổ biến",
                      icon: <Compass className="w-5 h-5" />,
                    },
                    {
                      id: "seasons",
                      label: "Mùa du lịch",
                      icon: <Calendar className="w-5 h-5" />,
                    },
                    {
                      id: "itineraries",
                      label: "Lộ trình đề xuất",
                      icon: <Navigation className="w-5 h-5" />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-4 w-full p-6 rounded-2xl transition-all ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg"
                          : "hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tab.icon}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="lg:w-3/5">
              <AnimatePresence mode="wait">
                {activeTab === "destinations" && (
                  <motion.div
                    key="destinations"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-3xl font-bold text-gray-900">
                        Điểm đến đang thịnh hành
                      </h3>

                      <button
                        onClick={() => navigate("/destinations")}
                        className="group inline-flex items-center gap-2 rounded-full
               border border-gray-200 bg-white px-5 py-2.5
               text-sm font-medium text-gray-700
               hover:bg-gray-900 hover:text-white
               transition-all duration-300
               whitespace-nowrap"
                      >
                        Xem tất cả
                        <span className="transform transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {featuredDestinations.slice(0, 4).map((dest, idx) => (
                        <div
                          key={dest.id}
                          onClick={() => navigate(`/destination/${dest.id}`)}
                          className="group relative overflow-hidden rounded-2xl"
                        >
                          <div className="relative h-64">
                            <img
                              src={
                                dest.mainImage ||
                                "/imgs/default-destination.jpg"
                              }
                              alt={dest.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <h4 className="text-xl font-bold text-white">
                                {dest.name}
                              </h4>
                              <p className="text-white/80 text-sm">
                                {dest.description?.slice(0, 80)}...
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "activities" && (
                  <motion.div
                    key="activities"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <h3 className="text-3xl font-bold text-gray-900">
                      Trải nghiệm không thể bỏ lỡ
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="group p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl hover:border-blue-300 transition-all hover:shadow-xl"
                        >
                          <div className="my-2">
                            <div
                              className={`p-3 rounded-xl bg-gradient-to-r ${activity.color} w-fit mb-4`}
                            >
                              {activity.icon}
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">
                              {activity.name}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "seasons" && (
                  <motion.div
                    key="seasons"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <h3 className="text-3xl font-bold text-gray-900">
                      Du lịch theo mùa
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {seasons.map((season) => (
                        <div
                          key={season.id}
                          className="p-8 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50"
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                                {season.name}
                              </h4>
                              <div className="text-gray-600">
                                {season.months}
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-700">
                              {season.temperature}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-6">
                            {season.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {season.bestFor.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section với 3D Effect */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/imgs/bg22.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <Sparkles className="w-16 h-16 text-white mx-auto mb-8" />
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Sẵn sàng viết nên{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">
              câu chuyện
            </span>{" "}
            của bạn?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
            Mỗi hành trình tại Việt Nam là một câu chuyện đáng nhớ. Hãy để chúng
            tôi giúp bạn viết nên câu chuyện của riêng mình.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate("/trip-planner")}
              className="group relative px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl text-lg transition-all hover:scale-105 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center gap-3">
                <PlusCircle className="w-6 h-6" />
                Bắt đầu lập kế hoạch
              </span>
            </button>

            <button
              onClick={() => navigate("/destinations")}
              className="px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-2xl text-lg transition-all hover:scale-105"
            >
              <span className="flex items-center gap-3">
                <Compass className="w-5 h-5" />
                Khám phá điểm đến
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
