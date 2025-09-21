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
      <Header setActiveSection={setActiveSection} />

      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Lên kế hoạch du lịch <br />
            <span className="text-yellow-300">dễ dàng & thông minh</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-100 mb-8">
            Chỉ vài bước đơn giản, bạn sẽ có lịch trình hoàn hảo cho kỳ nghỉ.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3 group"
          >
            Bắt đầu ngay
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
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

      {/* Itineraries List */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Lịch trình gợi ý
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Xem các lịch trình mẫu để lấy cảm hứng cho chuyến đi của bạn.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary, idx) => (
              <motion.div
                key={itinerary.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between hover:shadow-lg"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {itinerary.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-2">
                    📅 {itinerary.startDate} → {itinerary.endDate}
                  </p>
                  <p className="text-slate-600 text-sm">
                    📌 {itinerary.items} hoạt động
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 btn-primary w-full"
                >
                  Xem chi tiết
                </motion.button>
              </motion.div>
            ))}

            {/* Card tạo lịch trình mới */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: itineraries.length * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center text-center hover:shadow-lg"
            >
              <Plus className="w-10 h-10 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Tạo lịch trình mới
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Lên kế hoạch cho chuyến đi của riêng bạn.
              </p>
              <Link to="/itineraries/new" className="btn-primary w-full">
                Bắt đầu
              </Link>
            </motion.div>
          </div>
        </div>
      </section >

      {/* Popular Destinations */}
      <section section className="py-20 bg-white" >
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
      </section >

      {/* Testimonials */}
      <section section className="py-20 bg-slate-50" >
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
      </section >

      {/* CTA */}
      <section section className="py-20 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-center" >
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
      </section >

      <Footer />
    </div >
  );
}
