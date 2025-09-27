import { useState } from "react";
import {
  ArrowRight,
  Compass,
  Map,
  Share2,
  Calendar,
  Star,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import DestinationCard from "../components/DestinationCard.jsx";
import { popularDestinations } from "../data/destinations.js";
import Footer from "../components/Footer.jsx";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("search");

  const features = [
    {
      icon: Compass,
      title: "Khám phá",
      desc: "Tìm địa điểm, nhà hàng và trải nghiệm thú vị cho chuyến đi.",
    },
    {
      icon: Calendar,
      title: "Lên kế hoạch",
      desc: "Sắp xếp lịch trình từng ngày theo sở thích của bạn.",
    },
    {
      icon: Map,
      title: "Bản đồ trực quan",
      desc: "Theo dõi hành trình và tìm đường đi dễ dàng.",
    },
    {
      icon: Share2,
      title: "Chia sẻ",
      desc: "Xuất và gửi lịch trình cho bạn bè đồng hành.",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "Traveler",
      quote:
        "GoTogether giúp tôi tiết kiệm thời gian và lên kế hoạch chi tiết cho chuyến du lịch Đà Nẵng chỉ trong vài phút.",
      rating: 5,
    },
    {
      name: "Lê Văn Nam",
      role: "Backpacker",
      quote:
        "Giao diện đẹp, dễ dùng và bản đồ trực quan khiến việc đi phượt cùng bạn bè trở nên dễ dàng hơn rất nhiều.",
      rating: 4,
    },
  ];

  const itineraries = [
    {
      id: 1,
      title: "Khám phá Đà Nẵng 3N2Đ",
      startDate: "2025-10-01",
      endDate: "2025-10-03",
      items: 6,
    },
    {
      id: 2,
      title: "Hà Nội cổ kính 4N3Đ",
      startDate: "2025-11-05",
      endDate: "2025-11-08",
      items: 8,
    },
    {
      id: 3,
      title: "Phú Quốc nghỉ dưỡng 5N4Đ",
      startDate: "2025-12-20",
      endDate: "2025-12-24",
      items: 10,
    },
  ];

  return (
    <div className="min-h-screen background-pattern">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-700 via-sky-600 to-sky-500 py-24 lg:py-32 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Khám phá thế giới <br />
              <span className="text-yellow-300">dễ dàng & thông minh</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-100 mb-10 max-w-lg">
              Lên kế hoạch hành trình nhanh chóng, gợi ý thông minh, tối ưu trải
              nghiệm du lịch.
            </p>
            <Link to="/trip-planner">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-lg px-8 py-4 rounded-full inline-flex items-center gap-3 shadow-xl"
              >
                Bắt đầu ngay
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative flex justify-center items-center"
          >
            {/* Circle gradient background */}
            <div className="absolute w-[28rem] h-[28rem] bg-gradient-to-tr from-yellow-200/70 to-pink-200/60 rounded-full -z-10 blur-2xl"></div>

            {/* Main travel image */}
            <img
              src="/imgs/travelvietnam.jpg"
              alt="Travel"
              className="w-80 h-80 object-cover rounded-full shadow-2xl border-8 border-white"
            />

            {/* Floating small images/icons */}
            <img
              src="/icons/lotus.png"
              alt="Plane"
              className="absolute top-10 -left-6 w-16 h-16 rounded-full shadow-lg bg-white p-1"
            />
            <img
              src="/icons/vietnam-flag.png"
              alt="Beach"
              className="absolute bottom-12 -right-8 w-20 h-20 rounded-full shadow-lg bg-white p-2"
            />
            <img
              src="/icons/woman.png"
              alt="Map"
              className="absolute -bottom-6 left-14 w-14 h-14 rounded-full shadow-md bg-white p-1"
            />
          </motion.div>
        </div>
      </section>
      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6 shadow hover:shadow-lg"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-600 text-sm mt-2">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
      {/* Popular Destinations */}
      <section section className="py-20 bg-white">
        <div className="container-custom text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Điểm đến phổ biến
          </h2>
          <p className="text-slate-600">
            Hãy để những điểm đến tuyệt vời này truyền cảm hứng cho bạn.
          </p>
        </div>
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDestinations.map((d, idx) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <DestinationCard destination={d} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section section className="py-20 bg-slate-50">
        <div className="container-custom text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Người dùng nói gì?
          </h2>
          <p className="text-slate-600">
            Hàng ngàn người đã trải nghiệm GoTogether cho chuyến đi của họ.
          </p>
        </div>
        <div className="container-custom grid md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg"
            >
              <p className="text-slate-700 italic mb-4">"{t.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">{t.name}</h4>
                  <span className="text-sm text-slate-500">{t.role}</span>
                </div>
                <div className="flex gap-1 text-yellow-400">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        section
        className="py-20 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container-custom"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn sàng cho chuyến đi đáng nhớ?
          </h2>
          <p className="text-lg mb-8">
            Hãy bắt đầu lên kế hoạch ngay hôm nay với GoTogether.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary text-lg px-8 py-4"
          >
            Bắt đầu miễn phí
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
