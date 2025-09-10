import { useState } from 'react';
import { ArrowRight, Compass, Map, Share2, Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import DestinationCard from '../components/DestinationCard.jsx';
import { popularDestinations } from '../data/destinations.js';

export default function HomePage() {
    const [activeSection, setActiveSection] = useState('search');

    const howItWorksSteps = [
        {
            icon: Compass,
            title: 'Tìm kiếm & Khám phá',
            description: 'Khám phá những địa điểm, nhà hàng và điểm tham quan thú vị cho chuyến đi của bạn.'
        },
        {
            icon: Calendar,
            title: 'Lên kế hoạch ngày',
            description: 'Sắp xếp các điểm đến thành lịch trình từng ngày với gợi ý thông minh.'
        },
        {
            icon: Map,
            title: 'Xem trên bản đồ',
            description: 'Theo dõi toàn bộ hành trình và tìm đường đi giữa các điểm.'
        },
        {
            icon: Share2,
            title: 'Chia sẻ & Bắt đầu',
            description: 'Xuất lịch trình và chia sẻ cùng bạn đồng hành.'
        }
    ];

    const testimonials = [
        {
            name: 'Nguyễn Minh Anh',
            role: 'Traveler',
            quote: 'GoTogether giúp tôi tiết kiệm thời gian và lên kế hoạch chi tiết cho chuyến du lịch Đà Nẵng chỉ trong vài phút.',
            rating: 5
        },
        {
            name: 'Lê Văn Nam',
            role: 'Backpacker',
            quote: 'Giao diện đẹp, dễ dùng và bản đồ trực quan khiến việc đi phượt cùng bạn bè trở nên dễ dàng hơn rất nhiều.',
            rating: 4
        }
    ];

    return (
        <div className="min-h-screen background-pattern">
            <Header setActiveSection={setActiveSection} />

            {/* Hero Section */}
            <section className="relative py-20 lg:py-28 bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container-custom text-center max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Lên kế hoạch chuyến đi của bạn <br />
                        <span className="text-yellow-300">dễ dàng & thông minh</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-100 mb-8 leading-relaxed">
                        Chỉ với vài bước đơn giản, bạn sẽ có ngay một lịch trình hoàn hảo cho kỳ nghỉ sắp tới.
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

            {/* Popular Destinations */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Điểm đến phổ biến</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Hãy để những điểm đến tuyệt vời này truyền cảm hứng cho bạn và bắt đầu hành trình sắp tới.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {popularDestinations.map((destination, idx) => (
                            <motion.div
                                key={destination.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <DestinationCard destination={destination} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-slate-50">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Cách hoạt động</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Chỉ 4 bước đơn giản để bạn có ngay chuyến đi mơ ước.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {howItWorksSteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition"
                                >
                                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl flex items-center justify-center">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                                    <p className="text-slate-600 text-sm">{step.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Người dùng nói gì?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Hàng ngàn người đã trải nghiệm GoTogether cho chuyến đi của họ.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                whileHover={{ scale: 1.03 }}
                                className="bg-slate-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition"
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
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-center">
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
                    <p className="text-lg mb-8">Hãy bắt đầu lên kế hoạch ngay hôm nay với GoTogether.</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-secondary text-lg px-8 py-4"
                    >
                        Bắt đầu miễn phí
                    </motion.button>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-slate-900">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Compass className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">GoTogether</span>
                        </div>
                        <div className="flex items-center gap-8 text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
                            <a href="#" className="hover:text-white transition-colors">Chính sách</a>
                            <a href="#" className="hover:text-white transition-colors">Hỗ trợ</a>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500">
                        <p>&copy; 2025 GoTogether. Bảo lưu mọi quyền.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
